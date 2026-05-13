import { useState, useEffect, useCallback } from 'react';
import { EXERCISES_BY_TYPE } from '../data/seedData';

const STORAGE_KEY = 'gym-tracker-templates';

function loadTemplates(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...EXERCISES_BY_TYPE };
}

function saveTemplates(templates: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useExerciseTemplates() {
  const [templates, setTemplates] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const addExercise = useCallback((type: string, name: string) => {
    setTemplates(prev => {
      const updated = { ...prev };
      if (!updated[type]) updated[type] = [];
      if (!updated[type].includes(name)) {
        updated[type] = [...updated[type], name];
      }
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const removeExercise = useCallback((type: string, name: string) => {
    setTemplates(prev => {
      const updated = { ...prev };
      if (updated[type]) {
        updated[type] = updated[type].filter(e => e !== name);
      }
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const reorderExercises = useCallback((type: string, names: string[]) => {
    setTemplates(prev => {
      const updated = { ...prev, [type]: names };
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const getExercises = useCallback((type: string): string[] => {
    return templates[type] || EXERCISES_BY_TYPE[type] || [];
  }, [templates]);

  return {
    templates,
    addExercise,
    removeExercise,
    reorderExercises,
    getExercises,
  };
}
