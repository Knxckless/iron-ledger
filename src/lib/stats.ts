// Analytik-Kern: 1RM, Volumen, Muskel-Tracking, PRs, Trends

import type { WorkoutEntry, ExerciseDef, SetEntry } from '../data/model';
import type { MuscleId, MuscleCategory } from '../data/muscles';
import { MUSCLES, MUSCLE_BY_ID, ROLE_WEIGHT } from '../data/muscles';

// ===== Basis-Metriken =====

// Epley-Formel; bei 1 Wdh. ist das Gewicht selbst das 1RM
export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function setVolume(s: SetEntry): number {
  return s.weight > 0 && s.reps > 0 ? s.weight * s.reps : 0;
}

export function exerciseVolume(sets: SetEntry[]): number {
  return sets.reduce((v, s) => v + setVolume(s), 0);
}

export function bestE1RM(sets: SetEntry[]): number {
  return sets.reduce((mx, s) => Math.max(mx, epley1RM(s.weight, s.reps)), 0);
}

export function sessionTonnage(w: WorkoutEntry): number {
  return w.exercises.reduce((t, ex) => t + exerciseVolume(ex.sets), 0);
}

// ===== Muskel-Tracking =====

export interface MuscleStats {
  muscle: MuscleId;
  weightedSets: number;   // primär ×1.0, sekundär ×0.5
  weightedVolume: number;
  primarySets: number;
  secondarySets: number;
  sessions: number;       // Anzahl Trainingstage, an denen der Muskel dran war
}

export type MuscleStatsMap = Record<MuscleId, MuscleStats>;

function emptyMuscleStats(): MuscleStatsMap {
  return Object.fromEntries(
    MUSCLES.map(m => [m.id, {
      muscle: m.id, weightedSets: 0, weightedVolume: 0,
      primarySets: 0, secondarySets: 0, sessions: 0,
    }])
  ) as MuscleStatsMap;
}

export function computeMuscleStats(
  workouts: WorkoutEntry[],
  defsByName: Map<string, ExerciseDef>,
  fromDate?: string,
  toDate?: string,
): MuscleStatsMap {
  const stats = emptyMuscleStats();
  const sessionDates: Record<string, Set<string>> = {};

  for (const w of workouts) {
    if (fromDate && w.date < fromDate) continue;
    if (toDate && w.date > toDate) continue;
    for (const ex of w.exercises) {
      const defn = defsByName.get(ex.name);
      if (!defn) continue;
      const validSets = ex.sets.filter(s => s.weight > 0 && s.reps > 0);
      if (validSets.length === 0) continue;
      const vol = exerciseVolume(validSets);
      for (const { muscle, role } of defn.muscles) {
        const weight = ROLE_WEIGHT[role];
        const st = stats[muscle];
        st.weightedSets += validSets.length * weight;
        st.weightedVolume += vol * weight;
        if (role === 'primary') st.primarySets += validSets.length;
        else st.secondarySets += validSets.length;
        (sessionDates[muscle] ??= new Set()).add(w.date);
      }
    }
  }
  for (const [muscle, dates] of Object.entries(sessionDates)) {
    stats[muscle as MuscleId].sessions = dates.size;
  }
  return stats;
}

// ===== Balance-Analyse =====

export interface BalanceReport {
  categoryVolume: Record<MuscleCategory, number>;
  pushPullRatio: number | null;  // >1 = Push-lastig
  neglected: MuscleId[];         // im Zeitraum gar nicht trainiert
  underworked: MuscleId[];       // deutlich unter dem Median
}

export function computeBalance(stats: MuscleStatsMap): BalanceReport {
  const categoryVolume: Record<MuscleCategory, number> = { push: 0, pull: 0, legs: 0, core: 0 };
  for (const m of MUSCLES) {
    categoryVolume[m.category] += stats[m.id].weightedVolume;
  }
  const pushPullRatio = categoryVolume.pull > 0
    ? categoryVolume.push / categoryVolume.pull
    : (categoryVolume.push > 0 ? Infinity : null);

  const worked = MUSCLES.filter(m => stats[m.id].weightedSets > 0);
  const neglected = MUSCLES.filter(m => stats[m.id].weightedSets === 0).map(m => m.id);

  let underworked: MuscleId[] = [];
  if (worked.length >= 4) {
    const sets = worked.map(m => stats[m.id].weightedSets).sort((a, b) => a - b);
    const median = sets[Math.floor(sets.length / 2)];
    underworked = worked
      .filter(m => stats[m.id].weightedSets < median * 0.35)
      .map(m => m.id);
  }
  return { categoryVolume, pushPullRatio, neglected, underworked };
}

