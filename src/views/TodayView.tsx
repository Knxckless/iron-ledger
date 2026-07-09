// Training loggen: Workout-Template wählen (Presets + eigene), Sätze erfassen,
// Countdown-Pausentimer mit Vibration, letztes Training laden, PR-Erkennung.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Save, Plus, X, Dumbbell, ChevronDown, ChevronUp, Timer,
  Copy, Trophy, Pause, Play, RotateCcw,
} from 'lucide-react';
import type { WorkoutEntry, ExerciseEntry, WorkoutTemplate } from '../data/model';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleId } from '../data/muscles';
import { detectNewPRs, round1 } from '../lib/stats';
import type { NewPR } from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
}

const TIMER_PRESETS = [60, 90, 120, 180];

function emptySets(): ExerciseEntry['sets'] {
  return [{ weight: 0, reps: 0, notes: '' }];
}

// ===== Pausentimer (Countdown) =====

function RestTimer() {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [running]);

  const start = (secs: number) => {
    setDuration(secs);
    setRemaining(secs);
    endRef.current = Date.now() + secs * 1000;
    setRunning(true);
  };

  const resume = () => {
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progress = duration > 0 ? remaining / duration : 0;
  const done = !running && remaining === 0;

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)}
        className="w-full py-2.5 mb-4 brutal-card-sm text-text-dim flex items-center justify-center gap-2
          hover:text-accent transition-colors font-display tracking-wider uppercase text-xs">
        <Timer className="w-3.5 h-3.5" /> Pausentimer
      </button>
    );
  }

  return (
    <div className="brutal-card-sm p-3 mb-4 animate-slide-up"
      style={done ? { borderColor: 'var(--color-success)' } : {}}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {TIMER_PRESETS.map(s => (
            <button key={s} onClick={() => start(s)}
              className={`brutal-chip px-2 py-1 text-[10px] ${duration === s && (running || remaining > 0) ? 'active' : ''}`}>
              {s < 120 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>
        <button onClick={() => { setRunning(false); setRemaining(duration); setVisible(false); }}
          className="text-text-muted hover:text-danger p-1"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold font-mono tabular-nums tracking-wider"
          style={{ color: done ? 'var(--color-success)' : remaining <= 10 && running ? 'var(--color-warning)' : 'var(--color-text)' }}>
          {done ? 'GO!' : fmt(remaining)}
        </span>
        <div className="flex-1 h-3 border border-black" style={{ backgroundColor: 'var(--color-concrete)' }}>
          <div className="h-full transition-all duration-300"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: remaining <= 10 && running ? 'var(--color-warning)' : 'var(--color-accent)',
            }} />
        </div>
        <div className="flex gap-1">
          {running ? (
            <button onClick={() => setRunning(false)} className="brutal-chip px-2.5 py-1.5">
              <Pause className="w-3.5 h-3.5" /></button>
          ) : (
            <button onClick={() => remaining > 0 && remaining < duration ? resume() : start(duration)}
              className="brutal-chip px-2.5 py-1.5 active">
              <Play className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={() => { setRunning(false); setRemaining(duration); }}
            className="brutal-chip px-2.5 py-1.5"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

// ===== PR-Feier-Overlay =====

function PRCelebration({ prs, onClose }: { prs: NewPR[]; onClose: () => void }) {
  const kindLabel: Record<NewPR['kind'], string> = {
    weight: 'Max-Gewicht', reps: 'Max-Wdh.', e1rm: 'e1RM',
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="brutal-card p-5 max-w-sm w-full animate-slam-in"
        style={{ borderColor: 'var(--color-warning)', boxShadow: '6px 6px 0 #000, 0 0 40px rgba(255,214,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-warning"
            style={{ animation: 'slamIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }} />
          <h2 className="text-3xl font-display tracking-wider text-warning">NEUER REKORD!</h2>
        </div>
        <div className="space-y-2 mb-4">
          {prs.map((pr, i) => (
            <div key={i} className="brutal-card-inset px-3 py-2 flex items-center justify-between animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div>
                <span className="text-sm font-bold text-text font-display tracking-wider block">{pr.exerciseName}</span>
                <span className="text-[9px] text-text-muted font-mono uppercase">{kindLabel[pr.kind]}</span>
              </div>
              <span className="text-sm font-mono">
                <span className="text-text-muted">{round1(pr.previous)}</span>
                <span className="text-text-dim mx-1">→</span>
                <span className="text-warning font-bold">{round1(pr.value)}{pr.kind === 'reps' ? '' : ' kg'}</span>
              </span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="brutal-btn brutal-btn-accent w-full py-3 text-sm">
          Weiter
        </button>
      </div>
    </div>
  );
}

// ===== Hauptview =====

export function TodayView({ ledger }: Props) {
  const { templates, exercises: libraryExercises, exercisesByName, workouts, addWorkout, addExercise } = ledger;

  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? '');
  const template: WorkoutTemplate | undefined =
    templates.find(t => t.id === templateId) ?? templates[0];

  const [session, setSession] = useState<ExerciseEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPRs, setNewPRs] = useState<NewPR[] | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  const loadTemplate = useCallback((tpl: WorkoutTemplate | undefined) => {
    setSession((tpl?.exerciseNames ?? []).map(name => ({ name, sets: emptySets() })));
    setSaved(false);
    setShowAddExercise(false);
  }, []);

  // Erste Initialisierung, sobald Templates geladen sind
  useEffect(() => {
    if (!initialized && template) {
      loadTemplate(template);
      setTemplateId(template.id);
      setInitialized(true);
    }
  }, [initialized, template, loadTemplate]);

  const selectTemplate = (id: string) => {
    setTemplateId(id);
    loadTemplate(templates.find(t => t.id === id));
  };

  // Muskeln, die die heutige Session trifft (aus der Bibliothek abgeleitet)
  const sessionMuscles = useMemo(() => {
    const primary = new Set<MuscleId>();
    const secondary = new Set<MuscleId>();
    for (const ex of session) {
      const defn = exercisesByName.get(ex.name);
      if (!defn) continue;
      for (const { muscle, role } of defn.muscles) {
        if (role === 'primary') primary.add(muscle);
        else secondary.add(muscle);
      }
    }
    for (const m of primary) secondary.delete(m);
    return { primary: [...primary], secondary: [...secondary] };
  }, [session, exercisesByName]);

  const getLastThree = (exerciseName: string) =>
    workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .map(w => ({ date: w.date, exercise: w.exercises.find(e => e.name === exerciseName)! }))
      .filter(h => h.exercise.sets.some(s => s.weight > 0 && s.reps > 0))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

  const toggleRef = (name: string) => {
    setExpandedRefs(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  // Letztes Training dieses Templates als Vorlage laden
  const lastOfTemplate = useMemo(() => {
    if (!template) return null;
    return workouts.find(w =>
      w.templateId === template.id || (template.preset && w.type === template.preset)
    ) ?? null;
  }, [workouts, template]);

  const duplicateLast = () => {
    if (!lastOfTemplate) return;
    setSession(lastOfTemplate.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, notes: '' })),
    })));
    setSaved(false);
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'notes', value: string | number) => {
    setSession(prev => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const addSet = (exIdx: number) => {
    setSession(prev => {
      const updated = [...prev];
      const last = updated[exIdx].sets[updated[exIdx].sets.length - 1];
      // Neuer Satz übernimmt das Gewicht des letzten — spart Tipparbeit
      updated[exIdx] = {
        ...updated[exIdx],
        sets: [...updated[exIdx].sets, { weight: last?.weight || 0, reps: 0, notes: '' }],
      };
      return updated;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setSession(prev => {
      const updated = [...prev];
      const sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
      updated[exIdx] = { ...updated[exIdx], sets: sets.length ? sets : emptySets() };
      return updated;
    });
  };

  const removeSessionExercise = (exIdx: number) => {
    setSession(prev => prev.filter((_, i) => i !== exIdx));
  };

  const handleAddExercise = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!exercisesByName.has(trimmed)) {
      // Neue Übung landet automatisch in der Bibliothek (Muskeln später zuordnen)
      addExercise({ name: trimmed, equipment: 'machine', muscles: [] });
    }
    setSession(prev => [...prev, { name: trimmed, sets: emptySets() }]);
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const availableToAdd = useMemo(
    () => libraryExercises
      .filter(e => !session.some(s => s.name === e.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'de')),
    [libraryExercises, session]
  );

  const handleSave = () => {
    if (!template) return;
    const validExercises = session
      .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.weight > 0 && s.reps > 0) }))
      .filter(ex => ex.sets.length > 0);
    if (validExercises.length === 0) return;

    const entry: Omit<WorkoutEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      type: template.preset ?? 'custom',
      label: template.name,
      templateId: template.id,
      exercises: validExercises,
    };
    const prs = detectNewPRs(entry, workouts);
    addWorkout(entry);
    setSaved(true);
    if (prs.length > 0) setNewPRs(prs);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasData = session.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));
  const accentColor = template?.color ?? 'var(--color-accent)';

  return (
    <div className="p-4">
      {newPRs && <PRCelebration prs={newPRs} onClose={() => setNewPRs(null)} />}

      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h1 className="text-3xl tracking-wider text-text font-display">Training</h1>
          <p className="text-xs text-text-dim uppercase tracking-widest font-mono">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Dumbbell className="w-8 h-8 text-accent" />
      </div>

      <RestTimer />

      {/* Workout-Auswahl (Templates) */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {templates.map(t => (
          <button key={t.id} onClick={() => selectTemplate(t.id)}
            className="brutal-chip px-3.5 py-2.5 text-sm whitespace-nowrap flex-shrink-0"
            style={template?.id === t.id
              ? { backgroundColor: t.color, color: '#000', borderColor: '#000', boxShadow: '3px 3px 0 #000' }
              : {}}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Muskel-Vorschau der Session */}
      {(sessionMuscles.primary.length > 0 || sessionMuscles.secondary.length > 0) && (
        <div className="flex flex-wrap items-center gap-1 mb-3 animate-fade-in">
          <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider mr-1">Trifft:</span>
          {sessionMuscles.primary.map(m => (
            <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 border font-bold"
              style={{ backgroundColor: accentColor, color: '#000', borderColor: '#000' }}>
              {MUSCLE_BY_ID[m].short}
            </span>
          ))}
          {sessionMuscles.secondary.map(m => (
            <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 border"
              style={{ backgroundColor: 'var(--color-concrete)', color: 'var(--color-text-dim)', borderColor: '#3d3d3d' }}>
              {MUSCLE_BY_ID[m].short}
            </span>
          ))}
        </div>
      )}

      {lastOfTemplate && !hasData && (
        <button onClick={duplicateLast}
          className="w-full py-2.5 mb-3 brutal-card-sm text-text-dim flex items-center justify-center gap-2
            hover:text-accent transition-colors font-display tracking-wider uppercase text-xs animate-fade-in">
          <Copy className="w-3.5 h-3.5" />
          Letztes {template?.name}-Training laden ({new Date(lastOfTemplate.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})
        </button>
      )}

      <div className="space-y-3">
        {session.map((ex, exIdx) => (
          <div key={`${ex.name}-${exIdx}`} className="brutal-card-sm p-3 animate-slide-up"
            style={{ borderLeft: `4px solid ${accentColor}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold text-text font-display tracking-wider truncate">{ex.name}</span>
                <button onClick={() => toggleRef(ex.name)}
                  className="text-[10px] text-text-muted hover:text-accent transition-colors font-mono
                    flex items-center gap-0.5 brutal-chip px-1.5 py-0.5 flex-shrink-0">
                  Verlauf
                  {expandedRefs.has(ex.name)
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-text-muted font-mono">{ex.sets.length}S</span>
                <button onClick={() => removeSessionExercise(exIdx)}
                  className="text-text-muted hover:text-danger transition-colors p-1"
                  title="Aus dieser Session entfernen">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedRefs.has(ex.name) && (
              <div className="mb-2 p-2 animate-slide-up" style={{ backgroundColor: 'var(--color-concrete)' }}>
                {(() => {
                  const history = getLastThree(ex.name);
                  return history.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                        Letzte Trainings:
                      </span>
                      {history.map(h => (
                        <div key={h.date} className="text-[11px] text-text-dim font-mono leading-relaxed">
                          <span className="text-text-muted">
                            {new Date(h.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </span>
                          {' — '}
                          {h.exercise.sets
                            .filter(s => s.weight > 0 && s.reps > 0)
                            .map(s => `${s.weight}kg × ${s.reps}`)
                            .join(', ')}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-text-muted font-mono">Keine früheren Einträge</span>
                  );
                })()}
              </div>
            )}

            <div className="space-y-1.5">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted w-4 text-right font-mono">{setIdx + 1}</span>
                  <input type="number" inputMode="decimal" placeholder="0"
                    value={set.weight || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="brutal-input w-16 px-2 py-2.5 text-sm text-center font-mono" />
                  <span className="text-text-muted text-[10px] uppercase font-mono">kg</span>
                  <input type="number" inputMode="numeric" placeholder="0"
                    value={set.reps || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value ? parseInt(e.target.value) : 0)}
                    className="brutal-input w-14 px-2 py-2.5 text-sm text-center font-mono" />
                  <input type="text" placeholder="Notiz"
                    value={set.notes || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'notes', e.target.value)}
                    className="brutal-input flex-1 px-2 py-2.5 text-xs font-mono min-w-0" />
                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(exIdx, setIdx)}
                      className="text-text-muted hover:text-danger flex-shrink-0 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => addSet(exIdx)}
              className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-hot transition-colors
                font-display tracking-wider uppercase py-1">
              <Plus className="w-3 h-3" /> Satz
            </button>
          </div>
        ))}
      </div>

      {showAddExercise ? (
        <div className="brutal-card-sm p-3 mt-3 animate-slide-up space-y-2">
          {availableToAdd.length > 0 && (
            <div className="relative">
              <select defaultValue=""
                onChange={e => e.target.value && handleAddExercise(e.target.value)}
                className="w-full appearance-none brutal-input px-3 py-2.5 text-sm font-mono cursor-pointer">
                <option value="" disabled>Aus Bibliothek wählen…</option>
                {availableToAdd.map(ex => (
                  <option key={ex.id} value={ex.name}>{ex.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddExercise(newExerciseName)}
              placeholder="…oder neue Übung anlegen"
              className="brutal-input flex-1 px-3 py-2.5 text-sm font-mono min-w-0" />
            <button onClick={() => handleAddExercise(newExerciseName)} disabled={!newExerciseName.trim()}
              className="brutal-btn brutal-btn-accent px-3 py-2 text-sm">OK</button>
            <button onClick={() => setShowAddExercise(false)}
              className="brutal-btn brutal-btn-dark px-3 py-2 text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddExercise(true)}
          className="mt-3 w-full py-3 brutal-card-sm text-text-dim flex items-center justify-center gap-2
            hover:text-text transition-colors font-display tracking-wider uppercase text-sm">
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
