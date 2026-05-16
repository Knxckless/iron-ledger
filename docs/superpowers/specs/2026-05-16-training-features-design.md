# Training Features — Body Weight, Rest Timer, Exercise Reference

**Date:** 2026-05-16
**Status:** approved

## Overview

Three features added to the Iron Ledger gym tracker:
1. Body weight tracking with trend display
2. Manual stopwatch for rest timing
3. Exercise history reference (last 3 workouts) while logging

---

## Feature 1: Body Weight Tracker

### Data Model

New storage key `gym-tracker-bodyweight` — array of:

```ts
{ id: string, date: "YYYY-MM-DD", weight: number }
```

### Hook: `useBodyWeight`

File: `src/hooks/useBodyWeight.ts`
- `entries` — all body weight entries, sorted newest-first
- `addEntry(date, weight)` — add or update (one entry per date, upsert)
- `deleteEntry(id)` — remove
- `getRecent(n)` — last n entries
- On first load: empty array (no seed data needed)

### UI: HomeView Section

Placed between "quick stats" and the 12-week heatmap. Brutalist card:
- **Input row:** Date (pre-filled today), weight input (kg, mono font), save button
- **Last 5 entries:** Mini table — date + weight, delete button per row
- **Mini sparkline:** Recharts `<LineChart>` (tiny, ~60px height) showing last 7 entries as trend line, accent-orange stroke, no axes/labels — just the line

### Edge Cases
- If no entries yet: sparkline hidden, show "Keine Einträge" text
- Same-date entry: overwrites previous (upsert) — only one weight per day
- Delete last entry: sparkline disappears if < 2 entries remain

---

## Feature 2: Rest Timer (Stopwatch)

### State

Pure React state, no persistence. Lives in `TodayView`.

```ts
{ running: boolean, elapsed: number }  // elapsed in milliseconds
```

### Behavior
- **Start:** begins counting up from current elapsed (or 0 if reset)
- **Stop:** pauses, elapsed freezes
- **Reset:** sets elapsed to 0, stops if running
- Display: `MM:SS` format, mono font
- No sound, no limit

### UI

Fixed bar inside TodayView, below the header (date + dumbbell icon), above the type selector chips:

```
[▶] [⏸] [↺]   00:00
```

- Single row, `brutal-card-sm` styling
- Timer digits in `DM Mono`, large (text-xl)
- Buttons: small brutalist chips, accent-colored play button
- Collapsible: small toggle to hide when not needed (persists within session)

### Implementation
- `useRef` for `setInterval` ID
- `useEffect` to clean up interval on unmount
- No worker needed — sub-second accuracy not required

---

## Feature 3: Exercise History Reference

### Data Source

The existing `getExerciseHistory(exerciseName)` in `useWorkouts` already returns:
```ts
{ date: string, exercise: ExerciseEntry }[]
```
sorted by date ascending. We take the **last 3** entries.

### Prop Change

`TodayView` currently receives only `onSave`. It now also receives `workouts: WorkoutEntry[]` so it can access history.

### UI: Per-Exercise Dropdown

Each exercise card in TodayView gains a toggle button next to the exercise name (left side):

- **Closed:** small `ChevronDown` icon + "Verlauf" chip
- **Open:** small `ChevronUp` icon, panel expands below the exercise name, above the set inputs

Expanded panel (`brutal-card-sm`, slightly darker background):

```
Letzte Trainings:
  10.05.2026  —  22.5kg × 8, 22.5kg × 8, 22.5kg × 7
  07.05.2026  —  20kg × 10, 20kg × 9
  03.05.2026  —  20kg × 8, 20kg × 8
```

- Date in `text-text-dim`, sets in `text-text` mono
- Max 3 entries shown
- If no history: "Keine früheren Einträge"
- Toggle state per exercise (local `useState<Set<string>>` tracking which exercise names are expanded)

### Edge Cases
- New exercise (never done before): shows "Keine früheren Einträge", panel still expandable
- Exercise renamed: treated as new exercise (no history match)
- Only show entries that have valid sets (weight > 0, reps > 0) — filtered by the existing `getExerciseHistory`

---

## File Changes Summary

| File | Change |
|---|---|
| `src/hooks/useBodyWeight.ts` | **New** — hook for body weight CRUD |
| `src/views/HomeView.tsx` | Add body weight section |
| `src/views/TodayView.tsx` | Add timer bar, exercise reference dropdowns, accept `workouts` prop |
| `src/App.tsx` | Pass `workouts` to TodayView |

No changes to data model, seed data, or existing hooks (other than new hook).

---

## Design System Consistency

All new UI uses existing brutalist design tokens:
- Cards: `brutal-card-sm`, 2px black border
- Inputs: `brutal-input` (dark bg, mono font)
- Buttons: `brutal-btn` / `brutal-chip`
- Colors: `--color-accent` (#ff6b00), `--color-text-dim`, `--color-bg`
- Fonts: Bebas Neue (labels), DM Mono (data)
- Animations: `animate-slide-up`, `animate-fade-in`
