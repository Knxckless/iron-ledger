// Zentrales Datenmodell v2 — abwärtskompatibel zu den v1-Seed-Daten

import type { MuscleAssignment } from './muscles';
import type { SetEntry, ExerciseEntry } from './seedData';

export type { SetEntry, ExerciseEntry };

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Langhantel',
  dumbbell: 'Kurzhantel',
  machine: 'Maschine',
  cable: 'Kabel',
  bodyweight: 'Körpergewicht',
};

export interface ExerciseDef {
  id: string;
  name: string;
  equipment: Equipment;
  muscles: MuscleAssignment[];
  builtin?: boolean;
}

// Workout-Template: frei benannte Zusammenstellung von Übungen.
// Die drei alten Typen (pull/push/leg) leben als Preset-Templates weiter.
export interface WorkoutTemplate {
  id: string;
  name: string;
  color: string;
  exerciseNames: string[];
  preset?: 'pull' | 'push' | 'leg';
}

// v1-Einträge haben type pull/push/leg; neue Custom-Workouts type 'custom'
// mit templateId + label. label ist der Anzeigename (denormalisiert, damit
// gelöschte Templates die Historie nicht kaputt machen).
export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'pull' | 'push' | 'leg' | 'custom';
  label?: string;
  templateId?: string;
  exercises: ExerciseEntry[];
}

export const PRESET_COLORS: Record<string, string> = {
  pull: '#448aff',
  push: '#ff5252',
  leg: '#69f0ae',
};

export const PRESET_LABELS: Record<string, string> = {
  pull: 'Pull',
  push: 'Push',
  leg: 'Leg',
};

export const TEMPLATE_COLOR_CHOICES = [
  '#ff6b00', '#448aff', '#ff5252', '#69f0ae', '#ffd600',
  '#b388ff', '#18ffff', '#ff80ab',
];

export function workoutLabel(w: WorkoutEntry): string {
  return w.label || PRESET_LABELS[w.type] || 'Workout';
}

export function workoutColor(w: WorkoutEntry, templates?: WorkoutTemplate[]): string {
  if (w.type !== 'custom') return PRESET_COLORS[w.type] || 'var(--color-accent)';
  const tpl = templates?.find(t => t.id === w.templateId);
  return tpl?.color || '#ff6b00';
}

// ===== Diätphasen (Gewichts-Tracker) =====

export type DietPhaseType = 'cut' | 'bulk' | 'maintain';

export interface DietPhase {
  id: string;
  type: DietPhaseType;
  startDate: string;        // "YYYY-MM-DD"
  endDate?: string;         // leer = laufend
  targetWeight?: number;    // optionales Zielgewicht in kg
  note?: string;
}

export const DIET_PHASE_INFO: Record<DietPhaseType, { label: string; color: string; goal: string }> = {
  cut:      { label: 'Diät',       color: '#448aff', goal: 'abnehmen' },
  bulk:     { label: 'Aufbau',     color: '#ff6b00', goal: 'zunehmen' },
  maintain: { label: 'Erhaltung',  color: '#9e9e9e', goal: 'halten' },
};

// ===== Routine =====
// Eine Routine bündelt Workout-Templates in Reihenfolge (z. B. PPL = Push/Pull/Leg).
// Die aktive Routine filtert die Workout-Auswahl auf der Training-Seite.

export interface Routine {
  id: string;
  name: string;
  templateIds: string[];   // geordnete Template-IDs
}

// App-weite Einstellungen (klein gehalten, erweiterbar)
export interface Settings {
  activeRoutineId?: string;
  // Pausentimer
  timerAutoStart?: boolean;   // nach jedem Satz automatisch starten (Default an)
  restDefaultSec?: number;    // Standard-Pausenlänge (Default 180 s)
  // Profil für Kalorienbedarf-Schätzung (Mifflin-St Jeor)
  heightCm?: number;
  age?: number;
  sex?: 'm' | 'f';
  activity?: number;          // Aktivitätsfaktor (1.2 sitzend … 1.9 sehr aktiv)
}
