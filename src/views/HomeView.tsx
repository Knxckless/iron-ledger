// Dashboard: Stats, Muskel-Heatmap + Balance, Körpermetriken, Aktivitäts-Grid,
// Backup (Export/Import).

import { useMemo, useState, useRef } from 'react';
import {
  Flame, Calendar, ArrowRight, Zap, Trophy, Scale, Trash2,
  ChevronDown, ChevronUp, Settings, Download, Upload, AlertTriangle,
  Utensils, Plus, Check, X, ListChecks,
} from 'lucide-react';
import {
  LineChart, Line, YAxis, XAxis, ResponsiveContainer, Tooltip, ReferenceArea, ReferenceLine, Label,
} from 'recharts';
import { BodyHeatmap } from '../components/BodyHeatmap';
import { RoutineSettings } from '../components/RoutineSettings';
import { workoutLabel, DIET_PHASE_INFO } from '../data/model';
import type { DietPhaseType } from '../data/model';
import { CATEGORY_LABELS, CATEGORY_COLORS, MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleCategory } from '../data/muscles';
import {
  computeMuscleStats, computeBalance, muscleLabel, round1,
  weeklySetsPerMuscle, WEEKLY_SET_TARGET, dietPhaseProgress,
} from '../lib/stats';
import { exportBackup, importBackup, resetAll, METRIC_INFO } from '../lib/storage';
import type { MetricId } from '../lib/storage';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
  onStartTraining: (templateId?: string) => void;
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

const MUSCLE_RANGES = [
  { label: 'Woche', days: 7 },
  { label: '4 Wochen', days: 28 },
  { label: '3 Monate', days: 90 },
];

