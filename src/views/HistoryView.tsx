// Verlauf: filterbar nach Workout (Presets + eigene Templates), sortierbar,
// aufklappbare Karten mit Satz-Details, Tonnage, Löschen.

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Trash2, ArrowUpDown } from 'lucide-react';
import { workoutLabel, workoutColor } from '../data/model';
import { sessionTonnage } from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
}

// Zahl mit deutschem Komma (7.5 → "7,5")
function fmtNum(n: number): string {
  return String(n).replace('.', ',');
}

export function HistoryView({ ledger }: Props) {
  const { workouts, templates, deleteWorkout } = ledger;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filteroptionen aus tatsächlich vorhandenen Labels ableiten
  const labels = useMemo(() => {
    const seen = new Set<string>();
    for (const w of workouts) seen.add(workoutLabel(w));
    return [...seen];
  }, [workouts]);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? [...workouts] : workouts.filter(w => workoutLabel(w) === filter);
    list.sort((a, b) => sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    return list;
  }, [workouts, filter, sortNewest]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h1 className="text-3xl tracking-wider text-text font-display">Verlauf</h1>
        <button onClick={() => setSortNewest(!sortNewest)}
          className="brutal-chip px-3 py-1.5 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortNewest ? 'Neueste' : 'Älteste'}</span>
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setFilter('all')}
          className={`brutal-chip px-4 py-2 flex-shrink-0 ${filter === 'all' ? 'active' : ''}`}>
          Alle
        </button>
        {labels.map(label => {
          const sample = workouts.find(w => workoutLabel(w) === label);
          const color = sample ? workoutColor(sample, templates) : 'var(--color-accent)';
          return (
            <button key={label} onClick={() => setFilter(label)}
              className="brutal-chip px-4 py-2 whitespace-nowrap flex-shrink-0"
              style={filter === label ? { backgroundColor: color, color: '#000', borderColor: '#000', boxShadow: '3px 3px 0 #000' } : {}}>
              {label}
            </button>
          );
        })}
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
          {filtered.map((w, i) => {
            const color = workoutColor(w, templates);
            return (
              <div key={w.id} className="brutal-card-sm overflow-hidden animate-slide-up"
                style={{ animationDelay: `${Math.min(i, 10) * 0.02}s`, borderLeft: `4px solid ${color}` }}>
                <button
                  onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                  className="w-full flex items-center gap-3 p-3 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-text font-display tracking-wider">
                        {workoutLabel(w)}
                      </span>
                      <span className="text-xs text-text-muted font-mono">{formatDate(w.date)}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-text-dim font-mono">
                      <span>{w.exercises.length} Übungen</span>
                      <span>{w.exercises.reduce((s, e) => s + e.sets.length, 0)} Sätze</span>
                      <span className="text-accent font-medium">
                        {Math.round(sessionTonnage(w)).toLocaleString('de-DE')}kg
                      </span>
                    </div>
                  </div>
                  {expanded === w.id
                    ? <ChevronDown className="w-5 h-5 text-text-dim flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-text-dim flex-shrink-0" />}
                </button>

                {expanded === w.id && (
                  <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'var(--color-steel-light)' }}>
                    {w.exercises.map(ex => (
                      <div key={ex.name} className="pt-2">
                        <div className="text-xs font-bold text-text font-display tracking-wider mb-1.5">{ex.name}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map((s, si) => (
                            <span key={si} className="brutal-card-inset inline-flex items-center gap-1 px-2 py-1 text-xs">
                              <span className="text-text-muted">{si + 1}.</span>
                              <span className="text-accent font-bold weight-display">{fmtNum(s.weight)}</span>
                              <span className="text-text-dim">kg ×</span>
                              <span className="text-text font-medium">{fmtNum(s.reps)}</span>
                              {s.rir != null && <span className="text-warning ml-0.5 text-[10px]">{fmtNum(s.rir)}RIR</span>}
                              {s.notes && <span className="text-text-muted ml-0.5 truncate max-w-24 italic text-[10px]">{s.notes}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {confirmDelete === w.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-danger font-mono">Wirklich löschen?</span>
                        <button onClick={() => { deleteWorkout(w.id); setConfirmDelete(null); }}
                          className="brutal-btn px-3 py-1.5 text-xs"
                          style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>Ja</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="brutal-btn brutal-btn-dark px-3 py-1.5 text-xs">Nein</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(w.id)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-danger hover:text-red-300
                          transition-colors font-display tracking-wider uppercase py-1">
                        <Trash2 className="w-3 h-3" /> Löschen
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
