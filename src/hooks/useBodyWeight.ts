import { useState, useEffect, useCallback } from 'react';

export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
}

const STORAGE_KEY = 'gym-tracker-bodyweight';

function loadEntries(): BodyWeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveEntries(entries: BodyWeightEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useBodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback((date: string, weight: number) => {
    setEntries(prev => {
      const existing = prev.findIndex(e => e.date === date);
      let updated: BodyWeightEntry[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = { ...updated[existing], weight };
      } else {
        updated = [{ id: crypto.randomUUID(), date, weight }, ...prev];
      }
      updated.sort((a, b) => b.date.localeCompare(a.date));
      saveEntries(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveEntries(updated);
      return updated;
    });
  }, []);

  const getRecent = useCallback((n: number) => {
    return entries.slice(0, n);
  }, [entries]);

  return { entries, addEntry, deleteEntry, getRecent };
}
