import { useMemo, useState } from 'react';
import { Flame, Calendar, ArrowRight, Zap, Trophy, Crown, Medal } from 'lucide-react';
import { BodyMap } from '../components/BodyMap';
import type { WorkoutEntry } from '../data/seedData';

interface Props {
  workouts: WorkoutEntry[];
  onStartTraining: () => void;
}

const TYPE_LABELS: Record<string, string> = { pull: 'Pull', push: 'Push', leg: 'Leg' };
const TYPE_COLORS: Record<string, string> = { pull: '#448aff', push: '#ff5252', leg: '#69f0ae' };

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function Mascot({ type }: { type: string }) {
  if (type === 'push') {
    return (
      <div className="w-14 h-14 relative flex items-end justify-center" style={{ animation: 'pressUp 1.5s ease-in-out infinite' }}>
        <div className="w-10 h-2 bg-text rounded-sm" />
        <div className="absolute bottom-2 left-1 w-3 h-6 bg-accent rounded-t-sm opacity-80" style={{ animation: 'plateSlideLeft 1.5s ease-in-out infinite' }} />
        <div className="absolute bottom-2 right-1 w-3 h-6 bg-accent rounded-t-sm opacity-80" style={{ animation: 'plateSlideRight 1.5s ease-in-out infinite' }} />
      </div>
    );
  }
  if (type === 'pull') {
    return (
      <div className="w-14 h-14 relative flex items-start justify-center" style={{ animation: 'pullUp 1.5s ease-in-out infinite' }}>
        <div className="w-10 h-1.5 bg-text rounded-sm mt-3" />
        <div className="absolute top-1 left-1 w-2.5 h-5 bg-pull rounded-b-sm opacity-70" />
        <div className="absolute top-1 right-1 w-2.5 h-5 bg-pull rounded-b-sm opacity-70" />
        <div className="absolute top-0 left-2 w-2 h-2 bg-text rounded-full" style={{ animation: 'cableUp 1.5s ease-in-out infinite' }} />
        <div className="absolute top-0 right-2 w-2 h-2 bg-text rounded-full" style={{ animation: 'cableUp 1.5s ease-in-out infinite 0.2s' }} />
      </div>
    );
  }
  // leg
  return (
    <div className="w-14 h-14 relative flex items-end justify-center" style={{ animation: 'squat 2s ease-in-out infinite' }}>
      <div className="w-8 h-1.5 bg-text rounded-sm mb-2" />
      <div className="absolute top-1 left-1.5 w-2 h-10 bg-leg rounded-sm opacity-50" />
      <div className="absolute top-1 right-1.5 w-2 h-10 bg-leg rounded-sm opacity-50" />
      <div className="absolute top-5 left-0 w-1.5 h-3 bg-leg rounded-full" />
      <div className="absolute top-5 right-0 w-1.5 h-3 bg-leg rounded-full" />
    </div>
  );
}

