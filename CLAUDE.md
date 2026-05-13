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
  App.tsx                               # Shell: 4-tab nav (Start|Training|Verlauf|Charts)
  index.css                             # Brutalist design system, fonts, animations
  data/
    seedData.ts                         # 228 parsed CSV entries + types + exercise defaults
  hooks/
    useWorkouts.ts                      # LocalStorage CRUD for workouts
    useExerciseTemplates.ts             # Custom exercise lists per type (localStorage)
  components/
    BodyMap.tsx                         # SVG muscle zone heatmap
  views/
    HomeView.tsx                        # Dashboard: stats, heatmap, tier list, timeline, mascots
    TodayView.tsx                       # Log workout: type selector, exercise inputs, custom exercises
    HistoryView.tsx                     # Past entries: filterable, sortable, expandable, delete
    ProgressView.tsx                    # Charts: combined weight+reps, time filter, brush zoom, PB line
public/
    manifest.json                       # PWA manifest
    sw.js                               # Service Worker
    favicon.svg                         # App icon
scripts/
    parse-csvs.js                       # One-shot CSV → seedData.ts parser
```

## Data Model

```ts
WorkoutEntry {
  id: string            // UUID
  date: string          // "YYYY-MM-DD"
  type: "pull" | "push" | "leg"
  exercises: {
    name: string
    sets: { weight: number, reps: number, notes?: string }[]
  }[]
}
```

- **Storage key**: `gym-tracker-workouts` (all entries as JSON array)
- **Templates key**: `gym-tracker-templates` (custom exercise lists per type)
- On first visit, 228 CSV entries are seeded into localStorage
- New workouts get `crypto.randomUUID()` IDs

## Design System

**Theme**: Brutalist Industrial — concrete textures, steel plates, safety orange accents.

- **Fonts**: Bebas Neue (headings), DM Mono (data/numbers)
- **Colors**: `--color-bg: #1a1a1a`, `--color-accent: #ff6b00`, `--color-warning: #ffd600`, `--color-success: #00e676`
- **Cards**: `brutal-card` / `brutal-card-sm` — 2px black border, 4px offset shadow
- **Buttons**: `brutal-btn` — hard shadow, translate on active, uppercase
- **Inputs**: `brutal-input` — dark background, mono font, hard border
- **Chips**: `brutal-chip` — toggle-style filter/tab buttons
- **Background**: CSS fractal noise texture overlay (`.noise-bg`)
- **Animations**: fadeIn, slideUp, slamIn (scale+bounce), pulseBorder, staggered children

## Key Features

### Start Page (HomeView)
- 4 quick stats (total workouts, this week, streak, last type)
- **Body Map**: SVG muscle zones colored by this week's trained types
- **12-Week Heatmap**: GitHub-style contribution grid
- **Tier List**: Last 5 workouts ranked S/A/B/C by volume
- **Timeline**: Diamond-node roadmap of last 6 sessions
- **Animated Mascot**: CSS keyframe animation switching per last workout type (push/pull/leg)
- CTA button with pulse glow

### Training (TodayView)
- Pull/Push/Leg type switcher with color-coded brutalist chips
- Fixed exercise templates per type (customizable)
- Set rows: weight (kg), reps, notes — mono-font brutalist inputs
- Add/remove sets and exercises
- Custom exercises persisted to localStorage
- Save with slam animation + success feedback

### History (HistoryView)
- Filter by type (All/Pull/Push/Leg)
- **Sort toggle**: newest-first / oldest-first
- Expandable cards with full set details
- Delete workout
- Color-coded left border per type

### Charts (ProgressView)
- Exercise + type selector
- Time filter chips (1M/3M/6M/1Y/ALL)
- **Combined chart**: weight (orange solid, left axis) + reps (green dashed, right axis)
- PB reference line
- Recharts Brush for zoom/pan
- **Custom tooltip**: shows all sets with notes in warning-yellow
- Click data point → detail card with full set breakdown

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

- Exercise-specific notes in chart tooltips already working
- "Top Lifts" section could become a proper PR tracker
- Could add rest timer between sets
- Could add workout plan/template sharing
- Could add body weight tracking
- Could add photo progress
- Animation: the mascots could have more keyframe states (resting, working, celebrating)
