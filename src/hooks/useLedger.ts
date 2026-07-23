// Zentraler Daten-Hook: lädt alle Stores (mit Migration) und bietet CRUD.
// Wird einmal in App.tsx instanziiert und per Props weitergereicht.

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkoutEntry, ExerciseDef, WorkoutTemplate, DietPhase, Routine, Settings } from '../data/model';
import type { MetricEntry, MetricId } from '../lib/storage';
import { loadAll, writeJSON, KEYS } from '../lib/storage';

export function useLedger() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseDef[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [dietPhases, setDietPhases] = useState<DietPhase[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = loadAll();
    setWorkouts(data.workouts);
    setExercises(data.exercises);
    setTemplates(data.templates);
    setMetrics(data.metrics);
    setDietPhases(data.dietPhases);
    setRoutines(data.routines);
    setSettings(data.settings);
    setReady(true);
  }, []);

  const reload = useCallback(() => {
    const data = loadAll();
    setWorkouts(data.workouts);
    setExercises(data.exercises);
    setTemplates(data.templates);
    setMetrics(data.metrics);
    setDietPhases(data.dietPhases);
    setRoutines(data.routines);
    setSettings(data.settings);
  }, []);

  // ===== Workouts =====

  const addWorkout = useCallback((entry: Omit<WorkoutEntry, 'id'>) => {
    setWorkouts(prev => {
      const updated = [{ ...entry, id: crypto.randomUUID() }, ...prev];
      writeJSON(KEYS.workouts, updated);
      return updated;
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      writeJSON(KEYS.workouts, updated);
      return updated;
    });
  }, []);

  // ===== Übungs-Bibliothek =====

  const addExercise = useCallback((def: Omit<ExerciseDef, 'id'>): ExerciseDef => {
    const created: ExerciseDef = { ...def, id: crypto.randomUUID() };
    setExercises(prev => {
      const updated = [...prev, created];
      writeJSON(KEYS.exercises, updated);
      return updated;
    });
    return created;
  }, []);

  const updateExercise = useCallback((id: string, patch: Partial<Omit<ExerciseDef, 'id'>>) => {
    setExercises(prev => {
      const before = prev.find(e => e.id === id);
      const updated = prev.map(e => (e.id === id ? { ...e, ...patch } : e));
      writeJSON(KEYS.exercises, updated);
      // Umbenennung in Templates nachziehen
      if (before && patch.name && patch.name !== before.name) {
        setTemplates(tpls => {
          const next = tpls.map(t => ({
            ...t,
            exerciseNames: t.exerciseNames.map(n => (n === before.name ? patch.name! : n)),
          }));
          writeJSON(KEYS.templates, next);
          return next;
        });
      }
      return updated;
    });
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setExercises(prev => {
      const target = prev.find(e => e.id === id);
      const updated = prev.filter(e => e.id !== id);
      writeJSON(KEYS.exercises, updated);
      if (target) {
        setTemplates(tpls => {
          const next = tpls.map(t => ({
            ...t,
            exerciseNames: t.exerciseNames.filter(n => n !== target.name),
          }));
          writeJSON(KEYS.templates, next);
          return next;
        });
      }
      return updated;
    });
  }, []);

  // ===== Workout-Templates =====

  const addTemplate = useCallback((tpl: Omit<WorkoutTemplate, 'id'>): WorkoutTemplate => {
    const created: WorkoutTemplate = { ...tpl, id: crypto.randomUUID() };
    setTemplates(prev => {
      const updated = [...prev, created];
      writeJSON(KEYS.templates, updated);
      return updated;
    });
    return created;
  }, []);

  const updateTemplate = useCallback((id: string, patch: Partial<Omit<WorkoutTemplate, 'id' | 'preset'>>) => {
    setTemplates(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, ...patch } : t));
      writeJSON(KEYS.templates, updated);
      return updated;
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      writeJSON(KEYS.templates, updated);
      return updated;
    });
    // aus allen Routinen entfernen
    setRoutines(prev => {
      const next = prev.map(r => ({ ...r, templateIds: r.templateIds.filter(tid => tid !== id) }));
      writeJSON(KEYS.routines, next);
      return next;
    });
  }, []);

  // ===== Körpermetriken =====

  const addMetric = useCallback((metric: MetricId, date: string, value: number) => {
    setMetrics(prev => {
      const idx = prev.findIndex(e => e.metric === metric && e.date === date);
      let updated: MetricEntry[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], value };
      } else {
        updated = [{ id: crypto.randomUUID(), date, metric, value }, ...prev];
      }
      updated.sort((a, b) => b.date.localeCompare(a.date));
      writeJSON(KEYS.metrics, updated);
      return updated;
    });
  }, []);

  const deleteMetric = useCallback((id: string) => {
    setMetrics(prev => {
      const updated = prev.filter(e => e.id !== id);
      writeJSON(KEYS.metrics, updated);
      return updated;
    });
  }, []);

  // ===== Diätphasen =====

  const addDietPhase = useCallback((phase: Omit<DietPhase, 'id'>): DietPhase => {
    const created: DietPhase = { ...phase, id: crypto.randomUUID() };
    setDietPhases(prev => {
      const updated = [...prev, created].sort((a, b) => b.startDate.localeCompare(a.startDate));
      writeJSON(KEYS.dietPhases, updated);
      return updated;
    });
    return created;
  }, []);

  const updateDietPhase = useCallback((id: string, patch: Partial<Omit<DietPhase, 'id'>>) => {
    setDietPhases(prev => {
      const updated = prev
        .map(p => (p.id === id ? { ...p, ...patch } : p))
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
      writeJSON(KEYS.dietPhases, updated);
      return updated;
    });
  }, []);

  const deleteDietPhase = useCallback((id: string) => {
    setDietPhases(prev => {
      const updated = prev.filter(p => p.id !== id);
      writeJSON(KEYS.dietPhases, updated);
      return updated;
    });
  }, []);

  // ===== Routinen + aktive Routine =====

  const addRoutine = useCallback((routine: Omit<Routine, 'id'>): Routine => {
    const created: Routine = { ...routine, id: crypto.randomUUID() };
    setRoutines(prev => {
      const updated = [...prev, created];
      writeJSON(KEYS.routines, updated);
      return updated;
    });
    return created;
  }, []);

  const updateRoutine = useCallback((id: string, patch: Partial<Omit<Routine, 'id'>>) => {
    setRoutines(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, ...patch } : r));
      writeJSON(KEYS.routines, updated);
      return updated;
    });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => {
      const updated = prev.filter(r => r.id !== id);
      writeJSON(KEYS.routines, updated);
      return updated;
    });
    // war es die aktive Routine? → Auswahl zurücksetzen
    setSettings(prev => {
      if (prev.activeRoutineId !== id) return prev;
      const next = { ...prev, activeRoutineId: undefined };
      writeJSON(KEYS.settings, next);
      return next;
    });
  }, []);

  const setActiveRoutineId = useCallback((id: string | undefined) => {
    setSettings(prev => {
      const next = { ...prev, activeRoutineId: id };
      writeJSON(KEYS.settings, next);
      return next;
    });
  }, []);

  // ===== Abgeleitete Lookups =====

  const exercisesByName = useMemo(() => {
    const map = new Map<string, ExerciseDef>();
    for (const e of exercises) map.set(e.name, e);
    return map;
  }, [exercises]);

  return {
    ready, reload,
    workouts, addWorkout, deleteWorkout,
    exercises, exercisesByName, addExercise, updateExercise, deleteExercise,
    templates, addTemplate, updateTemplate, deleteTemplate,
    metrics, addMetric, deleteMetric,
    dietPhases, addDietPhase, updateDietPhase, deleteDietPhase,
    routines, addRoutine, updateRoutine, deleteRoutine,
    settings, setActiveRoutineId,
  };
}

export type Ledger = ReturnType<typeof useLedger>;
