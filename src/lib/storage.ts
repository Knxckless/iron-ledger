// LocalStorage-Schicht + einmalige Migration v1 → v2.
// v1-Keys (gym-tracker-*) bleiben erhalten bzw. werden weitergenutzt,
// damit bestehende Daten (228 Seed-Einträge + eigene) nicht verloren gehen.

import type { WorkoutEntry, ExerciseDef, WorkoutTemplate, DietPhase, Routine, Settings } from '../data/model';
import { PRESET_COLORS, PRESET_LABELS } from '../data/model';
import { DEFAULT_EXERCISES } from '../data/exerciseLibrary';
import { seedWorkouts, EXERCISES_BY_TYPE } from '../data/seedData';

export const KEYS = {
  version: 'iron-ledger-version',
  workouts: 'gym-tracker-workouts',        // v1-Key weiterverwendet
  legacyTemplates: 'gym-tracker-templates', // v1: Record<type, string[]>
  legacyBodyweight: 'gym-tracker-bodyweight',
  exercises: 'iron-ledger-exercises',
  templates: 'iron-ledger-templates',
  metrics: 'iron-ledger-metrics',
  dietPhases: 'iron-ledger-diet-phases',
  routines: 'iron-ledger-routines',
  settings: 'iron-ledger-settings',
} as const;

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* korrupter Eintrag → wie leer behandeln */ }
  return null;
}

export function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== Körpermetriken =====

export type MetricId = 'weight' | 'waist' | 'chest' | 'arm' | 'thigh';

export interface MetricEntry {
  id: string;
  date: string;
  metric: MetricId;
  value: number;
}

export const METRIC_INFO: Record<MetricId, { label: string; unit: string }> = {
  weight: { label: 'Gewicht', unit: 'kg' },
  waist: { label: 'Taille', unit: 'cm' },
  chest: { label: 'Brust', unit: 'cm' },
  arm: { label: 'Arm', unit: 'cm' },
  thigh: { label: 'Oberschenkel', unit: 'cm' },
};

// ===== Migration =====

function migrateWorkouts(): WorkoutEntry[] {
  let workouts = readJSON<WorkoutEntry[]>(KEYS.workouts);
  if (!workouts) {
    workouts = seedWorkouts.map((w, i) => ({ ...w, id: `seed-${i}` })) as WorkoutEntry[];
  }
  // label für alte Einträge ergänzen + neueste zuerst normalisieren
  // (Seed-Daten liegen aufsteigend vor; App-Logik erwartet workouts[0] = neuestes)
  const migrated = workouts
    .map(w => ({ ...w, label: w.label || PRESET_LABELS[w.type] || 'Workout' }))
    .sort((a, b) => b.date.localeCompare(a.date));
  writeJSON(KEYS.workouts, migrated);
  return migrated;
}

function migrateExercises(workouts: WorkoutEntry[]): ExerciseDef[] {
  const existing = readJSON<ExerciseDef[]>(KEYS.exercises);
  if (existing) return existing;

  const defs: ExerciseDef[] = [...DEFAULT_EXERCISES];
  const known = new Set(defs.map(d => d.name));

  // Alle Übungsnamen aus alten Templates + Workout-Historie aufnehmen,
  // damit nichts verwaist. Ohne Muskel-Zuordnung → Nutzer kann sie nachtragen.
  const legacyTpl = readJSON<Record<string, string[]>>(KEYS.legacyTemplates) || {};
  const names = new Set<string>();
  for (const list of Object.values(legacyTpl)) list.forEach(n => names.add(n));
  for (const w of workouts) for (const ex of w.exercises) names.add(ex.name);

  for (const name of names) {
    if (known.has(name)) continue;
    defs.push({ id: crypto.randomUUID(), name, equipment: 'machine', muscles: [] });
    known.add(name);
  }
  writeJSON(KEYS.exercises, defs);
  return defs;
}

