# Iron Ledger — Gym Tracker PWA

Mobile-first gym workout tracker as a Progressive Web App. Brutalist industrial design aesthetic. German language UI. Works fully offline via LocalStorage + Service Worker.

## Tech Stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (custom theme, CSS noise texture, brutalist design system)
- **Lucide React** (icons)
- **Recharts** (interactive progress charts)
- **PWA**: manifest.json + Service Worker (cache-first)

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server on localhost:5173
npm run build        # Production build to dist/
npx serve dist       # Serve production build (for phone testing)
```

## Project Structure

```
src/
  main.tsx                              # Entry, SW registration
  App.tsx                               # Shell: 5-tab nav (Start|Training|Übungen|Verlauf|Charts)
  index.css                             # Brutalist design system, fonts, animations
  data/
    seedData.ts                         # 228 parsed CSV entries (v1 types + seed array)
    model.ts                            # v2 data model: ExerciseDef, WorkoutTemplate, WorkoutEntry
    muscles.ts                          # 16-muscle enum, German labels, categories, role weights
    exerciseLibrary.ts                  # Default exercise defs with primary/secondary muscles
  lib/
    storage.ts                          # LocalStorage keys, v1→v2 migration, JSON export/import
    stats.ts                            # e1RM (Epley), volume, muscle stats, balance, PRs, trends
  hooks/
    useLedger.ts                        # Central hook: all stores + CRUD (workouts, exercises,
                                        #   templates, body metrics), rename cascade
  components/
    BodyHeatmap.tsx                     # Front/back SVG muscle heatmap (volume intensity)
  views/
    HomeView.tsx                        # Dashboard: stats, muscle heatmap + balance, body metrics,
                                        #   12-week grid, tier list, backup export/import
    TodayView.tsx                       # Log workout: template picker, countdown rest timer,
                                        #   duplicate last, PR celebration
    LibraryView.tsx                     # Exercise library (muscle editor) + template builder
    HistoryView.tsx                     # Past entries: label filters, sortable, expandable, delete
    ProgressView.tsx                    # Charts: metric switcher (Max/e1RM/Vol/Reps), trendline,
                                        #   exercise compare, PR cards, weekly tonnage
public/
    manifest.json                       # PWA manifest
    sw.js                               # Service Worker (cache 'iron-ledger-v2')
    favicon.svg                         # App icon
scripts/
    parse-csvs.js                       # One-shot CSV → seedData.ts parser
```

## Data Model (v2)

```ts
MuscleId = 'chest' | 'upper_back' | 'lats' | 'lower_back' | 'traps'
  | 'front_delts' | 'side_delts' | 'rear_delts' | 'biceps' | 'triceps'
  | 'forearms' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs'

ExerciseDef {
  id: string
  name: string                  // unique; linkage key to workouts/templates
  equipment: 'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'
  muscles: { muscle: MuscleId, role: 'primary'|'secondary' }[]
  builtin?: boolean             // default exercises: editable, not deletable
}

WorkoutTemplate {
  id: string
  name: string                  // e.g. "Upper A"
  color: string
  exerciseNames: string[]       // ordered
  preset?: 'pull'|'push'|'leg'  // legacy presets, not deletable
}

WorkoutEntry {
  id: string
  date: string                  // "YYYY-MM-DD"
  type: 'pull'|'push'|'leg'|'custom'
  label?: string                // denormalized display name
  templateId?: string
  exercises: { name: string, sets: { weight, reps, notes? }[] }[]
}

