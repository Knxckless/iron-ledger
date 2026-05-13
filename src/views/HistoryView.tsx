import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Trash2, ArrowUpDown } from 'lucide-react';
import type { WorkoutEntry } from '../data/seedData';

interface Props {
  workouts: WorkoutEntry[];
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = { pull: 'Pull', push: 'Push', leg: 'Leg' };
const TYPE_COLORS: Record<string, string> = { pull: '#448aff', push: '#ff5252', leg: '#69f0ae' };

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
}

export function HistoryView({ workouts, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...workouts] : workouts.filter(w => w.type === filter);
    if (sortNewest) {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list.sort((a, b) => a.date.localeCompare(b.date));
    }
    return list;
  }, [workouts, filter, sortNewest]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h1 className="text-3xl tracking-wider text-text font-display">Verlauf</h1>
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="brutal-chip px-3 py-1.5 flex items-center gap-1.5"
          title={sortNewest ? 'Neuste zuerst' : 'Älteste zuerst'}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortNewest ? 'Neueste' : 'Älteste'}</span>
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pull', 'push', 'leg'].map((f, i) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`brutal-chip px-4 py-2 animate-slide-up stagger-${i + 1} ${filter === f ? 'active' : ''}`}
            style={filter === f && f !== 'all' ? { backgroundColor: TYPE_COLORS[f], color: '#000' } : {}}
          >
            {f === 'all' ? 'Alle' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 brutal-card-sm flex items-center justify-center mx-auto mb-4"
            style={{ borderStyle: 'dashed' }}>
            <span className="text-2xl text-text-muted font-display">--</span>
          </div>
          <p className="text-text-muted text-sm uppercase tracking-widest font-display">Keine Einträge</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w, i) => (
            <div key={w.id} className="brutal-card-sm overflow-hidden animate-slide-up"
              style={{
                animationDelay: `${i * 0.02}s`,
                borderLeft: `4px solid ${TYPE_COLORS[w.type] || 'var(--color-accent)'}`,
              }}>
              <button
                onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-text font-display tracking-wider">
                      {TYPE_LABELS[w.type]}
                    </span>
                    <span className="text-xs text-text-muted">{formatDate(w.date)}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-text-dim">
                    <span>{w.exercises.length} Übungen</span>
                    <span>{w.exercises.reduce((s, e) => s + e.sets.length, 0)} Sätze</span>
                    <span className="text-accent font-medium">
                      max {w.exercises.reduce((mx, e) => Math.max(mx, ...e.sets.map(s => s.weight)), 0)}kg
                    </span>
                  </div>
                </div>
                {expanded === w.id ? (
                  <ChevronDown className="w-5 h-5 text-text-dim flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-dim flex-shrink-0" />
                )}
              </button>

              {expanded === w.id && (
                <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'var(--color-steel-light)' }}>
                  {w.exercises.map(ex => (
                    <div key={ex.name} className="pt-2">
                      <div className="text-xs font-bold text-text font-display tracking-wider mb-1.5">
                        {ex.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ex.sets.map((s, si) => (
                          <span key={si}
                            className="brutal-card-inset inline-flex items-center gap-1 px-2 py-1 text-xs">
                            <span className="text-text-muted">{si + 1}.</span>
                            <span className="text-accent font-bold weight-display">{s.weight}</span>
                            <span className="text-text-dim">kg</span>
                            <span className="text-text-dim">×</span>
                            <span className="text-text font-medium">{s.reps}</span>
                            {s.notes && (
                              <span className="text-text-muted ml-0.5 truncate max-w-16">{s.notes}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(w.id); }}
                    className="mt-2 flex items-center gap-1.5 text-xs text-danger hover:text-red-300 transition-colors font-display tracking-wider uppercase">
                    <Trash2 className="w-3 h-3" /> Löschen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
