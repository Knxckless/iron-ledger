// Fortschritts-Charts: Metrik-Umschalter (Max/e1RM/Volumen/Reps), Trendlinie,
// Übungsvergleich, Progressive-Overload-Indikator, PR-Karten, Wochen-Tonnage.

import { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Brush, ReferenceLine, Label,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, Target, StickyNote, Trophy, X, GitCompareArrows,
} from 'lucide-react';
import type { WorkoutEntry } from '../data/model';
import {
  epley1RM, exerciseVolume, computePRs, overloadTrend, linearTrend, round1, sessionTonnage,
} from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
}

type MetricKey = 'maxWeight' | 'e1rm' | 'volume' | 'maxReps';

const METRICS: { key: MetricKey; label: string; unit: string; color: string }[] = [
  { key: 'maxWeight', label: 'Max', unit: 'kg', color: 'var(--color-accent)' },
  { key: 'e1rm', label: 'e1RM', unit: 'kg', color: '#b388ff' },
  { key: 'volume', label: 'Volumen', unit: 'kg', color: '#18ffff' },
  { key: 'maxReps', label: 'Reps', unit: '', color: 'var(--color-success)' },
];

const TIME_FILTERS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1J', days: 365 },
  { label: 'ALL', days: Infinity },
];

const COMPARE_COLOR = '#ffd600';

function formatDate(dateStr: string) {
  const parts = dateStr.split('-');
  return `${parts[2]}.${parts[1]}.`;
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: '2-digit' });
}

interface SessionPoint {
  date: string;
  dateLong: string;
  maxWeight: number;
  maxReps: number;
  volume: number;
  e1rm: number;
  sets: { weight: number; reps: number; notes?: string }[];
}

