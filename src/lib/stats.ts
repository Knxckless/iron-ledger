// Analytik-Kern: 1RM, Volumen, Muskel-Tracking, PRs, Trends

import type { WorkoutEntry, ExerciseDef, SetEntry, DietPhase } from '../data/model';
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
  lastRir?: number;                   // RIR des letzten Arbeitssatzes (falls erfasst)
  lastSetCount: number;
  trend: TrendDirection | null;
}

// Arbeitssatz einer Session = schwerster Satz; bei Gleichstand die meisten Reps
function topSet(sets: SetEntry[]): { weight: number; reps: number; rir?: number } | null {
  const valid = sets.filter(s => s.weight > 0 && s.reps > 0);
  if (valid.length === 0) return null;
  return valid.reduce((best, s) => {
    if (s.weight > best.weight) return { weight: s.weight, reps: s.reps, rir: s.rir };
    if (s.weight === best.weight && s.reps > best.reps) return { weight: s.weight, reps: s.reps, rir: s.rir };
    return best;
  }, { weight: 0, reps: 0, rir: undefined as number | undefined });
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
    lastRir: lastTop.rir,
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

// ===== Diätphasen-Fortschritt =====

export interface WeightPoint { date: string; value: number; }

export interface DietPhaseProgress {
  active: boolean;
  startWeight: number | null;
  currentWeight: number | null;
  delta: number;                 // aktuell − Start (kg)
  days: number;                  // Start bis heute/Ende
  ratePerWeek: number;           // kg/Woche
  target: number | null;
  remaining: number | null;      // Ziel − aktuell (kg, vorzeichenbehaftet)
  onTrack: boolean | null;       // Richtung passt zum Phasenziel
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

// Fortschritt einer Phase aus den Gewichtseinträgen im Zeitraum.
// weightPoints muss aufsteigend nach Datum sortiert sein.
export function dietPhaseProgress(
  phase: DietPhase,
  weightPoints: WeightPoint[],
  today: string,
): DietPhaseProgress {
  const active = phase.startDate <= today && (!phase.endDate || phase.endDate >= today);
  const endRef = phase.endDate && phase.endDate < today ? phase.endDate : today;

  const inRange = weightPoints.filter(p =>
    p.date >= phase.startDate && p.date <= (phase.endDate ?? today)
  );
  const startWeight = inRange.length ? inRange[0].value : null;
  const currentWeight = inRange.length ? inRange[inRange.length - 1].value : null;
  const delta = startWeight !== null && currentWeight !== null ? round1(currentWeight - startWeight) : 0;

  const days = Math.max(daysBetween(phase.startDate, endRef), 0);
  const weeks = Math.max(days / 7, 1 / 7);
  const ratePerWeek = round1(delta / weeks);

  const target = phase.targetWeight ?? null;
  const remaining = target !== null && currentWeight !== null ? round1(target - currentWeight) : null;

  let onTrack: boolean | null = null;
  if (startWeight !== null && currentWeight !== null) {
    if (phase.type === 'cut') onTrack = delta < 0;
    else if (phase.type === 'bulk') onTrack = delta > 0;
    else onTrack = Math.abs(ratePerWeek) <= 0.25;
  }

  return { active, startWeight, currentWeight, delta, days, ratePerWeek, target, remaining, onTrack };
}

// ===== Gewichtstrend geglättet + Rate =====

// Gleitender Mittelwert über die letzten `windowDays` Tage je Punkt.
// weightPoints aufsteigend sortiert. Liefert eine geglättete Reihe.
export function movingAverage(points: WeightPoint[], windowDays = 7): WeightPoint[] {
  return points.map((p, i) => {
    let sum = 0, n = 0;
    for (let j = i; j >= 0; j--) {
      if (daysBetween(points[j].date, p.date) > windowDays) break;
      sum += points[j].value; n++;
    }
    return { date: p.date, value: round1(sum / n) };
  });
}

// Trend-Rate in kg/Woche aus linearer Regression über die letzten `days`.
export function weightTrendRate(points: WeightPoint[], days = 21): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1].date;
  const win = points.filter(p => daysBetween(p.date, last) <= days);
  if (win.length < 2) return null;
  const x0 = Date.parse(win[0].date);
  const xs = win.map(p => (Date.parse(p.date) - x0) / 86400000);  // Tage
  const ys = win.map(p => p.value);
  const n = xs.length;
  const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slopePerDay = (n * sxy - sx * sy) / denom;
  return round1(slopePerDay * 7);
}

// ===== Kalorienbedarf =====

// Grundumsatz nach Mifflin-St Jeor × Aktivitätsfaktor → Erhaltungskalorien.
export function mifflinTDEE(weightKg: number, heightCm: number, age: number,
    sex: 'm' | 'f', activity: number): number {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'm' ? 5 : -161);
  return Math.round(bmr * activity);
}