export function HomeView({ ledger, onStartTraining }: Props) {
  const { workouts, templates, routines, settings, exercisesByName, metrics, addMetric, deleteMetric, reload,
    dietPhases, addDietPhase, deleteDietPhase } = ledger;

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [muscleRange, setMuscleRange] = useState(28);
  const [showSettings, setShowSettings] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState(0);   // 0 = zu, 1 = 1. Warnung, 2 = letzte Warnung
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Körpermetriken
  const [metricId, setMetricId] = useState<MetricId>('weight');
  const [bmDate, setBmDate] = useState(isoDate(new Date()));
  const [bmValue, setBmValue] = useState('');
  const [bmExpanded, setBmExpanded] = useState(true);

  // Diätphasen (nur Gewicht)
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseType, setPhaseType] = useState<DietPhaseType>('cut');
  const [phaseStart, setPhaseStart] = useState(isoDate(new Date()));
  const [phaseEnd, setPhaseEnd] = useState('');
  const [phaseTarget, setPhaseTarget] = useState('');

  const stats = useMemo(() => {
    const total = workouts.length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const lastWorkout = workouts[0];

    // Streak in Wochen: aufeinanderfolgende Kalenderwochen mit ≥1 Training
    const weekKeys = new Set(
      workouts.map(w => {
        const d = new Date(w.date);
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return isoDate(monday);
      })
    );
    let streak = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    while (weekKeys.has(isoDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 7);
    }

    return { total, thisWeek, lastWorkout, streak };
  }, [workouts]);

  // "Heute dran": bei aktiver Routine das nächste Workout (nach dem zuletzt
  // gemachten, in Routinen-Reihenfolge) + dessen letzte Übungen.
  const nextUp = useMemo(() => {
    const routine = routines.find(r => r.id === settings.activeRoutineId);
    if (!routine || routine.templateIds.length === 0) return null;
    const tpls = routine.templateIds
      .map(id => templates.find(t => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t);
    if (tpls.length === 0) return null;

    const belongs = (w: typeof workouts[number], tpl: typeof tpls[number]) =>
      w.templateId === tpl.id || (!!tpl.preset && w.type === tpl.preset);

    // jüngstes Training, das zu einem Routine-Workout gehört
    let lastPos = -1, lastDate = '';
    for (const w of workouts) {
      const idx = tpls.findIndex(t => belongs(w, t));
      if (idx >= 0 && w.date >= lastDate) { lastDate = w.date; lastPos = idx; }
    }
    const next = tpls[lastPos < 0 ? 0 : (lastPos + 1) % tpls.length];

    const sessions = workouts.filter(w => belongs(w, next)).sort((a, b) => b.date.localeCompare(a.date));
    const last = sessions[0];
    const exercises = last
      ? last.exercises.map(ex => {
          const valid = ex.sets.filter(s => s.weight > 0 && s.reps > 0);
          return { name: ex.name, setCount: valid.length, top: valid.reduce((m, s) => Math.max(m, s.weight), 0) };
        })
      : next.exerciseNames.map(n => ({ name: n, setCount: 0, top: 0 }));
    return { workout: next, exercises, lastDate: last?.date, routineName: routine.name };
  }, [routines, settings, templates, workouts]);

  // Muskel-Tracking im gewählten Zeitraum
  const { muscleStats, balance } = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - muscleRange);
    const ms = computeMuscleStats(workouts, exercisesByName, isoDate(from));
    return { muscleStats: ms, balance: computeBalance(ms) };
  }, [workouts, exercisesByName, muscleRange]);

  const totalCategoryVolume = Object.values(balance.categoryVolume).reduce((a, b) => a + b, 0);

  // Ø gewichtete Sätze pro Muskel pro Woche + was dem Wochenziel hinterherhinkt
  const weeklyLoad = useMemo(
    () => weeklySetsPerMuscle(muscleStats, muscleRange).sort((a, b) => b.perWeek - a.perWeek),
    [muscleStats, muscleRange]
  );
  const lagging = useMemo(
    () => weeklyLoad.filter(w => w.status === 'low').sort((a, b) => a.perWeek - b.perWeek),
    [weeklyLoad]
  );

  // 12-Wochen-Aktivitätsgrid
  const heatmap = useMemo(() => {
    const weeks: { label: string; days: { date: string; count: number }[] }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dateStr = isoDate(date);
        days.push({ date: dateStr, count: workouts.filter(wk => wk.date === dateStr).length });
      }
      weeks.push({ label: `${weekStart.getDate()}.${weekStart.getMonth() + 1}`, days });
    }
    return weeks;
  }, [workouts]);


  // Neueste zuerst — unabhängig von der Speicherreihenfolge (Import kann abweichen)
  const metricEntries = useMemo(
    () => metrics.filter(m => m.metric === metricId).sort((a, b) => b.date.localeCompare(a.date)),
    [metrics, metricId]
  );

  // Gesamtänderung = neuester − ältester Wert
  const metricDelta = useMemo(() => {
    if (metricEntries.length < 2) return null;
    return round1(metricEntries[0].value - metricEntries[metricEntries.length - 1].value);
  }, [metricEntries]);

  // Gewichtspunkte aufsteigend für Chart + Phasen-Fortschritt
  const weightPoints = useMemo(
    () => metrics.filter(m => m.metric === 'weight')
      .map(m => ({ date: m.date, value: m.value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [metrics]
  );
  const weightChart = useMemo(() => weightPoints.slice(-40), [weightPoints]);

  // Aktive Phase = deckt heute ab; bei mehreren die mit spätestem Start
  const todayIso = isoDate(new Date());
  const activePhase = useMemo(() => {
    const covering = dietPhases
      .filter(p => p.startDate <= todayIso && (!p.endDate || p.endDate >= todayIso))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return covering[0] ?? null;
  }, [dietPhases, todayIso]);
  const activeProgress = useMemo(
    () => activePhase ? dietPhaseProgress(activePhase, weightPoints, todayIso) : null,
    [activePhase, weightPoints, todayIso]
  );

  // Phasen auf sichtbare Chart-Datenpunkte klemmen (kategoriale X-Achse)
  const phaseBands = useMemo(() => {
    if (weightChart.length < 2) return [];
    const dates = weightChart.map(p => p.date);
    const firstD = dates[0], lastD = dates[dates.length - 1];
    return dietPhases
      .map(p => {
        const start = p.startDate < firstD ? firstD : p.startDate;
        const end = (p.endDate && p.endDate < lastD ? p.endDate : lastD);
        if (start > lastD || end < firstD || start > end) return null;
        const x1 = dates.find(d => d >= start);
        const x2 = [...dates].reverse().find(d => d <= end);
        if (!x1 || !x2) return null;
        return { id: p.id, x1, x2, color: DIET_PHASE_INFO[p.type].color, target: p.targetWeight };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
  }, [dietPhases, weightChart]);

  const handleAddPhase = () => {
    if (!phaseStart) return;
    const target = parseFloat(phaseTarget);
    addDietPhase({
      type: phaseType,
      startDate: phaseStart,
      endDate: phaseEnd || undefined,
      targetWeight: !isNaN(target) && target > 0 ? target : undefined,
    });
    setPhaseEnd('');
    setPhaseTarget('');
    setShowPhaseForm(false);
  };

  const handleExport = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-ledger-backup-${isoDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackup(String(reader.result));
      if (result.ok) {
        reload();
        setImportMsg('Backup importiert ✓');
      } else {
        setImportMsg(result.error || 'Import fehlgeschlagen');
      }
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    // Sicherheitsnetz: erst automatisch ein Backup herunterladen …
    handleExport();
    // … dann kurz warten (Download muss starten), löschen und neu laden.
    setResetStep(0);
    setTimeout(() => {
      resetAll();
      window.location.reload();
    }, 900);
  };

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const info = METRIC_INFO[metricId];

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-5 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl tracking-wider text-text font-display">IRON</h1>
            <h1 className="text-3xl tracking-wider text-text font-display -mt-1">LEDGER</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors ${showSettings ? 'text-accent' : 'text-text-muted hover:text-text'}`}
            aria-label="Einstellungen">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <p className="text-text-dim text-xs uppercase tracking-widest font-mono">{today}</p>
      </div>

      {/* EINSTELLUNGEN */}
      {showSettings && <RoutineSettings ledger={ledger} />}

      {/* BACKUP-PANEL */}
      {showSettings && (
        <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase mb-2">Backup</h3>
          <p className="text-[10px] text-text-dim font-mono mb-3">
            Alle Daten liegen nur lokal auf diesem Gerät. Regelmäßig exportieren!
          </p>
          <div className="flex gap-2">
            <button onClick={handleExport} className="brutal-btn brutal-btn-accent flex-1 py-2.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }} />
          </div>
          {importMsg && (
            <p className="text-[10px] font-mono mt-2"
              style={{ color: importMsg.includes('✓') ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {importMsg}
            </p>
          )}

          {/* Werksreset — zwei Bestätigungen + automatischer Backup-Download */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-steel-light)' }}>
            {resetStep === 0 && (
              <button onClick={() => setResetStep(1)}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-display
                  tracking-wider uppercase text-danger hover:text-red-300 transition-colors border border-danger">
                <Trash2 className="w-3.5 h-3.5" /> Alle Daten zurücksetzen
              </button>
            )}

            {resetStep === 1 && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] text-text-dim font-mono">
                  <span className="text-danger font-bold">Schritt 1 von 2.</span> Das löscht alle
                  Workouts, Übungen, Maße, Diätphasen und Routinen. Vorher wird automatisch ein
                  Backup heruntergeladen.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setResetStep(2)}
                    className="brutal-btn flex-1 py-2.5 text-xs"
                    style={{ backgroundColor: 'var(--color-warning)', color: '#000' }}>Weiter</button>
                  <button onClick={() => setResetStep(0)}
                    className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">Abbrechen</button>
                </div>
              </div>
            )}

            {resetStep === 2 && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-mono">
                  <span className="text-danger font-bold">Schritt 2 von 2 — endgültig.</span>{' '}
                  <span className="text-text-dim">Das kann nicht rückgängig gemacht werden. Beim
                    Klick lädt zuerst dein Backup (JSON) herunter, danach werden alle Daten gelöscht.</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={handleReset}
                    className="brutal-btn flex-1 py-2.5 text-xs"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                    <Download className="w-3.5 h-3.5" /> Backup laden & löschen
                  </button>
                  <button onClick={() => setResetStep(0)}
                    className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">Abbrechen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEUTE DRAN — nächstes Workout der aktiven Routine */}
      {nextUp && (
        <button onClick={() => onStartTraining(nextUp.workout.id)}
          className="w-full text-left brutal-card-sm p-3 mb-5 animate-slide-up hover:brightness-110 transition-all"
          style={{ borderLeft: `4px solid ${nextUp.workout.color}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <ListChecks className="w-4 h-4 flex-shrink-0" style={{ color: nextUp.workout.color }} />
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Heute dran</span>
              <span className="text-sm font-bold text-text font-display tracking-wider truncate">{nextUp.workout.name}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-display tracking-wider uppercase flex-shrink-0"
              style={{ color: nextUp.workout.color }}>
              Start <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          {nextUp.exercises.length > 0 ? (
            <div className="space-y-0.5">
              {nextUp.exercises.map((e, i) => (
                <div key={`${e.name}-${i}`} className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-text-muted w-4 text-right">{i + 1}.</span>
                  <span className="text-text-dim flex-1 truncate">{e.name}</span>
                  {e.setCount > 0 && (
                    <span className="px-1.5 py-0.5 border text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-concrete)', borderColor: '#3d3d3d', color: 'var(--color-text)' }}>
                      {e.setCount}×
                    </span>
                  )}
                  {e.top > 0 && <span className="text-accent w-12 text-right">{e.top}kg</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-text-muted font-mono">Noch keine Übungen — im Training zusammenstellen.</p>
          )}
          {nextUp.lastDate && (
            <p className="text-[9px] text-text-muted font-mono mt-1.5">
              zuletzt {new Date(nextUp.lastDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · Routine {nextUp.routineName}
            </p>
          )}
        </button>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { icon: Flame, value: stats.total, label: 'Total', color: 'var(--color-accent)' },
          { icon: Zap, value: stats.thisWeek, label: 'Woche', color: 'var(--color-warning)' },
          { icon: Calendar, value: stats.streak, label: 'Streak', color: 'var(--color-success)' },
          { icon: Trophy, value: stats.lastWorkout ? workoutLabel(stats.lastWorkout) : '--', label: 'Letztes', color: 'var(--color-accent)' },
        ].map((s, i) => (
          <div key={s.label} className="brutal-card-sm p-2 text-center animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <span className="stat-number block text-text"
              style={{ fontSize: typeof s.value === 'number' ? '1.4rem' : '0.85rem', lineHeight: '1.4rem' }}>
              {s.value}
            </span>
            <span className="text-[9px] text-text-muted uppercase tracking-wider font-display">{s.label}</span>
          </div>
        ))}
      </div>

      {/* MUSKEL-HEATMAP + BALANCE */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Muskel-Tracking</h3>
          <div className="flex gap-1">
            {MUSCLE_RANGES.map(r => (
              <button key={r.days} onClick={() => setMuscleRange(r.days)}
                className={`brutal-chip px-2 py-1 text-[9px] ${muscleRange === r.days ? 'active' : ''}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <BodyHeatmap stats={muscleStats} />

        {/* Kategorie-Balance */}
        {totalCategoryVolume > 0 && (
          <div className="mt-4 space-y-1.5">
            {(Object.keys(balance.categoryVolume) as MuscleCategory[]).map(cat => {
              const vol = balance.categoryVolume[cat];
              const pct = totalCategoryVolume > 0 ? vol / totalCategoryVolume : 0;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[9px] text-text-dim font-mono uppercase w-10">{CATEGORY_LABELS[cat]}</span>
                  <div className="flex-1 h-2.5 border border-black" style={{ backgroundColor: 'var(--color-concrete)' }}>
                    <div className="h-full transition-all duration-500"
                      style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: CATEGORY_COLORS[cat] }} />
                  </div>
                  <span className="text-[9px] text-text-muted font-mono w-8 text-right">{Math.round(pct * 100)}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Ø Sätze pro Muskel pro Woche */}
        {totalCategoryVolume > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="section-label">Ø Sätze / Woche</span>
              <span className="text-[9px] text-text-muted font-mono">Ziel ≥ {WEEKLY_SET_TARGET} · gewichtet</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {weeklyLoad.map(w => {
                const col = w.status === 'ok' ? 'var(--color-success)'
                  : w.status === 'low' ? 'var(--color-warning)' : 'var(--color-text-muted)';
                const frac = Math.min(w.perWeek / WEEKLY_SET_TARGET, 1);
                return (
                  <div key={w.muscle} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-dim font-mono truncate flex-1"
                      title={MUSCLE_BY_ID[w.muscle].label}>
                      {MUSCLE_BY_ID[w.muscle].short}
                    </span>
                    <div className="w-10 h-1.5 border border-black flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-concrete)' }}>
                      <div className="h-full" style={{ width: `${frac * 100}%`, backgroundColor: col }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold w-7 text-right" style={{ color: col }}>
                      {round1(w.perWeek)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Balance-Hinweise + Volumen-Ermahnung */}
        <div className="mt-3 space-y-1.5">
          {balance.pushPullRatio !== null && isFinite(balance.pushPullRatio) &&
            (balance.pushPullRatio > 1.5 || balance.pushPullRatio < 0.67) && (
            <div className="brutal-card-inset px-2.5 py-1.5 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <span className="text-[10px] text-text-dim font-mono">
                Push/Pull-Ratio {round1(balance.pushPullRatio)} —
                {balance.pushPullRatio > 1.5 ? ' Push-lastig, mehr Rücken einplanen' : ' Pull-lastig, mehr Drücken einplanen'}
              </span>
            </div>
          )}
          {balance.neglected.length > 0 && balance.neglected.length <= 6 && (
            <div className="brutal-card-inset px-2.5 py-1.5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-text-dim font-mono">
                Nicht trainiert: {balance.neglected.map(muscleLabel).join(', ')}
              </span>
            </div>
          )}
          {lagging.length > 0 && (
            <div className="brutal-card-inset px-2.5 py-1.5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-text-dim font-mono">
                Hinkt hinterher (unter {WEEKLY_SET_TARGET}/Woche):{' '}
                {lagging.slice(0, 6).map(w => `${MUSCLE_BY_ID[w.muscle].short} (${round1(w.perWeek)})`).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KÖRPERMETRIKEN */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up stagger-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Körpermaße</h3>
            {metricDelta !== null && (
              <span className="text-[10px] font-mono font-bold"
                style={{ color: metricDelta <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {metricDelta > 0 ? '+' : ''}{metricDelta} {info.unit} gesamt
              </span>
            )}
          </div>
          <button onClick={() => setBmExpanded(!bmExpanded)}
            className="text-text-muted hover:text-text transition-colors p-1">
            {bmExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {bmExpanded && (
          <>
            <div className="flex flex-wrap gap-1 mb-3">
              {(Object.keys(METRIC_INFO) as MetricId[]).map(id => (
                <button key={id} onClick={() => setMetricId(id)}
                  className={`brutal-chip px-2.5 py-1 text-[10px] whitespace-nowrap ${metricId === id ? 'active' : ''}`}>
                  {METRIC_INFO[id].label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input type="date" value={bmDate} onChange={e => setBmDate(e.target.value)}
                className="brutal-input px-2 py-2 text-xs font-mono flex-1 min-w-0" />
              <input type="number" inputMode="decimal" placeholder={info.unit}
                value={bmValue} onChange={e => setBmValue(e.target.value)}
                className="brutal-input w-20 px-2 py-2 text-sm text-center font-mono" />
              <button
                onClick={() => {
                  const v = parseFloat(bmValue);
                  if (!isNaN(v) && v > 0) { addMetric(metricId, bmDate, v); setBmValue(''); }
                }}
                disabled={!bmValue.trim() || isNaN(parseFloat(bmValue))}
                className="brutal-btn brutal-btn-accent px-3 py-2 text-xs">OK</button>
            </div>

            {/* Chart: für Gewicht mit Phasen-Bändern, sonst Sparkline */}
            {metricId === 'weight' && weightChart.length >= 2 ? (
              <div className="mb-3 brutal-card-inset p-2" style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <LineChart data={weightChart}>
                    {phaseBands.map(b => (
                      <ReferenceArea key={b.id} x1={b.x1} x2={b.x2}
                        fill={b.color} fillOpacity={0.14} stroke={b.color} strokeOpacity={0.3} />
                    ))}
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} width={30}
                      stroke="#666" fontSize={9} fontFamily="DM Mono" />
                    {activePhase?.targetWeight && (
                      <ReferenceLine y={activePhase.targetWeight}
                        stroke={DIET_PHASE_INFO[activePhase.type].color} strokeDasharray="5 3">
                        <Label value={`Ziel ${activePhase.targetWeight}kg`} position="insideBottomRight"
                          fill={DIET_PHASE_INFO[activePhase.type].color} fontSize={9} fontFamily="DM Mono" />
                      </ReferenceLine>
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                        boxShadow: '3px 3px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                      }}
                      formatter={(v) => [`${v} kg`, 'Gewicht']}
                      labelFormatter={(d) => new Date(String(d)).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })} />
                    <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
                      strokeWidth={2.5} dot={{ r: 2, fill: 'var(--color-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : metricEntries.length >= 2 && (
              <div className="mb-3 brutal-card-inset p-2" style={{ width: '100%', height: 90 }}>
                <ResponsiveContainer>
                  <LineChart data={[...metricEntries].reverse().slice(-30)}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                        boxShadow: '3px 3px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                      }}
                      formatter={(v) => [`${v} ${info.unit}`, info.label]}
                      labelFormatter={() => ''} />
                    <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
                      strokeWidth={2.5} dot={{ r: 2, fill: 'var(--color-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* DIÄTPHASEN (nur Gewicht) */}
            {metricId === 'weight' && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="section-label flex items-center gap-1.5">
                    <Utensils className="w-3 h-3" /> Diätphase
                  </span>
                  <button onClick={() => setShowPhaseForm(!showPhaseForm)}
                    className="brutal-chip px-2 py-1 text-[10px] gap-1">
                    {showPhaseForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {showPhaseForm ? 'Abbrechen' : 'Phase'}
                  </button>
                </div>

                {/* Aktive Phase mit Fortschritt */}
                {activePhase && activeProgress ? (
                  <div className="brutal-card-inset p-2.5 mb-2"
                    style={{ borderLeft: `4px solid ${DIET_PHASE_INFO[activePhase.type].color}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-display tracking-wider uppercase"
                          style={{ color: DIET_PHASE_INFO[activePhase.type].color }}>
                          {DIET_PHASE_INFO[activePhase.type].label}
                        </span>
                        <span className="text-[9px] text-text-muted font-mono">
                          seit {new Date(activePhase.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                          {' · '}{Math.max(Math.round(activeProgress.days / 7), 0)} Wo.
                        </span>
                      </div>
                      {activeProgress.onTrack !== null && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border"
                          style={activeProgress.onTrack
                            ? { color: 'var(--color-success)', borderColor: 'var(--color-success)' }
                            : { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}>
                          {activeProgress.onTrack ? 'im Plan' : 'off track'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-text-dim">
                      {activeProgress.startWeight !== null && (
                        <span>Δ <span className="font-bold"
                          style={{ color: activeProgress.delta <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {activeProgress.delta > 0 ? '+' : ''}{activeProgress.delta} kg</span></span>
                      )}
                      <span>Rate <span className="text-text font-bold">
                        {activeProgress.ratePerWeek > 0 ? '+' : ''}{activeProgress.ratePerWeek} kg/Wo.</span></span>
                      {activeProgress.remaining !== null && (
                        <span>bis Ziel <span className="text-accent font-bold">
                          {activeProgress.remaining > 0 ? '+' : ''}{activeProgress.remaining} kg</span></span>
                      )}
                      {activeProgress.startWeight === null && (
                        <span className="text-text-muted">noch kein Gewicht in dieser Phase</span>
                      )}
                    </div>
                  </div>
                ) : !showPhaseForm && (
                  <p className="text-[10px] text-text-muted font-mono mb-2">
                    Keine aktive Phase. Lege eine an, um Diät/Aufbau/Erhaltung zu tracken.
                  </p>
                )}

                {/* Formular */}
                {showPhaseForm && (
                  <div className="brutal-card-inset p-2.5 mb-2 space-y-2 animate-slide-up">
                    <div className="flex gap-1.5">
                      {(Object.keys(DIET_PHASE_INFO) as DietPhaseType[]).map(t => (
                        <button key={t} onClick={() => setPhaseType(t)}
                          className="brutal-chip flex-1 justify-center py-1.5 text-[10px]"
                          style={phaseType === t
                            ? { backgroundColor: DIET_PHASE_INFO[t].color, color: '#000', borderColor: '#000' }
                            : {}}>
                          {DIET_PHASE_INFO[t].label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] text-text-muted font-mono w-10">Start</span>
                      <input type="date" value={phaseStart} onChange={e => setPhaseStart(e.target.value)}
                        className="brutal-input px-2 py-1.5 text-xs font-mono flex-1 min-w-0" />
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] text-text-muted font-mono w-10">Ende</span>
                      <input type="date" value={phaseEnd} onChange={e => setPhaseEnd(e.target.value)}
                        className="brutal-input px-2 py-1.5 text-xs font-mono flex-1 min-w-0" />
                      <span className="text-[9px] text-text-muted font-mono">optional</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] text-text-muted font-mono w-10">Ziel</span>
                      <input type="number" inputMode="decimal" placeholder="kg"
                        value={phaseTarget} onChange={e => setPhaseTarget(e.target.value)}
                        className="brutal-input w-20 px-2 py-1.5 text-xs text-center font-mono" />
                      <span className="text-[9px] text-text-muted font-mono">optional</span>
                    </div>
                    <button onClick={handleAddPhase} disabled={!phaseStart}
                      className="brutal-btn brutal-btn-accent w-full py-2 text-xs">
                      <Check className="w-3.5 h-3.5" /> Phase speichern
                    </button>
                  </div>
                )}

                {/* Alle Phasen */}
                {dietPhases.length > 0 && (
                  <div className="space-y-1">
                    {dietPhases.map(p => (
                      <div key={p.id} className="flex items-center gap-2 px-2 py-1 brutal-card-inset text-[10px] font-mono">
                        <span className="w-2 h-4 flex-shrink-0" style={{ backgroundColor: DIET_PHASE_INFO[p.type].color }} />
                        <span className="font-bold text-text w-16">{DIET_PHASE_INFO[p.type].label}</span>
                        <span className="text-text-dim flex-1 truncate">
                          {new Date(p.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          {p.endDate ? ` – ${new Date(p.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}` : ' – laufend'}
                          {p.targetWeight ? ` · Ziel ${p.targetWeight}kg` : ''}
                        </span>
                        <button onClick={() => deleteDietPhase(p.id)}
                          className="text-text-muted hover:text-danger transition-colors p-0.5 flex-shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {metricEntries.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metricEntries.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1 px-2 brutal-card-inset">
                    <span className="text-xs text-text-dim font-mono">
                      {new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text font-bold font-mono">{e.value} {info.unit}</span>
                      <button onClick={() => deleteMetric(e.id)}
                        className="text-text-muted hover:text-danger transition-colors p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-text-muted font-mono text-center py-2">
                Noch keine {info.label}-Einträge
              </p>
            )}
          </>
        )}
      </div>

      {/* AKTIVITÄTS-GRID */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up stagger-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">12 Wochen</h3>
          <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
            {[0, 1, 2, 3].map(n => (
              <span key={n} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 block border border-black" style={{
                  backgroundColor: n === 0 ? 'var(--color-concrete)'
                    : `color-mix(in srgb, var(--color-accent) ${Math.min(n * 40, 100)}%, var(--color-concrete))`,
                }} />{n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 overflow-hidden">
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex-1 min-w-0 flex flex-col gap-1"
              onMouseEnter={() => setSelectedWeek(wi)} onMouseLeave={() => setSelectedWeek(null)}>
              <span className="block truncate text-[8px] text-text-muted text-center font-mono leading-none mb-0.5">{week.label}</span>
              {week.days.map((day, di) => {
                const isToday = day.date === isoDate(new Date());
                return (
                  <div key={di} className="aspect-square transition-all"
                    style={{
                      backgroundColor: day.count > 0
                        ? `color-mix(in srgb, var(--color-accent) ${Math.min(day.count * 40, 100)}%, var(--color-concrete))`
                        : 'var(--color-concrete)',
                      border: isToday ? '2px solid var(--color-text)' : '1px solid #333',
                      transform: selectedWeek === wi ? 'scale(1.12)' : 'scale(1)',
                    }}
                    title={`${day.date}${day.count > 0 ? `: ${day.count} Training(s)` : ''}`} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[7px] text-text-muted font-mono uppercase">
          <span>So</span><span>Di</span><span>Do</span><span>Sa</span>
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => onStartTraining()}
        className="brutal-btn brutal-btn-accent w-full py-4 animate-slam-in animate-pulse-border"
        style={{ fontSize: '1.3rem' }}>
        <span>Training starten</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
