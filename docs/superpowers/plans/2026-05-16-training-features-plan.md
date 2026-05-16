# Training Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add body weight tracking, rest timer stopwatch, and exercise history reference to the Iron Ledger gym tracker.

**Architecture:** New `useBodyWeight` hook with dedicated localStorage key. Timer is pure React state inside TodayView. Exercise reference leverages existing `getExerciseHistory` logic, inline-computed from `workouts` prop passed down to TodayView. Body weight section inserted into HomeView's existing card layout.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Recharts (sparkline), Lucide React (icons)

---

### Task 1: Body Weight Hook

**Files:**
- Create: `src/hooks/useBodyWeight.ts`

- [ ] **Step 1: Write the hook**

```ts
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
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

Run: `npx tsc --noEmit src/hooks/useBodyWeight.ts`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBodyWeight.ts
git commit -m "feat: add useBodyWeight hook for body weight tracking"
```

---

### Task 2: Body Weight UI on HomeView

**Files:**
- Modify: `src/views/HomeView.tsx`

- [ ] **Step 1: Add imports**

Add new imports to the existing import block at the top of HomeView.tsx. DO NOT duplicate `useState` — extend the existing React import. The current line 1 is:

```tsx
import { useMemo, useState } from 'react';
```

No change needed to the React import. Add these new import lines below the existing ones:

```tsx
import { useBodyWeight } from '../hooks/useBodyWeight';
import { Scale, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
```

Also update the existing lucide-react import (line 2 currently) to add the new icons. Change:

```tsx
import { Flame, Calendar, ArrowRight, Zap, Trophy, Crown, Medal } from 'lucide-react';
```

To:

```tsx
import { Flame, Calendar, ArrowRight, Zap, Trophy, Crown, Medal, Scale, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
```

- [ ] **Step 2: Add hook call inside the component**

After the existing `const [selectedWeek, setSelectedWeek] = useState<number | null>(null);` line, add:

```tsx
const { entries: bwEntries, addEntry: bwAdd, deleteEntry: bwDelete } = useBodyWeight();
const [bwDate, setBwDate] = useState(new Date().toISOString().split('T')[0]);
const [bwWeight, setBwWeight] = useState('');
const [bwExpanded, setBwExpanded] = useState(true);
```

- [ ] **Step 3: Add body weight section JSX**

Insert between the `<BodyMap />` component and the `{/* WORKOUT HEATMAP */}` comment. The section goes right after `</* BODY MAP */>` closing tag (line ~202):

```tsx
      {/* BODY WEIGHT TRACKER */}
      <div className="brutal-card-sm p-3 mt-5 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Körpergewicht</h3>
          </div>
          <button onClick={() => setBwExpanded(!bwExpanded)}
            className="text-text-muted hover:text-text transition-colors">
            {bwExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {bwExpanded && (
          <>
            <div className="flex gap-2 mb-3">
              <input type="date" value={bwDate}
                onChange={e => setBwDate(e.target.value)}
                className="brutal-input px-2 py-2 text-xs font-mono flex-1" />
              <input type="number" inputMode="decimal" placeholder="kg"
                value={bwWeight}
                onChange={e => setBwWeight(e.target.value)}
                className="brutal-input w-20 px-2 py-2 text-sm text-center font-mono" />
              <button
                onClick={() => {
                  const w = parseFloat(bwWeight);
                  if (!isNaN(w) && w > 0) {
                    bwAdd(bwDate, w);
                    setBwWeight('');
                  }
                }}
                disabled={!bwWeight.trim() || isNaN(parseFloat(bwWeight))}
                className="brutal-btn brutal-btn-accent px-3 py-2 text-xs font-display tracking-wider uppercase">
                OK
              </button>
            </div>

            {bwEntries.length >= 2 && (
              <div className="mb-3" style={{ width: '100%', height: 60 }}>
                <ResponsiveContainer>
                  <LineChart data={[...bwEntries].reverse().slice(-7)}>
                    <Line type="monotone" dataKey="weight" stroke="var(--color-accent)"
                      strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {bwEntries.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bwEntries.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1 px-2
                    bg-[var(--color-concrete)] rounded-sm">
                    <span className="text-xs text-text-dim font-mono">
                      {new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text font-bold font-mono">{e.weight} kg</span>
                      <button onClick={() => bwDelete(e.id)}
                        className="text-text-muted hover:text-danger transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-text-muted font-mono text-center py-2">Keine Einträge</p>
            )}
          </>
        )}
      </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/views/HomeView.tsx
git commit -m "feat: add body weight tracker section to HomeView"
```

