// Default-Übungsbibliothek: alle Seed-Übungen mit Muskel-Zuordnung.
// Nutzer können eigene Übungen ergänzen und diese Zuordnungen anpassen.

import type { ExerciseDef } from './model';

function def(
  id: string,
  name: string,
  equipment: ExerciseDef['equipment'],
  primary: ExerciseDef['muscles'][number]['muscle'][],
  secondary: ExerciseDef['muscles'][number]['muscle'][] = [],
): ExerciseDef {
  return {
    id,
    name,
    equipment,
    builtin: true,
    muscles: [
      ...primary.map(muscle => ({ muscle, role: 'primary' as const })),
      ...secondary.map(muscle => ({ muscle, role: 'secondary' as const })),
    ],
  };
}

export const DEFAULT_EXERCISES: ExerciseDef[] = [
  // Pull
  def('b-pullups', 'Pullups', 'bodyweight', ['lats'], ['upper_back', 'biceps', 'forearms']),
  def('b-rows-wide', 'Rows Wide Grip', 'cable', ['upper_back'], ['lats', 'rear_delts', 'biceps']),
  def('b-lat-pd', 'Lat Pulldown', 'cable', ['lats'], ['upper_back', 'biceps']),
  def('b-bi-curls', 'Bi Curls', 'dumbbell', ['biceps'], ['forearms']),
  def('b-facepulls', 'Facepulls', 'cable', ['rear_delts'], ['traps', 'upper_back']),
  def('b-back-ext', 'Back Ext', 'bodyweight', ['lower_back'], ['glutes', 'hamstrings']),
  // Push
  def('b-incline', 'Incline Chest Press', 'machine', ['chest'], ['front_delts', 'triceps']),
  def('b-fly', 'Chest Fly', 'machine', ['chest'], ['front_delts']),
  def('b-lat-raises', 'Lat Raises', 'dumbbell', ['side_delts']),
  def('b-tri-pd', 'Tri Pushdown', 'cable', ['triceps']),
  def('b-bench', 'Bench Press', 'barbell', ['chest'], ['front_delts', 'triceps']),
  // Leg
  def('b-hex-squat', 'Hex Squat', 'barbell', ['quads', 'glutes'], ['hamstrings', 'lower_back']),
  def('b-leg-curls', 'Leg Curls', 'machine', ['hamstrings'], ['calves']),
  def('b-leg-ext', 'Leg Extensions', 'machine', ['quads']),
  def('b-calf-raises', 'Calf Raises', 'machine', ['calves']),
  def('b-abs', 'Abs', 'bodyweight', ['abs']),
];
