// Dashboard: Stats, Muskel-Heatmap + Balance, Körpermetriken, Aktivitäts-Grid,
// Tier List, Backup (Export/Import).

import { useMemo, useState, useRef } from 'react';
import {
  Flame, Calendar, ArrowRight, Zap, Trophy, Crown, Medal, Scale, Trash2,
  ChevronDown, ChevronUp, Settings, Download, Upload, AlertTriangle,
} from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BodyHeatmap } from '../components/BodyHeatmap';
import { workoutLabel, workoutColor } from '../data/model';
import { CATEGORY_LABELS, CATEGORY_COLORS, MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleCategory } from '../data/muscles';
import {
  computeMuscleStats, computeBalance, muscleLabel, round1,
  weeklySetsPerMuscle, WEEKLY_SET_TARGET,
} from '../lib/stats';
import { exportBackup, importBackup, METRIC_INFO } from '../lib/storage';
import type { MetricId } from '../lib/storage';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
  onStartTraining: () => void;
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
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
  const { workouts, templates, exercisesByName, metrics, addMetric, deleteMetric, reload } = ledger;

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [muscleRange, setMuscleRange] = useState(28);
  const [showSettings, setShowSettings] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Körpermetriken
  const [metricId, setMetricId] = useState<MetricId>('weight');
  const [bmDate, setBmDate] = useState(isoDate(new Date()));
  const [bmValue, setBmValue] = useState('');
  const [bmExpanded, setBmExpanded] = useState(true);

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
      weeks.push({ label: `${weekStart.getDate()}.${weekStart.getMonth() + 1}.`, days });
    }
    return weeks;
  }, [workouts]);

  // Tier List (letzte 5 nach Volumen)
  const tierList = useMemo(() => {
    const recent = workouts.slice(0, 5);
    if (recent.length === 0) return [];
    const scored = recent.map(w => ({
      ...w,
      maxWeight: w.exercises.reduce((mx, e) => Math.max(mx, ...e.sets.map(s => s.weight)), 0),
      totalSets: w.exercises.reduce((s, e) => s + e.sets.length, 0),
      volume: w.exercises.reduce((v, e) => v + e.sets.reduce((sv, s) => sv + s.weight * s.reps, 0), 0),
    }));
    const maxVol = Math.max(...scored.map(s => s.volume), 1);
    const tiers = [
      { tier: 'S', icon: Crown, color: '#ffd600', min: 0.8 },
      { tier: 'A', icon: Medal, color: '#c0c0c0', min: 0.6 },
      { tier: 'B', icon: Medal, color: '#cd7f32', min: 0.4 },
      { tier: 'C', icon: Medal, color: '#666', min: 0 },
    ];
    return scored.map(s => {
      const score = s.volume / maxVol;
      const assigned = tiers.find(t => score >= t.min) || tiers[tiers.length - 1];
      return { ...s, ...assigned };
    });
  }, [workouts]);

  const metricEntries = useMemo(
    () => metrics.filter(m => m.metric === metricId),
    [metrics, metricId]
  );

  const metricDelta = useMemo(() => {
    if (metricEntries.length < 2) return null;
    return round1(metricEntries[0].value - metricEntries[metricEntries.length - 1].value);
  }, [metricEntries]);

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
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { icon: Flame, value: stats.total, label: 'Total', color: 'var(--color-accent)' },
          { icon: Zap, value: stats.thisWeek, label: 'Woche', color: 'var(--color-warning)' },
          { icon: Calendar, value: stats.streak, label: 'Wo-Streak', color: 'var(--color-success)' },
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
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {(Object.keys(METRIC_INFO) as MetricId[]).map(id => (
                <button key={id} onClick={() => setMetricId(id)}
                  className={`brutal-chip px-2.5 py-1 text-[10px] whitespace-nowrap flex-shrink-0 ${metricId === id ? 'active' : ''}`}>
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

            {metricEntries.length >= 2 && (
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
        <div className="flex gap-1">
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex-1 flex flex-col gap-1"
              onMouseEnter={() => setSelectedWeek(wi)} onMouseLeave={() => setSelectedWeek(null)}>
              <span className="text-[8px] text-text-muted text-center font-mono leading-none mb-0.5">{week.label}</span>
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

      {/* TIER LIST */}
      {tierList.length > 0 && (
        <div className="brutal-card-sm p-3 mb-5 animate-slide-up stagger-5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-warning" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Tier List</h3>
            <span className="text-[10px] text-text-muted font-mono">Letzte {tierList.length} Trainings</span>
          </div>
          <div className="space-y-2">
            {tierList.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="brutal-card-inset p-2.5 animate-slide-up flex items-center gap-3"
                  style={{
                    animationDelay: `${0.2 + i * 0.05}s`,
                    borderLeft: `4px solid ${item.color}`,
                    boxShadow: item.tier === 'S' ? '0 0 12px rgba(255,214,0,0.15)' : 'none',
                  }}>
                  <div className="flex items-center gap-1.5 min-w-[36px]">
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-sm font-bold font-display tracking-wider" style={{ color: item.color }}>
                      {item.tier}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text font-display tracking-wider">
                        {workoutLabel(item)}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{formatDay(item.date)}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-text-dim font-mono mt-0.5">
                      <span>{item.exercises.length} Üb.</span>
                      <span>{item.totalSets} Sätze</span>
                      <span className="text-accent font-medium">{item.maxWeight}kg max</span>
                      <span className="text-text-muted">{Math.round(item.volume).toLocaleString('de-DE')}kg</span>
                    </div>
                  </div>
                  <span className="w-2 h-8 flex-shrink-0" style={{ backgroundColor: workoutColor(item, templates) }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <button onClick={onStartTraining}
        className="brutal-btn brutal-btn-accent w-full py-4 animate-slam-in animate-pulse-border"
        style={{ fontSize: '1.3rem' }}>
        <span>Training starten</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
