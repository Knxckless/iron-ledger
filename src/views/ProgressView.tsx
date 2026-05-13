import { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Brush, ReferenceLine, Label,
} from 'recharts';
import { TrendingUp, ChevronDown, Target, StickyNote } from 'lucide-react';
import type { WorkoutEntry } from '../data/seedData';

interface Props {
  workouts: WorkoutEntry[];
}

const TYPE_LABELS: Record<string, string> = { pull: 'Pull', push: 'Push', leg: 'Leg' };
const TYPE_COLORS: Record<string, string> = { pull: '#448aff', push: '#ff5252', leg: '#69f0ae' };

const TIME_FILTERS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1J', days: 365 },
  { label: 'ALL', days: Infinity },
];

function formatDate(dateStr: string) {
  const parts = dateStr.split('-');
  return `${parts[2]}.${parts[1]}.`;
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: '2-digit' });
}

type ChartPoint = {
  date: string;
  dateLong: string;
  maxWeight: number;
  maxReps: number;
  volume: number;
  sets: { weight: number; reps: number; notes?: string }[];
  exerciseName: string;
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div style={{
      backgroundColor: 'var(--color-steel)',
      border: '2px solid #000',
      padding: '10px 12px',
      boxShadow: '4px 4px 0px #000',
      maxWidth: '260px',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '14px',
        letterSpacing: '0.05em',
        color: 'var(--color-text)',
        marginBottom: '6px',
        borderBottom: '1px solid var(--color-steel-light)',
        paddingBottom: '4px',
      }}>
        {data.dateLong}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '6px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
      }}>
        <span>
          <span style={{ color: 'var(--color-text-dim)' }}>Max: </span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{data.maxWeight}kg</span>
        </span>
        <span>
          <span style={{ color: 'var(--color-text-dim)' }}>Reps: </span>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{data.maxReps}</span>
        </span>
        <span>
          <span style={{ color: 'var(--color-text-dim)' }}>Vol: </span>
          <span style={{ color: 'var(--color-text)' }}>{data.volume}kg</span>
        </span>
      </div>

      <div style={{
        borderTop: '1px solid var(--color-steel-light)',
        paddingTop: '4px',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.06em',
          color: 'var(--color-text-dim)',
          marginBottom: '3px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <StickyNote className="w-2.5 h-2.5" style={{ color: 'var(--color-accent)' }} />
          Sätze
        </div>
        {data.sets.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            marginBottom: '2px',
          }}>
            <span style={{ color: 'var(--color-text-muted)', width: '14px' }}>{i + 1}.</span>
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', minWidth: '30px' }}>{s.weight}kg</span>
            <span style={{ color: 'var(--color-text-dim)' }}>×</span>
            <span style={{ color: 'var(--color-text)', minWidth: '16px' }}>{s.reps}</span>
            {s.notes ? (
              <span style={{
                color: 'var(--color-warning)',
                fontSize: '9px',
                fontStyle: 'italic',
                marginLeft: '2px',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                "{s.notes}"
              </span>
            ) : (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressView({ workouts }: Props) {
  const [selectedType, setSelectedType] = useState<string>('pull');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<number>(90);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const exercisesByType = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const w of workouts) {
      if (!map[w.type]) map[w.type] = [];
      for (const ex of w.exercises) {
        if (!map[w.type].includes(ex.name)) map[w.type].push(ex.name);
      }
    }
    return map;
  }, [workouts]);

  const exerciseList = exercisesByType[selectedType] || [];
  const effectiveExercise = selectedExercise && exerciseList.includes(selectedExercise)
    ? selectedExercise : exerciseList[0] || null;

  const { chartData, personalBest, notesCount } = useMemo(() => {
    if (!effectiveExercise) return { chartData: [], personalBest: 0, notesCount: 0 };
    const cutoff = timeFilter === Infinity ? null : new Date();
    if (cutoff) cutoff.setDate(cutoff.getDate() - timeFilter);

    let totalNotes = 0;
    const full: ChartPoint[] = workouts
      .filter(w => {
        if (w.type !== selectedType) return false;
        if (!w.exercises.some(e => e.name === effectiveExercise)) return false;
        if (cutoff && new Date(w.date) < cutoff) return false;
        return true;
      })
      .map(w => {
        const ex = w.exercises.find(e => e.name === effectiveExercise)!;
        const bestWeight = Math.max(...ex.sets.map(s => s.weight));
        const bestReps = Math.max(...ex.sets.map(s => s.reps));
        let totalVolume = 0;
        for (const s of ex.sets) {
          if (s.weight > 0 && s.reps > 0) totalVolume += s.weight * s.reps;
          if (s.notes) totalNotes++;
        }
        return {
          date: w.date,
          dateLong: formatDateLong(w.date),
          maxWeight: bestWeight,
          maxReps: bestReps,
          volume: Math.round(totalVolume),
          sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, notes: s.notes })),
          exerciseName: effectiveExercise,
        };
      })
      .filter(d => d.maxWeight > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const pb = full.reduce((max, d) => Math.max(max, d.maxWeight), 0);
    return { chartData: full, personalBest: pb, notesCount: totalNotes };
  }, [workouts, selectedType, effectiveExercise, timeFilter]);

  const handleDotClick = useCallback((data: unknown) => {
    const d = data as { activePayload?: { payload?: ChartPoint }[] };
    if (d?.activePayload?.[0]?.payload) {
      const idx = chartData.indexOf(d.activePayload[0].payload);
      setSelectedPoint(selectedPoint === idx ? null : idx);
    }
  }, [chartData, selectedPoint]);

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

  return (
    <div className="p-4">
      <h1 className="text-3xl tracking-wider text-text font-display mb-4 animate-fade-in">Charts</h1>

      <div className="flex gap-2 mb-3">
        {['pull', 'push', 'leg'].map((t, i) => (
          <button key={t}
            onClick={() => { setSelectedType(t); setSelectedExercise(null); setSelectedPoint(null); }}
            className={`brutal-chip flex-1 justify-center py-2 animate-slide-up stagger-${i + 1} ${selectedType === t ? 'active' : ''}`}
            style={selectedType === t ? { backgroundColor: TYPE_COLORS[t], color: '#000' } : {}}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="relative mb-3 animate-slide-up stagger-3">
        <select value={effectiveExercise}
          onChange={e => { setSelectedExercise(e.target.value); setSelectedPoint(null); }}
          className="w-full appearance-none brutal-card-sm px-3 py-2.5 text-sm text-text font-mono outline-none cursor-pointer"
          style={{ fontFamily: "'DM Mono', monospace" }}>
          {exerciseList.map(ex => (
            <option key={ex} value={ex} style={{ backgroundColor: 'var(--color-steel)' }}>{ex}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
      </div>

      <div className="flex gap-1.5 mb-4">
        {TIME_FILTERS.map((f, i) => (
          <button key={f.label}
            onClick={() => { setTimeFilter(f.days); setSelectedPoint(null); }}
            className={`brutal-chip px-3 py-1.5 animate-slide-up stagger-${i + 4} ${timeFilter === f.days ? 'active' : ''}`}>
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
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-text font-display tracking-wider">{effectiveExercise}</h3>
                {notesCount > 0 && (
                  <span className="text-[10px] text-warning font-mono flex items-center gap-1 mt-0.5">
                    <StickyNote className="w-2.5 h-2.5" />
                    {notesCount} Notizen · Hover für Details
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-accent)' }} />
                  <span className="text-text-dim">kg</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-success)' }} />
                  <span className="text-text-dim">Reps</span>
                </span>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} onClick={handleDotClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" fontSize={10}
                    fontFamily="DM Mono" />
                  <YAxis yAxisId="left" stroke="var(--color-accent)" fontSize={10}
                    fontFamily="DM Mono" domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={10}
                    fontFamily="DM Mono" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine yAxisId="left" y={personalBest}
                    stroke="rgba(255,107,0,0.35)" strokeDasharray="6 4">
                    <Label value={`PB ${personalBest}kg`} position="insideTopRight"
                      fill="var(--color-accent)" fontSize={10}
                      fontFamily="DM Mono" />
                  </ReferenceLine>
                  <Line yAxisId="left" type="monotone" dataKey="maxWeight"
                    stroke="var(--color-accent)" strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-accent)', stroke: '#000', strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: 'var(--color-accent)', stroke: '#fff', strokeWidth: 2 }}
                    name="maxWeight" />
                  <Line yAxisId="right" type="monotone" dataKey="maxReps"
                    stroke="var(--color-success)" strokeWidth={2} strokeDasharray="6 3"
                    dot={{ r: 3, fill: 'var(--color-success)', stroke: '#000', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: 'var(--color-success)', stroke: '#fff', strokeWidth: 2 }}
                    name="maxReps" />
                  <Brush dataKey="date" height={28} stroke="rgba(255,255,255,0.08)"
                    fill="var(--color-concrete)" tickFormatter={formatDate}
                    travellerWidth={10} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {selectedPoint !== null && chartData[selectedPoint] && (
            <div className="brutal-card-sm p-3 animate-slide-up"
              style={{ borderLeft: `4px solid ${TYPE_COLORS[selectedType]}` }}>
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
                    {s.notes ? (
                      <span className="text-warning italic text-[10px] ml-1">"{s.notes}"</span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t flex gap-3 text-xs font-mono text-text-dim"
                style={{ borderColor: 'var(--color-steel-light)' }}>
                <span>Max: <span className="text-accent font-bold">{chartData[selectedPoint].maxWeight}kg</span></span>
                <span>Vol: <span className="text-text">{chartData[selectedPoint].volume}kg</span></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