// Adaptiver TDEE aus tatsächlicher Kalorienzufuhr + Gewichtsänderung.
// Energiebilanz: TDEE = Ø Zufuhr − (Gewichtsänderung × 7700 / Tage).
// Braucht genug Daten (≥ 10 Tage Spanne, ≥ 7 Kalorien-Einträge, ≥ 3 Gewichte).
export function adaptiveTDEE(
  weightPoints: WeightPoint[],
  intake: { date: string; kcal: number }[],
  days = 21,
): number | null {
  if (weightPoints.length < 3 || intake.length < 7) return null;
  const lastDate = weightPoints[weightPoints.length - 1].date;
  const w = weightPoints.filter(p => daysBetween(p.date, lastDate) <= days);
  const cal = intake.filter(p => daysBetween(p.date, lastDate) <= days && p.kcal > 0);
  if (w.length < 3 || cal.length < 7) return null;
  const spanDays = daysBetween(w[0].date, w[w.length - 1].date);
  if (spanDays < 10) return null;

  const avgIntake = cal.reduce((a, p) => a + p.kcal, 0) / cal.length;
  const slopePerWeek = weightTrendRate(w, days);
  if (slopePerWeek === null) return null;
  const kgPerDay = slopePerWeek / 7;
  const tdee = avgIntake - kgPerDay * 7700;
  return Math.round(tdee);
}

// ===== Kraftstandards (grobe Einordnung via 1RM/Körpergewicht) =====

export const STRENGTH_LEVELS = ['Untrainiert', 'Anfänger', 'Novize', 'Fortgeschritten', 'Stark', 'Elite'];

// Schwellen als Vielfache des Körpergewichts fürs 1RM, je Übung + Geschlecht.
const STRENGTH_STANDARDS: { match: RegExp; m: number[]; f: number[] }[] = [
  { match: /bench|bank/i,               m: [0.5, 0.75, 1.25, 1.75, 2.0], f: [0.3, 0.5, 0.75, 1.0, 1.3] },
  { match: /squat|kniebeuge|hex/i,      m: [0.75, 1.25, 1.75, 2.5, 3.0], f: [0.5, 0.9, 1.3, 1.8, 2.2] },
  { match: /deadlift|kreuzheben|sldl/i, m: [1.0, 1.5, 2.0, 2.75, 3.25],  f: [0.6, 1.0, 1.5, 2.0, 2.5] },
  { match: /ohp|overhead|shoulder|schulterdr|military/i, m: [0.35, 0.55, 0.8, 1.1, 1.4], f: [0.2, 0.35, 0.5, 0.75, 1.0] },
  { match: /row|rudern/i,               m: [0.5, 0.75, 1.0, 1.4, 1.75],  f: [0.35, 0.55, 0.75, 1.0, 1.3] },
];

export interface StrengthLevel {
  index: number;          // 0..5 (0 = untrainiert)
  label: string;
  ratio: number;          // aktuelles 1RM/KG
  nextRatio: number | null;
}

export function strengthLevel(exerciseName: string, bestE1RM: number, bodyweightKg: number,
    sex: 'm' | 'f'): StrengthLevel | null {
  if (bestE1RM <= 0 || bodyweightKg <= 0) return null;
  const std = STRENGTH_STANDARDS.find(s => s.match.test(exerciseName));
  if (!std) return null;
  const thresholds = sex === 'm' ? std.m : std.f;
  const ratio = bestE1RM / bodyweightKg;
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) if (ratio >= thresholds[i]) idx = i + 1;
  return {
    index: idx,
    label: STRENGTH_LEVELS[idx],
    ratio: round1(ratio),
    nextRatio: idx < thresholds.length ? thresholds[idx] : null,
  };
}

// ===== Stagnations-Erkennung =====

export interface StallInfo { stalling: boolean; sessionsFlat: number; }

// Kein neuer e1RM-Höchstwert in den letzten `recent` Sessions → Stagnation.
export function detectStall(e1rmByDate: { date: string; value: number }[], recent = 4): StallInfo {
  const sorted = [...e1rmByDate].filter(p => p.value > 0).sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < recent + 2) return { stalling: false, sessionsFlat: 0 };
  const peakBefore = Math.max(...sorted.slice(0, -recent).map(p => p.value));
  const recentPeak = Math.max(...sorted.slice(-recent).map(p => p.value));
  // wie viele Sessions am Ende ohne neuen Allzeit-Höchstwert
  const overall = Math.max(...sorted.map(p => p.value));
  let run = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].value >= overall - 0.01) break;
    run++;
  }
  return { stalling: recentPeak <= peakBefore + 0.01, sessionsFlat: run };
}
