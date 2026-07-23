// Übungs-Bibliothek + Workout-Template-Builder.
// Übungen: Name, Equipment, Muskel-Zuordnung (primär/sekundär).
// Workouts: frei benannte Zusammenstellungen aus der Bibliothek.

import { useMemo, useState } from 'react';
import {
  BookOpen, Plus, Pencil, Trash2, X, Check, ChevronUp, ChevronDown,
  Dumbbell, AlertTriangle, Layers,
} from 'lucide-react';
import type { ExerciseDef, Equipment } from '../data/model';
import { EQUIPMENT_LABELS, TEMPLATE_COLOR_CHOICES } from '../data/model';
import type { MuscleId, MuscleRole } from '../data/muscles';
import { MUSCLES, MUSCLE_BY_ID } from '../data/muscles';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
}

// ===== Muskel-Chips (Anzeige) =====

export function MuscleTags({ muscles }: { muscles: ExerciseDef['muscles'] }) {
  if (muscles.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] text-warning font-mono">
        <AlertTriangle className="w-2.5 h-2.5" /> keine Muskeln zugeordnet
      </span>
    );
  }
  const sorted = [...muscles].sort((a, b) => (a.role === b.role ? 0 : a.role === 'primary' ? -1 : 1));
  return (
    <span className="inline-flex flex-wrap gap-1">
      {sorted.map(({ muscle, role }) => (
        <span key={muscle}
          className="text-[9px] font-mono px-1.5 py-0.5 border"
          style={role === 'primary'
            ? { backgroundColor: 'var(--color-accent)', color: '#000', borderColor: '#000', fontWeight: 700 }
            : { backgroundColor: 'var(--color-concrete)', color: 'var(--color-text-dim)', borderColor: '#3d3d3d' }}>
          {MUSCLE_BY_ID[muscle].short}
        </span>
      ))}
    </span>
  );
}

// ===== Übungs-Editor =====

interface ExerciseDraft {
  name: string;
  equipment: Equipment;
  muscles: { muscle: MuscleId; role: MuscleRole }[];
}

function emptyDraft(): ExerciseDraft {
  return { name: '', equipment: 'machine', muscles: [] };
}