export function HomeView({ workouts, onStartTraining }: Props) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = workouts.length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const lastWorkout = workouts[0];

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedByDate = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 0; i < sortedByDate.length; i++) {
      const d = new Date(sortedByDate[i].date);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++;
      } else break;
    }

    return { total, thisWeek, lastWorkout, streak };
  }, [workouts]);

  // Heatmap
  const heatmap = useMemo(() => {
    const weeks: { label: string; days: { date: string; count: number; types: string[] }[] }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const dayWorkouts = workouts.filter(wk => wk.date === dateStr);
        days.push({ date: dateStr, count: dayWorkouts.length, types: dayWorkouts.map(wk => wk.type) });
      }
      const monday = new Date(weekStart);
      weeks.push({ label: `${monday.getDate()}.${monday.getMonth() + 1}.`, days });
    }
    return weeks;
  }, [workouts]);

  // Tier List
  const tierList = useMemo(() => {
    const recent = workouts.slice(0, 5);
    if (recent.length === 0) return [];

    const scored = recent.map(w => ({
      ...w,
      maxWeight: w.exercises.reduce((mx, e) => Math.max(mx, ...e.sets.map(s => s.weight)), 0),
      totalSets: w.exercises.reduce((s, e) => s + e.sets.length, 0),
      volume: w.exercises.reduce((v, e) => v + e.sets.reduce((sv, s) => sv + (s.weight * s.reps), 0), 0),
    }));

    const maxVol = Math.max(...scored.map(s => s.volume), 1);
    const scored2 = scored.map(s => ({ ...s, score: s.volume / maxVol }));

    const tiers = [
      { tier: 'S', label: 'S-Tier', icon: Crown, color: '#ffd600', border: '#ffd600', min: 0.8 },
      { tier: 'A', label: 'A-Tier', icon: Medal, color: '#c0c0c0', border: '#c0c0c0', min: 0.6 },
      { tier: 'B', label: 'B-Tier', icon: Medal, color: '#cd7f32', border: '#cd7f32', min: 0.4 },
      { tier: 'C', label: 'C-Tier', icon: Medal, color: '#666', border: '#444', min: 0 },
    ];

    return scored2.map(s => {
      const assigned = tiers.find(t => s.score >= t.min) || tiers[tiers.length - 1];
      return { ...s, ...assigned };
    });
  }, [workouts]);

  // Timeline
  const timeline = useMemo(() => {
    return workouts.slice(0, 6).map((w) => ({
      ...w,
      maxWeight: w.exercises.reduce((mx, e) => Math.max(mx, ...e.sets.map(s => s.weight)), 0),
      totalSets: w.exercises.reduce((s, e) => s + e.sets.length, 0),
    }));
  }, [workouts]);

  // Last workout type for mascot
  const mascotType = stats.lastWorkout?.type || 'push';

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="p-4">
      {/* HEADER with Mascot */}
      <div className="mb-5 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl tracking-wider text-text font-display">IRON</h1>
            <h1 className="text-3xl tracking-wider text-text font-display -mt-1">LEDGER</h1>
          </div>
          <Mascot type={mascotType} />
        </div>
        <p className="text-text-dim text-xs uppercase tracking-widest font-mono">{today}</p>
      </div>

      {/* Anim keyframes injected once */}
      <style>{`
        @keyframes pressUp {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        @keyframes plateSlideLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
        @keyframes plateSlideRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        @keyframes pullUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes cableUp {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes squat {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(3px) scaleY(0.85); }
        }
      `}</style>

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { icon: Flame, value: stats.total, label: 'Total', color: 'var(--color-accent)' },
          { icon: Zap, value: stats.thisWeek, label: 'Woche', color: 'var(--color-warning)' },
          { icon: Calendar, value: stats.streak, label: 'Streak', color: 'var(--color-success)' },
          { icon: Trophy, value: stats.lastWorkout ? TYPE_LABELS[stats.lastWorkout.type] : '--', label: 'Letztes', color: 'var(--color-accent)' },
        ].map((s, i) => (
          <div key={s.label} className="brutal-card-sm p-2 text-center animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <span className="stat-number block text-text" style={{ fontSize: typeof s.value === 'number' ? '1.4rem' : '0.85rem' }}>
              {s.value}
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-display">{s.label}</span>
          </div>
        ))}
      </div>

      {/* BODY MAP */}
      <BodyMap workouts={workouts} />

      {/* WORKOUT HEATMAP */}
      <div className="brutal-card-sm p-3 mt-5 mb-5 animate-slide-up stagger-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">12-Wochen Heatmap</h3>
          <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
            <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-concrete)', border: '1px solid #444' }} />
            <span>0</span>
            <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.3 }} />
            <span>1</span>
            <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.7 }} />
            <span>2</span>
            <span className="w-2.5 h-2.5 block" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span>3</span>
          </div>
        </div>
        <div className="flex gap-1">
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex-1 flex flex-col gap-1"
              onMouseEnter={() => setSelectedWeek(wi)}
              onMouseLeave={() => setSelectedWeek(null)}>
              <span className="text-[8px] text-text-muted text-center font-mono leading-none mb-0.5">
                {week.label}
              </span>
              {week.days.map((day, di) => {
                const maxOpacity = day.count > 0 ? Math.min(day.count * 0.4, 1) : 0;
                const isToday = day.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={di}
                    className="aspect-square rounded-sm transition-all cursor-pointer"
                    style={{
                      backgroundColor: day.count > 0
                        ? `color-mix(in srgb, var(--color-accent) ${maxOpacity * 100}%, var(--color-concrete))`
                        : 'var(--color-concrete)',
                      border: isToday ? '2px solid var(--color-text)' : '1px solid #333',
                      transform: selectedWeek === wi ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={day.count > 0 ? `${day.date}: ${day.count} Workout(s)` : day.date}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[7px] text-text-muted font-mono uppercase">
          <span>Mo</span><span>Mi</span><span>Fr</span><span>So</span>
        </div>
      </div>

      {/* TIER LIST */}
      {tierList.length > 0 && (
        <div className="brutal-card-sm p-3 mb-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-warning" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Tier List</h3>
            <span className="text-[10px] text-text-muted font-mono">Letzte {tierList.length} Trainings</span>
          </div>
          <div className="space-y-2">
            {tierList.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.id}
                  className="brutal-card-inset p-2.5 animate-slide-up flex items-center gap-3"
                  style={{
                    animationDelay: `${0.2 + i * 0.05}s`,
                    borderLeft: `4px solid ${item.border}`,
                    boxShadow: item.tier === 'S' ? '0 0 12px rgba(255,214,0,0.15)' : 'none',
                  }}>
                  <div className="flex items-center gap-1.5 min-w-[36px]">
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-sm font-bold font-display tracking-wider" style={{ color: item.color }}>
                      {item.tier}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text font-display tracking-wider">
                          {TYPE_LABELS[item.type]}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{formatDay(item.date)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] text-text-dim font-mono mt-0.5">
                      <span>{item.exercises.length} Üb.</span>
                      <span>{item.totalSets} Sätze</span>
                      <span className="text-accent font-medium">{item.maxWeight}kg max</span>
                      <span className="text-text-muted">{Math.round(item.volume).toLocaleString()}kg vol</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TIMELINE */}
      <div className="mb-5 animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Deine Reise</h3>
          <span className="text-[10px] text-text-muted font-mono">{workouts.length} Workouts</span>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5"
            style={{
              background: 'repeating-linear-gradient(180deg, var(--color-accent) 0px, var(--color-accent) 3px, transparent 3px, transparent 8px)',
            }} />
          {timeline.map((w, i) => (
            <div key={w.id} className="relative mb-3 last:mb-0 animate-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
              <div className="absolute left-[-17px] top-1.5 w-3 h-3 border-2 border-black"
                style={{
                  backgroundColor: TYPE_COLORS[w.type] || 'var(--color-accent)',
                  transform: 'rotate(45deg)',
                }} />
              <div className="brutal-card-sm p-2.5"
                style={{ borderLeft: `4px solid ${TYPE_COLORS[w.type] || 'var(--color-accent)'}` }}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text font-display tracking-wider">
                      {TYPE_LABELS[w.type]}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{formatDay(w.date)}</span>
                  </div>
                  <span className="text-xs text-accent font-bold font-mono">{w.maxWeight}kg</span>
                </div>
                <div className="flex gap-3 text-[10px] text-text-dim font-mono">
                  <span>{w.exercises.length} Übungen</span>
                  <span>{w.totalSets} Sätze</span>
                  <span className="text-text-muted">
                    {w.exercises.map(e => e.name.split(' ')[0]).slice(0, 3).join(' · ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onStartTraining}
        className="brutal-btn brutal-btn-accent w-full py-4 text-lg animate-slam-in animate-pulse-border"
        style={{ fontSize: '1.3rem' }}>
        <span>Training starten</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