export function muscleLabel(id: MuscleId): string {
  return MUSCLE_BY_ID[id]?.label ?? id;
}

// ===== Personal Records =====

export interface ExercisePRs {
  exerciseName: string;
  maxWeight: { value: number; date: string } | null;
  maxReps: { value: number; date: string } | null;
  bestE1RM: { value: number; date: string } | null;
}

export function computePRs(workouts: WorkoutEntry[], exerciseName: string): ExercisePRs {
  const prs: ExercisePRs = { exerciseName, maxWeight: null, maxReps: null, bestE1RM: null };
  for (const w of workouts) {
    const ex = w.exercises.find(e => e.name === exerciseName);
    if (!ex) continue;
    for (const s of ex.sets) {
      if (s.weight <= 0 || s.reps <= 0) continue;
      if (!prs.maxWeight || s.weight > prs.maxWeight.value) prs.maxWeight = { value: s.weight, date: w.date };
      if (!prs.maxReps || s.reps > prs.maxReps.value) prs.maxReps = { value: s.reps, date: w.date };
      const rm = epley1RM(s.weight, s.reps);
      if (!prs.bestE1RM || rm > prs.bestE1RM.value) prs.bestE1RM = { value: rm, date: w.date };
    }
  }
  return prs;
}

export interface NewPR {
  exerciseName: string;
  kind: 'weight' | 'reps' | 'e1rm';
  value: number;
  previous: number;
}

// Vergleicht einen neuen Eintrag gegen die bisherige Historie (ohne den Eintrag selbst)
export function detectNewPRs(entry: Omit<WorkoutEntry, 'id'>, history: WorkoutEntry[]): NewPR[] {
  const result: NewPR[] = [];
  for (const ex of entry.exercises) {
    const old = computePRs(history, ex.name);
    let bestW = 0, bestR = 0, bestRM = 0;
    for (const s of ex.sets) {
      if (s.weight <= 0 || s.reps <= 0) continue;
      bestW = Math.max(bestW, s.weight);
      bestR = Math.max(bestR, s.reps);
      bestRM = Math.max(bestRM, epley1RM(s.weight, s.reps));
    }
    if (old.maxWeight && bestW > old.maxWeight.value) {
      result.push({ exerciseName: ex.name, kind: 'weight', value: bestW, previous: old.maxWeight.value });
    }
    if (old.bestE1RM && bestRM > old.bestE1RM.value && !result.some(r => r.exerciseName === ex.name)) {
      result.push({ exerciseName: ex.name, kind: 'e1rm', value: bestRM, previous: old.bestE1RM.value });
    }
    if (old.maxReps && bestR > old.maxReps.value && !result.some(r => r.exerciseName === ex.name)) {
      result.push({ exerciseName: ex.name, kind: 'reps', value: bestR, previous: old.maxReps.value });
    }
  }
  return result;
}

// ===== Trends =====

export type TrendDirection = 'up' | 'flat' | 'down';

export interface OverloadTrend {
  direction: TrendDirection;
  pct: number; // Veränderung letzte 3 vs. vorherige 3 Sessions in %
}

// Progressive-Overload: bestes e1RM der letzten 3 Sessions vs. der 3 davor
export function overloadTrend(e1rmByDate: { date: string; value: number }[]): OverloadTrend | null {
  const sorted = [...e1rmByDate].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 4) return null;
  const recent = sorted.slice(-3);
  const before = sorted.slice(-6, -3);
  if (before.length === 0) return null;
  const avg = (arr: { value: number }[]) => arr.reduce((s, x) => s + x.value, 0) / arr.length;
  const prev = avg(before);
  if (prev <= 0) return null;
  const pct = ((avg(recent) - prev) / prev) * 100;
  const direction: TrendDirection = pct > 1.5 ? 'up' : pct < -1.5 ? 'down' : 'flat';
  return { direction, pct };
}