MetricEntry { id, date, metric: 'weight'|'waist'|'chest'|'arm'|'thigh', value }
```

### Storage keys & migration

- `gym-tracker-workouts` — workout entries (v1 key reused; migration adds `label`)
- `iron-ledger-exercises` — exercise library
- `iron-ledger-templates` — workout templates (presets seeded from old `gym-tracker-templates`)
- `iron-ledger-metrics` — body metrics (migrated from `gym-tracker-bodyweight`)
- `iron-ledger-version` — schema version marker (`'2'`)

`lib/storage.ts:loadAll()` runs the idempotent v1→v2 migration on startup. Exercise names
found in history/templates but missing from the library get defs with empty muscle lists
(flagged in the UI for mapping). First visit seeds 228 CSV entries.

### Muscle tracking semantics

Per set: primary muscles count ×1.0, secondary ×0.5 (`ROLE_WEIGHT`). Muscle stats
(weighted sets/volume, sessions) are computed on the fly from workouts × library defs
(`lib/stats.ts:computeMuscleStats`). Balance analysis derives push/pull ratio and
neglected/underworked muscle warnings.

## Design System

**Theme**: Brutalist Industrial — concrete textures, steel plates, safety orange accents.

- **Fonts**: Bebas Neue (headings), DM Mono (data/numbers)
- **Colors**: `--color-bg: #1a1a1a`, `--color-accent: #ff6b00`, `--color-warning: #ffd600`, `--color-success: #00e676`
- **Cards**: `brutal-card` / `brutal-card-sm` — 2px black border, 4px offset shadow
- **Buttons**: `brutal-btn` — hard shadow, translate on active, uppercase
- **Inputs**: `brutal-input` — dark background, mono font, hard border
- **Chips**: `brutal-chip` — toggle-style filter/tab buttons
- **Labels**: `section-label` — small uppercase Bebas section headers
- **Background**: CSS fractal noise texture overlay (`.noise-bg`)
- **Animations**: fadeIn, slideUp, slamIn (scale+bounce), pulseBorder, staggered children

## Key Features

### Start (HomeView)
- 4 quick stats (total, this week, week-streak, last workout label)
- **Muscle heatmap**: front/back body SVG, intensity by weighted volume, time filter
  (Woche/4 Wochen/3 Monate), tap muscle for detail
- **Balance analysis**: push/pull/legs/core volume bars, ratio + neglected-muscle warnings
- **Body metrics**: weight/waist/chest/arm/thigh, per-metric chart + delta
- 12-week activity grid, tier list (S/A/B/C by volume)
- **Backup**: JSON export (download) / import (file picker) via settings icon

### Training (TodayView)
- Template picker (presets + custom, color-coded)
- Session muscle preview chips (primary/secondary from library)
- Countdown rest timer (60/90/120/180s), vibration on finish, progress bar
- "Letztes Training laden" duplicates the last session of that template
- New sets inherit previous set's weight
- Adding an unknown exercise auto-creates a library entry
- **PR celebration overlay** on save (max weight / e1RM / reps vs. history)

### Übungen (LibraryView)
- Exercise CRUD: name, equipment, muscle picker (tap cycles primär → sekundär → aus)
- Builtin exercises editable but not deletable; rename cascades to templates
- Warning banner for exercises without muscle mapping
- Template builder: name, color, ordered exercise list (reorder/remove)

### Verlauf (HistoryView)
- Filter chips derived from actual workout labels, newest/oldest sort
- Expandable cards with sets + notes, session tonnage, delete with confirm

### Charts (ProgressView)
- Exercise selector (sorted by frequency) + compare mode (second exercise overlay)
- Metric switcher: Max kg / e1RM (Epley) / Volumen / Reps
- Linear trendline, PB reference line, progressive-overload badge
  (last 3 vs. previous 3 sessions e1RM)
- PR cards (max weight / best e1RM / max reps with dates)
- Weekly tonnage bar chart across all workouts
- Brush zoom/pan, detailed tooltip with per-set notes

### PWA
- `manifest.json` with standalone display, portrait orientation
- Service Worker with cache-first strategy
- Apple mobile web app meta tags
- Safe area padding for notched phones

## CSV Seed Data

Original CSVs parsed via `scripts/parse-csvs.js`:
- `Pull - Tabellenblatt1.csv` → 85 entries (pullups, rows, lat pd, curls, facepulls, back ext)
- `Push - Tabellenblatt1.csv` → 87 entries (incline, fly, lat raises, tri pd, bench)
- `Leg - Tabellenblatt1.csv` → 56 entries (hex squat, leg curls, leg ext, calves, abs)

Parser handles: German decimals (67,5→67.5), inline notes, equipment variations, weight/reps format.

## Future Ideas

- Rest timer auto-start after entering a set
- Workout plan sharing (export single template as JSON)
- Photo progress tracking
- More mascot keyframe states (resting, working, celebrating)
- Light theme via `prefers-color-scheme`