function ExerciseEditor({ initial, existingNames, onSave, onCancel }: {
  initial: ExerciseDraft;
  existingNames: string[];
  onSave: (draft: ExerciseDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ExerciseDraft>(initial);

  const roleOf = (m: MuscleId): MuscleRole | null =>
    draft.muscles.find(x => x.muscle === m)?.role ?? null;

  // Tippen wechselt: aus → primär → sekundär → aus
  const cycleMuscle = (m: MuscleId) => {
    setDraft(d => {
      const current = d.muscles.find(x => x.muscle === m)?.role ?? null;
      const rest = d.muscles.filter(x => x.muscle !== m);
      if (current === null) return { ...d, muscles: [...rest, { muscle: m, role: 'primary' }] };
      if (current === 'primary') return { ...d, muscles: [...rest, { muscle: m, role: 'secondary' }] };
      return { ...d, muscles: rest };
    });
  };

  const name = draft.name.trim();
  const duplicate = existingNames.includes(name) && name !== initial.name.trim();
  const valid = name.length > 0 && !duplicate;

  return (
    <div className="brutal-card-inset p-3 mt-2 space-y-3 animate-slide-up">
      <input type="text" value={draft.name} autoFocus
        onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        placeholder="Übungsname..."
        className="brutal-input w-full px-3 py-2.5 text-sm font-mono" />
      {duplicate && (
        <p className="text-[10px] text-danger font-mono">Eine Übung mit diesem Namen existiert bereits.</p>
      )}

      <div>
        <span className="section-label">Equipment</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map(eq => (
            <button key={eq} onClick={() => setDraft(d => ({ ...d, equipment: eq }))}
              className={`brutal-chip px-2.5 py-1.5 text-[11px] ${draft.equipment === eq ? 'active' : ''}`}>
              {EQUIPMENT_LABELS[eq]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="section-label">Muskeln</span>
          <span className="text-[9px] text-text-muted font-mono">
            Tippen: <span className="text-accent font-bold">primär</span> → sekundär → aus
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {MUSCLES.map(m => {
            const role = roleOf(m.id);
            return (
              <button key={m.id} onClick={() => cycleMuscle(m.id)}
                className="flex items-center justify-between px-2.5 py-2 border text-left transition-all min-h-[38px]"
                style={role === 'primary'
                  ? { backgroundColor: 'var(--color-accent)', color: '#000', borderColor: '#000', boxShadow: '2px 2px 0 #000' }
                  : role === 'secondary'
                    ? { backgroundColor: 'var(--color-steel-light)', color: 'var(--color-text)', borderColor: '#000' }
                    : { backgroundColor: 'var(--color-concrete)', color: 'var(--color-text-muted)', borderColor: '#3d3d3d' }}>
                <span className="text-[11px] font-mono">{m.label}</span>
                {role && (
                  <span className="text-[8px] font-bold uppercase tracking-wider font-display">
                    {role === 'primary' ? 'PRI' : 'SEK'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => valid && onSave({ ...draft, name })} disabled={!valid}
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

// ===== Template-Editor =====

function TemplateEditor({ tpl, exercises, onSave, onCancel }: {
  tpl: { name: string; color: string; exerciseNames: string[] };
  exercises: ExerciseDef[];
  onSave: (t: { name: string; color: string; exerciseNames: string[] }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(tpl.name);
  const [color, setColor] = useState(tpl.color);
  const [selected, setSelected] = useState<string[]>(tpl.exerciseNames);

  const toggle = (exName: string) => {
    setSelected(prev => prev.includes(exName) ? prev.filter(n => n !== exName) : [...prev, exName]);
  };

  const move = (idx: number, dir: -1 | 1) => {
    setSelected(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Leeres Workout ist erlaubt — Übungen kommen beim Training dazu und bleiben erhalten
  const valid = name.trim().length > 0;

  return (
    <div className="brutal-card-inset p-3 mt-2 space-y-3 animate-slide-up">
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder='Workout-Name, z. B. "Upper A"' autoFocus
        className="brutal-input w-full px-3 py-2.5 text-sm font-mono" />

      <div>
        <span className="section-label">Farbe</span>
        <div className="flex gap-1.5 mt-1">
          {TEMPLATE_COLOR_CHOICES.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-8 h-8 border-2 transition-transform"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'var(--color-text)' : '#000',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={`Farbe ${c}`} />
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div>
          <span className="section-label">Reihenfolge ({selected.length})</span>
          <div className="space-y-1 mt-1">
            {selected.map((n, i) => (
              <div key={n} className="flex items-center gap-2 px-2 py-1.5"
                style={{ backgroundColor: 'var(--color-steel)', border: '1px solid #000' }}>
                <span className="text-[10px] text-text-muted font-mono w-4">{i + 1}.</span>
                <span className="text-xs text-text font-mono flex-1 truncate">{n}</span>
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="text-text-muted disabled:opacity-20 p-1"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === selected.length - 1}
                  className="text-text-muted disabled:opacity-20 p-1"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggle(n)} className="text-text-muted hover:text-danger p-1">
                  <X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="section-label">Übungen wählen</span>
        <div className="grid grid-cols-2 gap-1.5 mt-1 max-h-56 overflow-y-auto">
          {exercises.map(ex => {
            const active = selected.includes(ex.name);
            return (
              <button key={ex.id} onClick={() => toggle(ex.name)}
                className="px-2.5 py-2 border text-left text-[11px] font-mono truncate min-h-[38px] transition-all"
                style={active
                  ? { backgroundColor: color, color: '#000', borderColor: '#000', fontWeight: 700 }
                  : { backgroundColor: 'var(--color-concrete)', color: 'var(--color-text-dim)', borderColor: '#3d3d3d' }}>
                {ex.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => valid && onSave({ name: name.trim(), color, exerciseNames: selected })}
          disabled={!valid}
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

// ===== Hauptview =====

export function LibraryView({ ledger }: Props) {
  const { exercises, templates, addExercise, updateExercise, deleteExercise,
    addTemplate, updateTemplate, deleteTemplate, workouts } = ledger;

  const [section, setSection] = useState<'exercises' | 'templates'>('exercises');
  const [editingExercise, setEditingExercise] = useState<string | 'new' | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sortedExercises = useMemo(
    () => [...exercises].sort((a, b) => a.name.localeCompare(b.name, 'de')),
    [exercises]
  );

  const usageCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of workouts) {
      for (const ex of w.exercises) map.set(ex.name, (map.get(ex.name) || 0) + 1);
    }
    return map;
  }, [workouts]);

  const unmappedCount = exercises.filter(e => e.muscles.length === 0).length;

  const handleSaveExercise = (draft: ExerciseDraft, id: string | 'new') => {
    if (id === 'new') addExercise({ ...draft });
    else updateExercise(id, draft);
    setEditingExercise(null);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h1 className="text-3xl tracking-wider text-text font-display">Bibliothek</h1>
          <p className="text-xs text-text-dim uppercase tracking-widest font-mono">
            {exercises.length} Übungen · {templates.length} Workouts
          </p>
        </div>
        <BookOpen className="w-8 h-8 text-accent" />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setSection('exercises')}
          className={`brutal-chip flex-1 justify-center py-2.5 text-sm gap-1.5 ${section === 'exercises' ? 'active' : ''}`}>
          <Dumbbell className="w-3.5 h-3.5" /> Übungen
        </button>
        <button onClick={() => setSection('templates')}
          className={`brutal-chip flex-1 justify-center py-2.5 text-sm gap-1.5 ${section === 'templates' ? 'active' : ''}`}>
          <Layers className="w-3.5 h-3.5" /> Workouts
        </button>
      </div>

      {section === 'exercises' && (
        <div className="animate-fade-in">
          {unmappedCount > 0 && (
            <div className="brutal-card-inset px-3 py-2 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
              <span className="text-[10px] text-text-dim font-mono">
                {unmappedCount} Übung{unmappedCount > 1 ? 'en' : ''} ohne Muskel-Zuordnung —
                zuordnen, damit das Muskel-Tracking vollständig ist.
              </span>
            </div>
          )}

          {editingExercise === 'new' ? (
            <ExerciseEditor initial={emptyDraft()}
              existingNames={exercises.map(e => e.name)}
              onSave={d => handleSaveExercise(d, 'new')}
              onCancel={() => setEditingExercise(null)} />
          ) : (
            <button onClick={() => setEditingExercise('new')}
              className="brutal-btn brutal-btn-accent w-full py-3 text-sm mb-3">
              <Plus className="w-4 h-4" /> Neue Übung
            </button>
          )}

          <div className="space-y-2 mt-3">
            {sortedExercises.map(ex => (
              <div key={ex.id} className="brutal-card-sm p-3"
                style={ex.muscles.length === 0 ? { borderLeft: '4px solid var(--color-warning)' } : {}}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text font-display tracking-wider">{ex.name}</span>
                      <span className="text-[9px] text-text-muted font-mono uppercase">
                        {EQUIPMENT_LABELS[ex.equipment]}
                      </span>
                      {(usageCount.get(ex.name) ?? 0) > 0 && (
                        <span className="text-[9px] text-text-muted font-mono">
                          {usageCount.get(ex.name)}× geloggt
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5"><MuscleTags muscles={ex.muscles} /></div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingExercise(editingExercise === ex.id ? null : ex.id)}
                      className="p-1.5 text-text-muted hover:text-accent transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!ex.builtin && (
                      confirmDelete === ex.id ? (
                        <button onClick={() => { deleteExercise(ex.id); setConfirmDelete(null); }}
                          className="p-1.5 text-danger font-mono text-[10px] font-bold">OK?</button>
                      ) : (
                        <button onClick={() => setConfirmDelete(ex.id)}
                          className="p-1.5 text-text-muted hover:text-danger transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
                {editingExercise === ex.id && (
                  <ExerciseEditor
                    initial={{ name: ex.name, equipment: ex.equipment, muscles: [...ex.muscles] }}
                    existingNames={exercises.filter(e => e.id !== ex.id).map(e => e.name)}
                    onSave={d => handleSaveExercise(d, ex.id)}
                    onCancel={() => setEditingExercise(null)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'templates' && (
        <div className="animate-fade-in">
          {editingTemplate === 'new' ? (
            <TemplateEditor
              tpl={{ name: '', color: TEMPLATE_COLOR_CHOICES[0], exerciseNames: [] }}
              exercises={sortedExercises}
              onSave={t => { addTemplate(t); setEditingTemplate(null); }}
              onCancel={() => setEditingTemplate(null)} />
          ) : (
            <button onClick={() => setEditingTemplate('new')}
              className="brutal-btn brutal-btn-accent w-full py-3 text-sm mb-3">
              <Plus className="w-4 h-4" /> Neues Workout
            </button>
          )}

          <div className="space-y-2 mt-3">
            {templates.map(tpl => (
              <div key={tpl.id} className="brutal-card-sm p-3"
                style={{ borderLeft: `4px solid ${tpl.color}` }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text font-display tracking-wider">{tpl.name}</span>
                      {tpl.preset && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 border uppercase tracking-wider"
                          style={{ borderColor: '#3d3d3d', color: 'var(--color-text-muted)' }}>
                          Preset
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-dim font-mono mt-0.5 truncate">
                      {tpl.exerciseNames.length > 0
                        ? tpl.exerciseNames.join(' · ')
                        : 'Keine Übungen'}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingTemplate(editingTemplate === tpl.id ? null : tpl.id)}
                      className="p-1.5 text-text-muted hover:text-accent transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!tpl.preset && (
                      confirmDelete === tpl.id ? (
                        <button onClick={() => { deleteTemplate(tpl.id); setConfirmDelete(null); }}
                          className="p-1.5 text-danger font-mono text-[10px] font-bold">OK?</button>
                      ) : (
                        <button onClick={() => setConfirmDelete(tpl.id)}
                          className="p-1.5 text-text-muted hover:text-danger transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
                {editingTemplate === tpl.id && (
                  <TemplateEditor
                    tpl={{ name: tpl.name, color: tpl.color, exerciseNames: [...tpl.exerciseNames] }}
                    exercises={sortedExercises}
                    onSave={t => { updateTemplate(tpl.id, t); setEditingTemplate(null); }}
                    onCancel={() => setEditingTemplate(null)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