// Lineare Regression für Chart-Trendlinie: liefert Wert für jeden Index
export function linearTrend(values: number[]): number[] {
  const n = values.length;
  if (n < 2) return values.slice();
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += i; sy += values[i]; sxy += i * values[i]; sxx += i * i;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return values.slice();
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return values.map((_, i) => intercept + slope * i);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ===== Ziel-Vorschlag (Double Progression) =====

export interface SessionSets {
  date: string;
  sets: SetEntry[];
}

export interface TargetSuggestion {
  weight: number;
  reps: number;
  basis: 'reps' | 'weight' | 'hold';  // Reps hoch / Gewicht hoch / halten
  lastWeight: number;
  lastReps: number;
  lastSetCount: number;
  trend: TrendDirection | null;
}

// Arbeitssatz einer Session = schwerster Satz; bei Gleichstand die meisten Reps
function topSet(sets: SetEntry[]): { weight: number; reps: number } | null {
  const valid = sets.filter(s => s.weight > 0 && s.reps > 0);
  if (valid.length === 0) return null;
  return valid.reduce((best, s) => {
    if (s.weight > best.weight) return { weight: s.weight, reps: s.reps };
    if (s.weight === best.weight && s.reps > best.reps) return { weight: s.weight, reps: s.reps };
    return best;
  }, { weight: 0, reps: 0 });
}

function loadIncrement(weight: number): number {
  if (weight >= 100) return 5;
  if (weight >= 20) return 2.5;
  return 1.25;
}

// Erwartetes Gewicht/Wdh. fürs nächste Mal, abgeleitet aus dem eigenen Verlauf.
// Prinzip Double Progression: erst Reps bis zum persönlichen Arbeits-Rep-Ziel
// steigern, dann Gewicht erhöhen und Reps zurücksetzen. Bei Rückschritt: halten.
export function suggestNextTarget(history: SessionSets[]): TargetSuggestion | null {
  const sorted = [...history]
    .filter(h => topSet(h.sets))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return null;

  const last = sorted[sorted.length - 1];
  const lastTop = topSet(last.sets)!;
  const lastSetCount = last.sets.filter(s => s.weight > 0 && s.reps > 0).length;

  // Arbeits-Rep-Ziel = gerundeter Schnitt der Top-Set-Reps der letzten 5 Sessions
  const recent = sorted.slice(-5).map(h => topSet(h.sets)!.reps);
  const repGoal = Math.max(1, Math.round(recent.reduce((a, b) => a + b, 0) / recent.length));

  const trend = overloadTrend(sorted.map(h => ({ date: h.date, value: bestE1RM(h.sets) })));

  let weight = lastTop.weight;
  let reps = lastTop.reps;
  let basis: TargetSuggestion['basis'];

  if (trend?.direction === 'down') {
    // Formkurve zeigt nach unten → gleiche Vorgabe konsolidieren
    basis = 'hold';
  } else if (lastTop.reps >= repGoal) {
    // Rep-Ziel erreicht → Gewicht rauf, Reps aufs Ziel zurück
    weight = round1(lastTop.weight + loadIncrement(lastTop.weight));
    reps = repGoal;
    basis = 'weight';
  } else {
    // Noch Luft nach oben bei den Reps → eine Wiederholung mehr
    reps = lastTop.reps + 1;
    basis = 'reps';
  }

  return {
    weight, reps, basis,
    lastWeight: lastTop.weight,
    lastReps: lastTop.reps,
    lastSetCount,
    trend: trend?.direction ?? null,
  };
}

// ===== Wöchentliche Satzbelastung pro Muskel =====

// Evidenzbasierte Untergrenze fürs Muskelwachstum: ~10 gewichtete Sätze/Woche.
export const WEEKLY_SET_TARGET = 10;

export interface WeeklyMuscleLoad {
  muscle: MuscleId;
  perWeek: number;               // gewichtete Sätze pro Woche
  status: 'ok' | 'low' | 'none';
}

export function weeklySetsPerMuscle(stats: MuscleStatsMap, rangeDays: number): WeeklyMuscleLoad[] {
  const weeks = Math.max(rangeDays / 7, 1);
  return MUSCLES.map(m => {
    const perWeek = stats[m.id].weightedSets / weeks;
    const status: WeeklyMuscleLoad['status'] =
      perWeek <= 0 ? 'none' : perWeek >= WEEKLY_SET_TARGET ? 'ok' : 'low';
    return { muscle: m.id, perWeek, status };
  });
}
