// Dashboard: Stats, Muskel-Heatmap + Balance, Körpermetriken, Aktivitäts-Grid,
// Backup (Export/Import).

import { useMemo, useState } from 'react';
import {
  Flame, Calendar, ArrowRight, Zap, Trophy, Scale,
  Settings, AlertTriangle, ListChecks,
} from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { BodyHeatmap } from '../components/BodyHeatmap';
import { workoutLabel } from '../data/model';
import { CATEGORY_LABELS, CATEGORY_COLORS, MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleCategory } from '../data/muscles';
import {
  computeMuscleStats, computeBalance, muscleLabel, round1,
  weeklySetsPerMuscle, WEEKLY_SET_TARGET, nextUpTemplateId,
} from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
  onStartTraining: (templateId?: string) => void;
  onOpenSettings: () => void;
  onOpenDiet: () => void;
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

const MUSCLE_RANGES = [
  { label: 'Woche', days: 7 },
  { label: '4 Wochen', days: 28 },
  { label: '3 Monate', days: 90 },
];

export function HomeView({ ledger, onStartTraining, onOpenSettings, onOpenDiet }: Props) {
  const { workouts, templates, routines, settings, exercisesByName, metrics } = ledger;

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [muscleRange, setMuscleRange] = useState(28);

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

  // Schon heute trainiert? → Label wechselt von "Heute dran" auf "Als Nächstes".
  const trainedToday = useMemo(
    () => workouts.some(w => w.date === isoDate(new Date())),
    [workouts]
  );

  // "Heute dran" / "Als Nächstes": bei aktiver Routine das nächste Workout
  // (nach dem zuletzt gemachten, in Reihenfolge) + dessen letzte Übungen.
  const nextUp = useMemo(() => {
    const routine = routines.find(r => r.id === settings.activeRoutineId);
    const nextId = nextUpTemplateId(routine, templates, workouts);
    const next = nextId ? templates.find(t => t.id === nextId) : null;
    if (!routine || !next) return null;

    const belongs = (w: typeof workouts[number], tpl: typeof next) =>
      w.templateId === tpl.id || (!!tpl.preset && w.type === tpl.preset);

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


  // Kompakte Gewichts-Kachel: letzter Wert, Gesamtänderung, Mini-Sparkline.
  const weightMini = useMemo(() => {
    const pts = metrics.filter(m => m.metric === 'weight')
      .map(m => ({ date: m.date, value: m.value }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const latest = pts.length ? pts[pts.length - 1].value : null;
    const delta = pts.length >= 2 ? round1(pts[pts.length - 1].value - pts[0].value) : null;
    return { points: pts.slice(-40), latest, delta };
  }, [metrics]);

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-5 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-4xl tracking-wider text-text font-display leading-none">caelifts</h1>
          </div>
          <button onClick={onOpenSettings}
            className="p-2 transition-colors text-text-muted hover:text-text"
            aria-label="Einstellungen">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <p className="text-text-dim text-xs uppercase tracking-widest font-mono">{today}</p>
      </div>

      {/* HEUTE DRAN — nächstes Workout der aktiven Routine */}
      {nextUp && (
        <button onClick={() => onStartTraining(nextUp.workout.id)}
          className="w-full text-left brutal-card-sm p-3 mb-5 animate-slide-up hover:brightness-110 transition-all"
          style={{ borderLeft: `4px solid ${nextUp.workout.color}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <ListChecks className="w-4 h-4 flex-shrink-0" style={{ color: nextUp.workout.color }} />
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                {trainedToday ? 'Als Nächstes' : 'Heute dran'}
              </span>
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

      {/* GEWICHT (kompakt) — Verwaltung im Diät-Tab */}
      <button onClick={onOpenDiet}
        className="w-full text-left brutal-card-sm p-3 mb-5 animate-slide-up stagger-3 transition-all active:translate-x-0.5 active:translate-y-0.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Gewicht</h3>
            {weightMini.latest != null && (
              <span className="text-sm text-text font-bold font-mono">{weightMini.latest} kg</span>
            )}
            {weightMini.delta != null && (
              <span className="text-[10px] font-mono font-bold"
                style={{ color: weightMini.delta <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {weightMini.delta > 0 ? '+' : ''}{weightMini.delta} kg
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[9px] text-text-muted font-mono uppercase tracking-wider">
            Diät <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        {weightMini.points.length >= 2 ? (
          <div className="brutal-card-inset p-1.5" style={{ width: '100%', height: 56 }}>
            <ResponsiveContainer>
              <LineChart data={weightMini.points}>
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
                  strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[10px] text-text-muted font-mono">
            Gewicht & Diätphasen im Diät-Tab pflegen.
          </p>
        )}
      </button>

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
