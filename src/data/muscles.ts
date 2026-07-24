// Feste Muskelgruppen-Enum für Übungs-Zuordnung und Tracking

export type MuscleId =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'traps'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'adductors'
  | 'abductors'
  | 'calves'
  | 'abs';

export type MuscleRole = 'primary' | 'secondary';

export interface MuscleAssignment {
  muscle: MuscleId;
  role: MuscleRole;
}

// Kategorien für die Balance-Analyse (Push/Pull-Ratio etc.)
export type MuscleCategory = 'push' | 'pull' | 'legs' | 'core';

export interface MuscleInfo {
  id: MuscleId;
  label: string;
  short: string;
  category: MuscleCategory;
}

export const MUSCLES: MuscleInfo[] = [
  { id: 'chest', label: 'Brust', short: 'Brust', category: 'push' },
  { id: 'front_delts', label: 'Vordere Schulter', short: 'V. Schulter', category: 'push' },
  { id: 'side_delts', label: 'Seitliche Schulter', short: 'S. Schulter', category: 'push' },
  { id: 'triceps', label: 'Trizeps', short: 'Trizeps', category: 'push' },
  { id: 'lats', label: 'Lat', short: 'Lat', category: 'pull' },
  { id: 'upper_back', label: 'Oberer Rücken', short: 'O. Rücken', category: 'pull' },
  { id: 'rear_delts', label: 'Hintere Schulter', short: 'H. Schulter', category: 'pull' },
  { id: 'traps', label: 'Trapez / Nacken', short: 'Trapez', category: 'pull' },
  { id: 'biceps', label: 'Bizeps', short: 'Bizeps', category: 'pull' },
  { id: 'forearms', label: 'Unterarme', short: 'Unterarme', category: 'pull' },
  { id: 'quads', label: 'Quadrizeps', short: 'Quads', category: 'legs' },
  { id: 'hamstrings', label: 'Beinbeuger', short: 'Hamstrings', category: 'legs' },
  { id: 'glutes', label: 'Gluteus', short: 'Gluteus', category: 'legs' },
  { id: 'adductors', label: 'Adduktoren', short: 'Adduktor', category: 'legs' },
  { id: 'abductors', label: 'Abduktoren', short: 'Abduktor', category: 'legs' },
  { id: 'calves', label: 'Waden', short: 'Waden', category: 'legs' },
  { id: 'abs', label: 'Bauch', short: 'Bauch', category: 'core' },
  { id: 'lower_back', label: 'Unterer Rücken', short: 'U. Rücken', category: 'core' },
];

export const MUSCLE_BY_ID: Record<MuscleId, MuscleInfo> = Object.fromEntries(
  MUSCLES.map(m => [m.id, m])
) as Record<MuscleId, MuscleInfo>;

export const CATEGORY_LABELS: Record<MuscleCategory, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Beine',
  core: 'Core',
};

export const CATEGORY_COLORS: Record<MuscleCategory, string> = {
  push: 'var(--color-push)',
  pull: 'var(--color-pull)',
  legs: 'var(--color-leg)',
  core: 'var(--color-warning)',
};

// Gewichtung für Muskel-Volumen: primär voll, sekundär halb
export const ROLE_WEIGHT: Record<MuscleRole, number> = {
  primary: 1.0,
  secondary: 0.5,
};
