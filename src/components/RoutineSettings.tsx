// Routine-Verwaltung in den Einstellungen: aktive Routine wählen + Routinen
// anlegen/bearbeiten/löschen. Eine Routine bündelt Workouts in Reihenfolge.

import { useState } from 'react';
import { ListChecks, Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import type { Routine } from '../data/model';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
}

interface DraftState {
  name: string;
  templateIds: string[];
}

function RoutineEditor({ initial, templates, onSave, onCancel }: {
  initial: DraftState;
  templates: Ledger['templates'];
  onSave: (d: DraftState) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [selected, setSelected] = useState<string[]>(initial.templateIds);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const move = (idx: number, dir: -1 | 1) => {
    setSelected(prev => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
  };

  const valid = name.trim().length > 0 && selected.length > 0;
  const nameOf = (id: string) => templates.find(t => t.id === id)?.name ?? '—';
  const colorOf = (id: string) => templates.find(t => t.id === id)?.color ?? '#666';

  return (
    <div className="brutal-card-inset p-3 mt-2 space-y-3 animate-slide-up">
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder='Routinen-Name, z. B. "PPL" oder "Upper/Lower"' autoFocus
        className="brutal-input w-full px-3 py-2.5 text-sm font-mono" />

      {selected.length > 0 && (
        <div>
          <span className="section-label">Reihenfolge ({selected.length})</span>
          <div className="space-y-1 mt-1">
            {selected.map((id, i) => (
              <div key={id} className="flex items-center gap-2 px-2 py-1.5"
                style={{ backgroundColor: 'var(--color-steel)', border: '1px solid #000', borderLeft: `4px solid ${colorOf(id)}` }}>
                <span className="text-[10px] text-text-muted font-mono w-4">{i + 1}.</span>
                <span className="text-xs text-text font-mono flex-1 truncate">{nameOf(id)}</span>
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="text-text-muted disabled:opacity-20 p-1"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === selected.length - 1}
                  className="text-text-muted disabled:opacity-20 p-1"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggle(id)} className="text-text-muted hover:text-danger p-1">
                  <X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="section-label">Workouts wählen</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {templates.map(t => {
            const active = selected.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggle(t.id)}
                className="brutal-chip px-2.5 py-1.5 text-[11px]"
                style={active ? { backgroundColor: t.color, color: '#000', borderColor: '#000' } : {}}>
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => valid && onSave({ name: name.trim(), templateIds: selected })} disabled={!valid}
          className="brutal-btn brutal-btn-accent flex-1 py-2.5 text-sm">
          <Check className="w-4 h-4" /> Speichern
        </button>
        <button onClick={onCancel} className="brutal-btn brutal-btn-dark px-4 py-2.5 text-sm">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function RoutineSettings({ ledger }: Props) {
  const { templates, routines, addRoutine, updateRoutine, deleteRoutine, settings, setActiveRoutineId } = ledger;
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const active = settings.activeRoutineId;

  return (
    <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Routine</h3>
      </div>
      <p className="text-[10px] text-text-dim font-mono mb-3">
        Wähle deine aktive Routine — im Training erscheinen dann oben nur deren Workouts.
      </p>

      {/* Aktive Routine wählen */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button onClick={() => setActiveRoutineId(undefined)}
          className={`brutal-chip px-3 py-1.5 text-[11px] ${!active ? 'active' : ''}`}>
          Alle Workouts
        </button>
        {routines.map(r => (
          <button key={r.id} onClick={() => setActiveRoutineId(r.id)}
            className={`brutal-chip px-3 py-1.5 text-[11px] ${active === r.id ? 'active' : ''}`}>
            {r.name}
          </button>
        ))}
      </div>

      {/* Routinen verwalten */}
      {editing === 'new' ? (
        <RoutineEditor initial={{ name: '', templateIds: [] }} templates={templates}
          onSave={d => { const created = addRoutine(d); setActiveRoutineId(created.id); setEditing(null); }}
          onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing('new')}
          className="brutal-btn brutal-btn-dark w-full py-2.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Neue Routine
        </button>
      )}

      {routines.length > 0 && (
        <div className="space-y-2 mt-3">
          {routines.map((r: Routine) => (
            <div key={r.id} className="brutal-card-inset p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-text font-display tracking-wider">{r.name}</span>
                  <p className="text-[10px] text-text-dim font-mono truncate">
                    {r.templateIds.length > 0
                      ? r.templateIds.map(id => templates.find(t => t.id === id)?.name).filter(Boolean).join(' · ')
                      : 'Keine Workouts'}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(editing === r.id ? null : r.id)}
                    className="p-1.5 text-text-muted hover:text-accent transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmDelete === r.id ? (
                    <button onClick={() => { deleteRoutine(r.id); setConfirmDelete(null); }}
                      className="p-1.5 text-danger font-mono text-[10px] font-bold">OK?</button>
                  ) : (
                    <button onClick={() => setConfirmDelete(r.id)}
                      className="p-1.5 text-text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {editing === r.id && (
                <RoutineEditor initial={{ name: r.name, templateIds: [...r.templateIds] }} templates={templates}
                  onSave={d => { updateRoutine(r.id, d); setEditing(null); }}
                  onCancel={() => setEditing(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