---

### Task 3: Pass workouts to TodayView

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/views/TodayView.tsx`

- [ ] **Step 1: Update TodayView props interface**

In `src/views/TodayView.tsx`, change the Props interface (line 10-12) from:

```tsx
interface Props {
  onSave: (entry: Omit<WorkoutEntry, 'id'>) => void;
}
```

To:

```tsx
interface Props {
  onSave: (entry: Omit<WorkoutEntry, 'id'>) => void;
  workouts: WorkoutEntry[];
}
```

- [ ] **Step 2: Destructure workouts in TodayView**

Change the function signature (line 14) from:

```tsx
export function TodayView({ onSave }: Props) {
```

To:

```tsx
export function TodayView({ onSave, workouts }: Props) {
```

- [ ] **Step 3: Pass workouts from App.tsx**

In `src/App.tsx`, change line 43 from:

```tsx
{tab === 'today' && <TodayView onSave={addWorkout} />}
```

To:

```tsx
{tab === 'today' && <TodayView onSave={addWorkout} workouts={workouts} />}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/views/TodayView.tsx src/App.tsx
git commit -m "feat: pass workouts prop to TodayView for exercise history reference"
```

---

### Task 4: Rest Timer in TodayView

**Files:**
- Modify: `src/views/TodayView.tsx`

- [ ] **Step 1: Add timer imports**

Add to TodayView imports:

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
```

Note: `useState` is already imported. Replace the existing `import { useState } from 'react';` with `import { useState, useRef, useEffect, useCallback } from 'react';`

- [ ] **Step 2: Add timer state and logic**

Add after the existing `const [newExerciseName, setNewExerciseName] = useState('');` line (around line 22):

```tsx
  // --- Rest Timer ---
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerVisible, setTimerVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRunning) {
      const start = Date.now() - timerElapsed;
      timerRef.current = window.setInterval(() => {
        setTimerElapsed(Date.now() - start);
      }, 200);
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  const timerStart = useCallback(() => setTimerRunning(true), []);
  const timerStop = useCallback(() => setTimerRunning(false), []);
  const timerReset = useCallback(() => { setTimerRunning(false); setTimerElapsed(0); }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
```

- [ ] **Step 3: Add timer JSX**

Insert between the header block (date display, line ~94) and the type selector chips (line ~97). Place after the `</div>` closing the header flex row and before `{/* Type selector */}`:

```tsx
      {/* REST TIMER */}
      {!timerVisible ? (
        <button onClick={() => setTimerVisible(true)}
          className="w-full py-2 mb-4 brutal-card-sm text-text-dim flex items-center justify-center gap-2
            hover:text-accent transition-colors animate-fade-in font-display tracking-wider uppercase text-xs">
          <span>⏱</span> Pausenuhr
        </button>
      ) : (
        <div className="brutal-card-sm p-2 mb-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button onClick={timerStart} disabled={timerRunning}
                className="brutal-chip px-2.5 py-1 text-xs font-mono"
                style={!timerRunning ? { backgroundColor: 'var(--color-success)', color: '#000' } : {}}>
                ▶
              </button>
              <button onClick={timerStop} disabled={!timerRunning}
                className="brutal-chip px-2.5 py-1 text-xs font-mono"
                style={timerRunning ? { backgroundColor: 'var(--color-warning)', color: '#000' } : {}}>
                ⏸
              </button>
              <button onClick={timerReset}
                className="brutal-chip px-2.5 py-1 text-xs font-mono">↺</button>
            </div>
            <span className="text-xl font-bold text-text font-mono tabular-nums tracking-wider">
              {formatTime(timerElapsed)}
            </span>
            <button onClick={() => { timerReset(); setTimerVisible(false); }}
              className="text-text-muted hover:text-danger transition-colors text-xs font-mono">✕</button>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/views/TodayView.tsx
git commit -m "feat: add rest timer stopwatch to TodayView"
```

---

### Task 5: Exercise History Reference in TodayView

**Files:**
- Modify: `src/views/TodayView.tsx`

- [ ] **Step 1: Add helper function and state**

Add after the timer state block (end of Step 2 from Task 4):

```tsx
  // --- Exercise History Reference ---
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  const toggleRef = (exName: string) => {
    setExpandedRefs(prev => {
      const next = new Set(prev);
      if (next.has(exName)) next.delete(exName); else next.add(exName);
      return next;
    });
  };

  const getLastThree = (exerciseName: string) => {
    return workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .map(w => ({ date: w.date, exercise: w.exercises.find(e => e.name === exerciseName)! }))
      .filter(h => h.exercise.sets.some(s => s.weight > 0 && s.reps > 0))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  };
```

- [ ] **Step 2: Add toggle button and history panel in exercise cards**

Inside the exercise card, between the exercise name header (the `<div className="flex items-center justify-between mb-2">` block) and the sets list, add a toggle button. Locate the exercise name span at line ~118 and the closing `</div>` of the header at line ~127.

Replace the header block (lines 116-127) which is:

```tsx
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text font-display tracking-wider">{ex.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{ex.sets.length}S</span>
                <button onClick={() => handleRemoveExercise(exIdx)}
                  className="text-text-muted hover:text-danger transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
```

With:

```tsx
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text font-display tracking-wider">{ex.name}</span>
                <button onClick={() => toggleRef(ex.name)}
                  className="text-[10px] text-text-muted hover:text-accent transition-colors font-mono
                    flex items-center gap-0.5 brutal-chip px-1.5 py-0.5">
                  Verlauf
                  {expandedRefs.has(ex.name)
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{ex.sets.length}S</span>
                <button onClick={() => handleRemoveExercise(exIdx)}
                  className="text-text-muted hover:text-danger transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
```

- [ ] **Step 3: Add expanded history panel**

After the header block and before the sets list `<div className="space-y-1.5">`, add the history panel. Insert right after the closing `</div>` of the header:

```tsx
            {expandedRefs.has(ex.name) && (
              <div className="mb-2 p-2 rounded-sm animate-slide-up"
                style={{ backgroundColor: 'var(--color-concrete)' }}>
                {(() => {
                  const history = getLastThree(ex.name);
                  return history.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                        Letzte Trainings:
                      </span>
                      {history.map(h => (
                        <div key={h.date} className="text-[11px] text-text-dim font-mono leading-relaxed">
                          <span className="text-text-muted">
                            {new Date(h.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </span>
                          {' — '}
                          {h.exercise.sets
                            .filter(s => s.weight > 0 && s.reps > 0)
                            .map(s => `${s.weight}kg × ${s.reps}`)
                            .join(', ')}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-text-muted font-mono">Keine früheren Einträge</span>
                  );
                })()}
              </div>
            )}
```

- [ ] **Step 4: Add ChevronUp/ChevronDown to imports**

Update the lucide-react import line in TodayView.tsx. Change:

```tsx
import { Save, Plus, X, Trash2, Dumbbell } from 'lucide-react';
```

To:

```tsx
import { Save, Plus, X, Trash2, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/views/TodayView.tsx
git commit -m "feat: add exercise history reference dropdown to TodayView"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors across the entire project.

- [ ] **Step 2: Run dev server and manual smoke test**

Run: `npm run dev`

Verify in browser at `localhost:5173`:
- **HomeView:** Body weight section visible, can add/delete entries, sparkline appears with 2+ entries
- **TodayView:** Timer toggle shows/hides, start/stop/reset work, display counts up
- **TodayView:** Exercise "Verlauf" buttons toggle history panels, show last 3 workouts with weights+reps
- **TodayView:** Save still works correctly

- [ ] **Step 3: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: final verification tweaks for training features"
```