function migrateTemplates(): WorkoutTemplate[] {
  const existing = readJSON<WorkoutTemplate[]>(KEYS.templates);
  if (existing) return existing;

  const legacyTpl = readJSON<Record<string, string[]>>(KEYS.legacyTemplates) || {};
  const templates: WorkoutTemplate[] = (['pull', 'push', 'leg'] as const).map(preset => ({
    id: `preset-${preset}`,
    name: PRESET_LABELS[preset],
    color: PRESET_COLORS[preset],
    exerciseNames: legacyTpl[preset] || EXERCISES_BY_TYPE[preset] || [],
    preset,
  }));
  writeJSON(KEYS.templates, templates);
  return templates;
}

function migrateMetrics(): MetricEntry[] {
  const existing = readJSON<MetricEntry[]>(KEYS.metrics);
  if (existing) return existing;

  const legacy = readJSON<{ id: string; date: string; weight: number }[]>(KEYS.legacyBodyweight) || [];
  const entries: MetricEntry[] = legacy.map(e => ({
    id: e.id, date: e.date, metric: 'weight', value: e.weight,
  }));
  writeJSON(KEYS.metrics, entries);
  return entries;
}

// Diätphasen: neu in v2.1, existiert bei Altnutzern noch nicht → leeres Array
function migrateDietPhases(): DietPhase[] {
  return readJSON<DietPhase[]>(KEYS.dietPhases) ?? [];
}

// Routinen + Settings: neu, Fallback leer
function migrateRoutines(): Routine[] {
  return readJSON<Routine[]>(KEYS.routines) ?? [];
}
function migrateSettings(): Settings {
  return readJSON<Settings>(KEYS.settings) ?? {};
}

export interface LedgerData {
  workouts: WorkoutEntry[];
  exercises: ExerciseDef[];
  templates: WorkoutTemplate[];
  metrics: MetricEntry[];
  dietPhases: DietPhase[];
  routines: Routine[];
  settings: Settings;
}

export function loadAll(): LedgerData {
  const workouts = migrateWorkouts();
  const exercises = migrateExercises(workouts);
  const templates = migrateTemplates();
  const metrics = migrateMetrics();
  const dietPhases = migrateDietPhases();
  const routines = migrateRoutines();
  const settings = migrateSettings();
  localStorage.setItem(KEYS.version, '2');
  return { workouts, exercises, templates, metrics, dietPhases, routines, settings };
}

// ===== Backup: Export / Import =====

export function exportBackup(): string {
  return JSON.stringify({
    app: 'iron-ledger',
    version: 2,
    exportedAt: new Date().toISOString(),
    workouts: readJSON(KEYS.workouts) ?? [],
    exercises: readJSON(KEYS.exercises) ?? [],
    templates: readJSON(KEYS.templates) ?? [],
    metrics: readJSON(KEYS.metrics) ?? [],
    dietPhases: readJSON(KEYS.dietPhases) ?? [],
    routines: readJSON(KEYS.routines) ?? [],
    settings: readJSON(KEYS.settings) ?? {},
  }, null, 2);
}

export function importBackup(json: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (data?.app !== 'iron-ledger' || !Array.isArray(data.workouts)) {
      return { ok: false, error: 'Kein gültiges Iron-Ledger-Backup' };
    }
    writeJSON(KEYS.workouts, data.workouts);
    if (Array.isArray(data.exercises)) writeJSON(KEYS.exercises, data.exercises);
    if (Array.isArray(data.templates)) writeJSON(KEYS.templates, data.templates);
    if (Array.isArray(data.metrics)) writeJSON(KEYS.metrics, data.metrics);
    if (Array.isArray(data.dietPhases)) writeJSON(KEYS.dietPhases, data.dietPhases);
    if (Array.isArray(data.routines)) writeJSON(KEYS.routines, data.routines);
    if (data.settings && typeof data.settings === 'object') writeJSON(KEYS.settings, data.settings);
    localStorage.setItem(KEYS.version, '2');
    return { ok: true };
  } catch {
    return { ok: false, error: 'JSON konnte nicht gelesen werden' };
  }
}
