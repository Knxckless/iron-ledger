import { useState } from 'react';
import { Save, Plus, X, Trash2, Dumbbell } from 'lucide-react';
import type { WorkoutEntry, ExerciseEntry } from '../data/seedData';
import { useExerciseTemplates } from '../hooks/useExerciseTemplates';

const TYPES = ['pull', 'push', 'leg'] as const;
const TYPE_COLORS: Record<string, string> = { pull: '#448aff', push: '#ff5252', leg: '#69f0ae' };
const TYPE_LABELS: Record<string, string> = { pull: 'Pull', push: 'Push', leg: 'Leg' };

interface Props {
  onSave: (entry: Omit<WorkoutEntry, 'id'>) => void;
}

export function TodayView({ onSave }: Props) {
  const { getExercises, addExercise, removeExercise } = useExerciseTemplates();
  const [type, setType] = useState<string>('pull');
  const [exercises, setExercises] = useState<ExerciseEntry[]>(() =>
    getExercises(type).map(name => ({ name, sets: [{ weight: 0, reps: 0, notes: '' }] }))
  );
  const [saved, setSaved] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setExercises(getExercises(newType).map(name => ({ name, sets: [{ weight: 0, reps: 0, notes: '' }] })));
    setSaved(false);
    setShowAddExercise(false);
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'notes', value: string | number) => {
    setExercises(prev => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const addSet = (exIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets, { weight: 0, reps: 0, notes: '' }] };
      return updated;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
      updated[exIdx] = { ...updated[exIdx], sets: sets.length ? sets : [{ weight: 0, reps: 0, notes: '' }] };
      return updated;
    });
  };

  const handleRemoveExercise = (exIdx: number) => {
    const name = exercises[exIdx].name;
    removeExercise(type, name);
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  };

  const handleAddExercise = () => {
    const name = newExerciseName.trim();
    if (!name) return;
    addExercise(type, name);
    setExercises(prev => [...prev, { name, sets: [{ weight: 0, reps: 0, notes: '' }] }]);
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const handleSave = () => {
    const validExercises = exercises
      .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.weight > 0 && s.reps > 0) }))
      .filter(ex => ex.sets.length > 0);
    if (validExercises.length === 0) return;
    onSave({ date: new Date().toISOString().split('T')[0], type: type as WorkoutEntry['type'], exercises: validExercises });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasData = exercises.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h1 className="text-3xl tracking-wider text-text font-display">Training</h1>
          <p className="text-xs text-text-dim uppercase tracking-widest">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Dumbbell className="w-8 h-8 text-accent" />
      </div>

      <div className="flex gap-2 mb-5">
        {TYPES.map((t, i) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`brutal-chip flex-1 justify-center py-2.5 text-sm animate-slide-up stagger-${i + 1} ${
              type === t ? 'active' : ''
            }`}
            style={type === t ? { backgroundColor: TYPE_COLORS[t], color: '#000' } : {}}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {exercises.map((ex, exIdx) => (
          <div key={ex.name} className="brutal-card-sm p-3 animate-slide-up"
            style={{ borderLeft: `4px solid ${TYPE_COLORS[type]}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text font-display tracking-wider">{ex.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{ex.sets.length}S</span>
                <button onClick={() => handleRemoveExercise(exIdx)}
                  className="text-text-muted hover:text-danger transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted w-4 text-right font-mono">{setIdx + 1}</span>
                  <input type="number" inputMode="decimal" placeholder="0"
                    value={set.weight || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="brutal-input w-16 px-2 py-2 text-sm text-center font-mono" />
                  <span className="text-text-muted text-[10px] uppercase font-mono">kg</span>
                  <input type="number" inputMode="numeric" placeholder="0"
                    value={set.reps || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value ? parseInt(e.target.value) : 0)}
                    className="brutal-input w-16 px-2 py-2 text-sm text-center font-mono" />
                  <input type="text" inputMode="text" placeholder="Notiz"
                    value={set.notes || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'notes', e.target.value)}
                    className="brutal-input flex-1 px-2 py-2 text-xs font-mono min-w-0" />
                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(exIdx, setIdx)}
                      className="text-text-muted hover:text-danger flex-shrink-0 p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => addSet(exIdx)}
              className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-hot transition-colors font-display tracking-wider uppercase">
              <Plus className="w-3 h-3" /> Satz
            </button>
          </div>
        ))}
      </div>

      {showAddExercise ? (
        <div className="brutal-card-sm p-3 mt-3 animate-slide-up">
          <div className="flex gap-2">
            <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddExercise()}
              placeholder="Übungsname..." autoFocus
              className="brutal-input flex-1 px-3 py-2 text-sm font-mono" />
            <button onClick={handleAddExercise} disabled={!newExerciseName.trim()}
              className="brutal-btn brutal-btn-accent px-3 py-2 text-sm">
              OK
            </button>
            <button onClick={() => setShowAddExercise(false)}
              className="brutal-btn brutal-btn-dark px-3 py-2 text-sm">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddExercise(true)}
          className="mt-3 w-full py-3 brutal-card-sm text-text-dim flex items-center justify-center gap-2 hover:text-text transition-colors animate-slide-up font-display tracking-wider uppercase text-sm">
          <Plus className="w-4 h-4" /> Übung hinzufügen
        </button>
      )}

      <button onClick={handleSave} disabled={!hasData}
        className={`brutal-btn w-full py-3.5 mt-4 text-lg animate-slam-in ${
          saved ? '' : hasData ? 'brutal-btn-accent' : 'brutal-btn-dark'
        }`}
        style={saved ? { backgroundColor: 'var(--color-success)', color: '#000' } : {}}>
        <Save className="w-4 h-4" />
        {saved ? 'GESPEICHERT' : 'Training speichern'}
      </button>
    </div>
  );
}