function sessionsFor(workouts: WorkoutEntry[], exerciseName: string, cutoff: Date | null): SessionPoint[] {
  return workouts
    .filter(w => w.exercises.some(e => e.name === exerciseName))
    .filter(w => !cutoff || new Date(w.date) >= cutoff)
    .map(w => {
      const ex = w.exercises.find(e => e.name === exerciseName)!;
      const valid = ex.sets.filter(s => s.weight > 0 && s.reps > 0);
      return {
        date: w.date,
        dateLong: formatDateLong(w.date),
        maxWeight: Math.max(...valid.map(s => s.weight), 0),
        maxReps: Math.max(...valid.map(s => s.reps), 0),
        volume: Math.round(exerciseVolume(valid)),
        e1rm: round1(Math.max(...valid.map(s => epley1RM(s.weight, s.reps)), 0)),
        sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, notes: s.notes })),
      };
    })
    .filter(d => d.maxWeight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function DetailTooltip({ active, payload, metric }: {
  active?: boolean;
  payload?: { payload: SessionPoint & { trend?: number } }[];
  metric: MetricKey;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  const m = METRICS.find(x => x.key === metric)!;

  return (
    <div style={{
      backgroundColor: 'var(--color-steel)', border: '2px solid #000',
      padding: '10px 12px', boxShadow: '4px 4px 0px #000', maxWidth: '260px',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px', letterSpacing: '0.05em',
        color: 'var(--color-text)', marginBottom: '6px',
        borderBottom: '1px solid var(--color-steel-light)', paddingBottom: '4px',
      }}>
        {data.dateLong}
      </div>
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '6px', flexWrap: 'wrap',
        fontFamily: "'DM Mono', monospace", fontSize: '11px',
      }}>
        <span><span style={{ color: 'var(--color-text-dim)' }}>{m.label}: </span>
          <span style={{ color: m.color, fontWeight: 'bold' }}>{data[metric]}{m.unit}</span></span>
        <span><span style={{ color: 'var(--color-text-dim)' }}>e1RM: </span>
          <span style={{ color: '#b388ff' }}>{data.e1rm}kg</span></span>
        <span><span style={{ color: 'var(--color-text-dim)' }}>Vol: </span>
          <span style={{ color: 'var(--color-text)' }}>{data.volume}kg</span></span>
      </div>
      <div style={{ borderTop: '1px solid var(--color-steel-light)', paddingTop: '4px' }}>
        {data.sets.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'DM Mono', monospace", fontSize: '10px', marginBottom: '2px',
          }}>
            <span style={{ color: 'var(--color-text-muted)', width: '14px' }}>{i + 1}.</span>
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', minWidth: '30px' }}>{s.weight}kg</span>
            <span style={{ color: 'var(--color-text-dim)' }}>×</span>
            <span style={{ color: 'var(--color-text)', minWidth: '16px' }}>{s.reps}</span>
            {s.notes && (
              <span style={{
                color: 'var(--color-warning)', fontSize: '9px', fontStyle: 'italic',
                maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>"{s.notes}"</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressView({ ledger }: Props) {
  const { workouts } = ledger;
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [compareExercise, setCompareExercise] = useState<string | null>(null);
  const [showCompareSelect, setShowCompareSelect] = useState(false);
  const [metric, setMetric] = useState<MetricKey>('maxWeight');
  const [timeFilter, setTimeFilter] = useState<number>(90);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Alle Übungen mit geloggten Daten, häufigste zuerst
  const exerciseList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of workouts) {
      for (const ex of w.exercises) {
        if (ex.sets.some(s => s.weight > 0 && s.reps > 0)) {
          counts.set(ex.name, (counts.get(ex.name) || 0) + 1);
        }
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [workouts]);

  const effectiveExercise = selectedExercise && exerciseList.includes(selectedExercise)
    ? selectedExercise : exerciseList[0] || null;

  const cutoff = useMemo(() => {
    if (timeFilter === Infinity) return null;
    const d = new Date();
    d.setDate(d.getDate() - timeFilter);
    return d;
  }, [timeFilter]);

  const chartData = useMemo(() => {
    if (!effectiveExercise) return [];
    const points = sessionsFor(workouts, effectiveExercise, cutoff);
    const trendVals = linearTrend(points.map(p => p[metric]));
    return points.map((p, i) => ({ ...p, trend: round1(trendVals[i]) }));
  }, [workouts, effectiveExercise, cutoff, metric]);

  // Vergleichsdaten nach Datum zusammenführen (connectNulls überbrückt Lücken)
  const compareData = useMemo(() => {
    if (!compareExercise || !effectiveExercise) return null;
    const a = sessionsFor(workouts, effectiveExercise, cutoff);
    const b = sessionsFor(workouts, compareExercise, cutoff);
    const dates = [...new Set([...a.map(p => p.date), ...b.map(p => p.date)])].sort();
    const aMap = new Map(a.map(p => [p.date, p]));
    const bMap = new Map(b.map(p => [p.date, p]));
    return dates.map(date => ({
      date,
      a: aMap.get(date)?.[metric] ?? null,
      b: bMap.get(date)?.[metric] ?? null,
    }));
  }, [workouts, effectiveExercise, compareExercise, cutoff, metric]);

  const personalBest = useMemo(
    () => chartData.reduce((mx, d) => Math.max(mx, d[metric]), 0),
    [chartData, metric]
  );

  const notesCount = useMemo(
    () => chartData.reduce((n, d) => n + d.sets.filter(s => s.notes).length, 0),
    [chartData]
  );

  // Overload-Trend auf Basis der gesamten Historie (nicht zeitgefiltert)
  const trend = useMemo(() => {
    if (!effectiveExercise) return null;
    const all = sessionsFor(workouts, effectiveExercise, null);
    return overloadTrend(all.map(p => ({ date: p.date, value: p.e1rm })));
  }, [workouts, effectiveExercise]);

  const prs = useMemo(
    () => effectiveExercise ? computePRs(workouts, effectiveExercise) : null,
    [workouts, effectiveExercise]
  );

  // Wochen-Tonnage über alle Workouts
  const weeklyTonnage = useMemo(() => {
    const byWeek = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().split('T')[0];
      byWeek.set(key, (byWeek.get(key) || 0) + sessionTonnage(w));
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([week, tonnage]) => ({ week, label: formatDate(week), tonnage: Math.round(tonnage) }));
  }, [workouts]);

  const handleDotClick = useCallback((data: unknown) => {
    const d = data as { activePayload?: { payload?: SessionPoint }[] };
    const p = d?.activePayload?.[0]?.payload;
    if (p) {
      const idx = chartData.findIndex(x => x.date === p.date);
      setSelectedPoint(prev => (prev === idx ? null : idx));
    }
  }, [chartData]);

  const metricInfo = METRICS.find(m => m.key === metric)!;

  if (!effectiveExercise) {
    return (
      <div className="p-4">
        <h1 className="text-3xl tracking-wider text-text font-display mb-4">Charts</h1>
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 brutal-card-sm flex items-center justify-center mx-auto mb-4" style={{ borderStyle: 'dashed' }}>
            <TrendingUp className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-muted text-sm uppercase tracking-widest font-display">Keine Daten</p>
        </div>
      </div>
    );
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend?.direction === 'up' ? 'var(--color-success)'
    : trend?.direction === 'down' ? 'var(--color-danger)' : 'var(--color-text-dim)';

  return (
    <div className="p-4">
      <h1 className="text-3xl tracking-wider text-text font-display mb-4 animate-fade-in">Charts</h1>

      {/* Übungsauswahl + Vergleich */}
      <div className="flex gap-2 mb-3 animate-slide-up stagger-1">
        <div className="relative flex-1 min-w-0">
          <select value={effectiveExercise}
            onChange={e => { setSelectedExercise(e.target.value); setSelectedPoint(null); }}
            className="w-full appearance-none brutal-card-sm px-3 py-2.5 text-sm text-text font-mono outline-none cursor-pointer">
            {exerciseList.map(ex => (
              <option key={ex} value={ex} style={{ backgroundColor: 'var(--color-steel)' }}>{ex}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
        </div>
        {compareExercise ? (
          <button onClick={() => { setCompareExercise(null); setShowCompareSelect(false); }}
            className="brutal-chip px-3 py-2 text-xs gap-1 flex-shrink-0"
            style={{ backgroundColor: COMPARE_COLOR, color: '#000', borderColor: '#000' }}>
            <X className="w-3 h-3" /> {compareExercise.split(' ')[0]}
          </button>
        ) : (
          <button onClick={() => setShowCompareSelect(!showCompareSelect)}
            className={`brutal-chip px-3 py-2 text-xs gap-1 flex-shrink-0 ${showCompareSelect ? 'active' : ''}`}>
            <GitCompareArrows className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showCompareSelect && !compareExercise && (
        <div className="relative mb-3 animate-slide-up">
          <select defaultValue=""
            onChange={e => { if (e.target.value) { setCompareExercise(e.target.value); setShowCompareSelect(false); } }}
            className="w-full appearance-none brutal-card-sm px-3 py-2.5 text-sm text-text font-mono outline-none cursor-pointer"
            style={{ borderColor: COMPARE_COLOR }}>
            <option value="" disabled>Vergleichen mit…</option>
            {exerciseList.filter(e => e !== effectiveExercise).map(ex => (
              <option key={ex} value={ex} style={{ backgroundColor: 'var(--color-steel)' }}>{ex}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
        </div>
      )}

      {/* Metrik-Umschalter */}
      <div className="flex gap-1.5 mb-2">
        {METRICS.map(m => (
          <button key={m.key}
            onClick={() => { setMetric(m.key); setSelectedPoint(null); }}
            className={`brutal-chip flex-1 justify-center py-2 text-[11px] ${metric === m.key ? 'active' : ''}`}
            style={metric === m.key ? { backgroundColor: m.color, color: '#000' } : {}}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Zeitfilter */}
      <div className="flex gap-1.5 mb-4">
        {TIME_FILTERS.map(f => (
          <button key={f.label}
            onClick={() => { setTimeFilter(f.days); setSelectedPoint(null); }}
            className={`brutal-chip px-3 py-1.5 ${timeFilter === f.days ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm uppercase tracking-widest font-display">Keine Daten im Zeitraum</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="brutal-card-sm p-3 animate-slam-in">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-text font-display tracking-wider truncate">
                  {effectiveExercise}
                  {compareExercise && <span style={{ color: COMPARE_COLOR }}> vs. {compareExercise}</span>}
                </h3>
                {notesCount > 0 && !compareExercise && (
                  <span className="text-[10px] text-warning font-mono flex items-center gap-1 mt-0.5">
                    <StickyNote className="w-2.5 h-2.5" /> {notesCount} Notizen · Punkt antippen für Details
                  </span>
                )}
              </div>
              {trend && (
                <div className="flex items-center gap-1 px-2 py-1 border flex-shrink-0"
                  style={{ borderColor: trendColor, color: trendColor }}
                  title="Progressive Overload: letzte 3 vs. vorherige 3 Sessions (e1RM)">
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono font-bold">
                    {trend.pct > 0 ? '+' : ''}{round1(trend.pct)}%
                  </span>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                {compareData ? (
                  <LineChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" fontSize={10} fontFamily="DM Mono" />
                    <YAxis stroke="#666" fontSize={10} fontFamily="DM Mono" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                        boxShadow: '4px 4px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                      }}
                      labelFormatter={(d) => formatDateLong(String(d))}
                      formatter={(value, name) => [
                        `${value}${metricInfo.unit}`,
                        name === 'a' ? effectiveExercise : compareExercise ?? '',
                      ]} />
                    <Line type="monotone" dataKey="a" connectNulls
                      stroke={metricInfo.color} strokeWidth={3}
                      dot={{ r: 3, fill: metricInfo.color, stroke: '#000', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="b" connectNulls
                      stroke={COMPARE_COLOR} strokeWidth={2} strokeDasharray="6 3"
                      dot={{ r: 3, fill: COMPARE_COLOR, stroke: '#000', strokeWidth: 1 }} />
                    <Brush dataKey="date" height={28} stroke="rgba(255,255,255,0.08)"
                      fill="var(--color-concrete)" tickFormatter={formatDate} travellerWidth={10} />
                  </LineChart>
                ) : (
                  <LineChart data={chartData} onClick={handleDotClick}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" fontSize={10} fontFamily="DM Mono" />
                    <YAxis stroke={metricInfo.color} fontSize={10} fontFamily="DM Mono"
                      domain={['auto', 'auto']} />
                    <Tooltip content={<DetailTooltip metric={metric} />} />
                    <ReferenceLine y={personalBest} stroke="rgba(255,107,0,0.35)" strokeDasharray="6 4">
                      <Label value={`PB ${personalBest}${metricInfo.unit}`} position="insideTopRight"
                        fill="var(--color-accent)" fontSize={10} fontFamily="DM Mono" />
                    </ReferenceLine>
                    <Line type="monotone" dataKey="trend" stroke="rgba(255,255,255,0.25)"
                      strokeWidth={1.5} strokeDasharray="2 4" dot={false} activeDot={false} name="Trend" />
                    <Line type="monotone" dataKey={metric}
                      stroke={metricInfo.color} strokeWidth={3}
                      dot={{ r: 4, fill: metricInfo.color, stroke: '#000', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: metricInfo.color, stroke: '#fff', strokeWidth: 2 }} />
                    <Brush dataKey="date" height={28} stroke="rgba(255,255,255,0.08)"
                      fill="var(--color-concrete)" tickFormatter={formatDate} travellerWidth={10} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* PR-Karten */}
          {prs && (
            <div className="grid grid-cols-3 gap-2 animate-slide-up stagger-2">
              {[
                { label: 'Max Gewicht', pr: prs.maxWeight, unit: 'kg' },
                { label: 'Best e1RM', pr: prs.bestE1RM, unit: 'kg' },
                { label: 'Max Reps', pr: prs.maxReps, unit: '' },
              ].map(({ label, pr, unit }) => (
                <div key={label} className="brutal-card-sm p-2.5 text-center">
                  <Trophy className="w-3.5 h-3.5 mx-auto mb-1 text-warning" />
                  <span className="block text-lg font-bold text-text font-display tracking-wide leading-none">
                    {pr ? `${round1(pr.value)}${unit}` : '–'}
                  </span>
                  <span className="block text-[8px] text-text-muted uppercase tracking-wider font-display mt-1">{label}</span>
                  {pr && (
                    <span className="block text-[8px] text-text-muted font-mono mt-0.5">
                      {formatDateLong(pr.date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Detail zum angeklickten Punkt */}
          {selectedPoint !== null && chartData[selectedPoint] && !compareExercise && (
            <div className="brutal-card-sm p-3 animate-slide-up"
              style={{ borderLeft: `4px solid ${metricInfo.color}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-text font-display tracking-wider">
                  {chartData[selectedPoint].dateLong}
                </span>
              </div>
              <div className="space-y-1">
                {chartData[selectedPoint].sets.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-text-muted w-4">{i + 1}.</span>
                    <span className="text-accent font-bold">{s.weight}</span>
                    <span className="text-text-dim">kg ×</span>
                    <span className="text-text font-medium">{s.reps}</span>
                    {s.notes && <span className="text-warning italic text-[10px] ml-1">"{s.notes}"</span>}
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t flex gap-3 text-xs font-mono text-text-dim"
                style={{ borderColor: 'var(--color-steel-light)' }}>
                <span>Max: <span className="text-accent font-bold">{chartData[selectedPoint].maxWeight}kg</span></span>
                <span>e1RM: <span style={{ color: '#b388ff' }}>{chartData[selectedPoint].e1rm}kg</span></span>
                <span>Vol: <span className="text-text">{chartData[selectedPoint].volume}kg</span></span>
              </div>
            </div>
          )}

          {/* Wochen-Tonnage über alle Trainings */}
          {weeklyTonnage.length >= 2 && (
            <div className="brutal-card-sm p-3 animate-slide-up stagger-3">
              <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase mb-2">
                Wochen-Tonnage <span className="text-text-muted normal-case font-mono text-[9px]">alle Trainings, Sätze×Reps×kg</span>
              </h3>
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <BarChart data={weeklyTonnage}>
                    <XAxis dataKey="label" stroke="#666" fontSize={9} fontFamily="DM Mono" interval="preserveStartEnd" />
                    <YAxis stroke="#666" fontSize={9} fontFamily="DM Mono" width={42}
                      tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}t` : String(v)} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{
                        backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                        boxShadow: '4px 4px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                      }}
                      formatter={(v) => [`${Number(v).toLocaleString('de-DE')} kg`, 'Tonnage']}
                      labelFormatter={(l) => `Woche ab ${l}`} />
                    <Bar dataKey="tonnage" fill="var(--color-accent)" stroke="#000" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
