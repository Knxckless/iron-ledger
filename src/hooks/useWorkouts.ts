import { useState, useEffect, useCallback } from 'react';
import { seedWorkouts, EXERCISES_BY_TYPE } from '../data/seedData';
import type { WorkoutEntry } from '../data/seedData';

export type { WorkoutEntry, ExerciseEntry, SetEntry } from '../data/seedData';

const STORAGE_KEY = 'gym-tracker-workouts';

function loadFromStorage(): WorkoutEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // First visit: seed from CSV data
  const seeded = seedWorkouts.map((w, i) => ({
    ...w,
    id: `seed-${i}`,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveToStorage(workouts: WorkoutEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkouts(loadFromStorage());
    setReady(true);
  }, []);

  const addWorkout = useCallback((entry: Omit<WorkoutEntry, 'id'>) => {
    setWorkouts(prev => {
      const updated = [
        { ...entry, id: crypto.randomUUID() },
        ...prev,
      ];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getWorkoutsByType = useCallback((type: string) => {
    return workouts.filter(w => w.type === type);
  }, [workouts]);

  const getExerciseHistory = useCallback((exerciseName: string) => {
    return workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .map(w => ({
        date: w.date,
        exercise: w.exercises.find(e => e.name === exerciseName)!,
      }))
      .filter(h => h.exercise.sets.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts]);

  return {
    workouts,
    ready,
    addWorkout,
    deleteWorkout,
    getWorkoutsByType,
    getExerciseHistory,
    EXERCISES_BY_TYPE,
  };
}
