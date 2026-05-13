import { readFileSync, writeFileSync } from 'fs';

const WORKOUT_TYPES = {
  'Pull - Tabellenblatt1.csv': 'pull',
  'Push - Tabellenblatt1.csv': 'push',
  'Leg - Tabellenblatt1.csv': 'leg',
};

const EXERCISE_NAMES = {
  pull: ['Pullups', 'Rows Wide Grip', 'Lat Pulldown', 'Bi Curls', 'Facepulls', 'Back Ext'],
  push: ['Incline Chest Press', 'Chest Fly', 'Lat Raises', 'Tri Pushdown', 'Bench Press'],
  leg: ['Hex Squat', 'Leg Curls', 'Leg Extensions', 'Calf Raises', 'Abs'],
};

function parseWeightReps(cell) {
  if (!cell || !cell.trim()) return null;
  let text = cell.trim();

  // Extract notes (anything that's not a weight/reps pattern)
  let notes = '';
  // Remove leading notes like "wa: 70" or "wa:70" - equipment weight note
  text = text.replace(/wa:\s*\d+[\d,]*/gi, '').trim();

  // Try to match weight/reps pattern: number/number
  // Handle German decimals: 67,5 → 67.5
  const match = text.match(/(\d+[\d,]*)\s*\/\s*(\d+[\d,]*)/);
  if (!match) return null;

  const weight = parseFloat(match[1].replace(',', '.'));
  const reps = parseFloat(match[2].replace(',', '.'));

  if (isNaN(weight) || isNaN(reps)) return null;

  // Capture notes from the cell
  const afterMatch = text.substring(match.index + match[0].length).trim();
  if (afterMatch) {
    notes = afterMatch.replace(/^[,.\s]+/, '').trim();
  }

  return { weight, reps, notes: notes || undefined };
}

function parseGermanDate(str) {
  if (!str || !str.trim()) return null;
  str = str.trim();

  // Handle various date formats: DD.MM.YY, DD.MM.YYYY, DD.MM YY, DD MM YY, DD.MM
  const parts = str.split(/[.\s]+/);
  if (parts.length < 2) return null;

  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let year = parts.length >= 3 ? parseInt(parts[2], 10) : null;

  if (isNaN(day) || isNaN(month)) return null;

  if (year === null) {
    // Use 2025 as default for partial dates (most entries are 2025-2026)
    year = 2025;
  } else if (year < 100) {
    year += 2000;
  }

  // Validate
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  if (year < 2020 || year > 2030) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseCSV(filename) {
  const content = readFileSync(filename, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  const workoutType = WORKOUT_TYPES[filename.split('/').pop().split('\\').pop()];
  const exerciseNames = EXERCISE_NAMES[workoutType];
  const entries = [];

  for (let i = 2; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);

    const dateStr = cells[0];
    if (!dateStr || dateStr.includes('Ende') || dateStr.includes('Woche krank') || dateStr.includes('krank')) continue;
    if (dateStr.includes('Noch muskelkater') || dateStr.includes('carb loaded') || dateStr.includes('aadduktor')) {
      // These have notes in the first column but may still have a date
    }

    const date = parseGermanDate(dateStr);
    if (!date) continue;

    // Map columns to exercises based on the CSV structure
    // Each exercise has 3 columns for sets (some have 2)
    const exerciseCols = {
      pull: [[1,2,3], [5,6,7], [9,10,11], [13,14,15], [17,18], [20,21]],
      push: [[2,3,4], [6,7,8], [11,12,13], [15,16,17], [19,20]],
      leg: [[1,2,3], [5,6,7], [9,10,11], [13,14], [16,17]],
    };

    const cols = exerciseCols[workoutType];
    const exercises = [];

    for (let e = 0; e < cols.length; e++) {
      const sets = [];
      for (const col of cols[e]) {
        if (col < cells.length) {
          const parsed = parseWeightReps(cells[col]);
          if (parsed) {
            sets.push(parsed);
          }
        }
      }
      if (sets.length > 0) {
        exercises.push({
          name: exerciseNames[e],
          sets,
        });
      }
    }

    if (exercises.length > 0) {
      entries.push({ date, type: workoutType, exercises });
    }
  }

  return entries;
}

function parseCSVLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

// Parse all CSVs
const csvDir = process.argv[2] || '.';
const allEntries = [];

for (const [filename, type] of Object.entries(WORKOUT_TYPES)) {
  const path = `${csvDir}/${filename}`;
  try {
    const entries = parseCSV(path);
    allEntries.push(...entries);
    console.log(`Parsed ${entries.length} entries from ${filename}`);
  } catch (e) {
    console.error(`Error parsing ${filename}:`, e.message);
  }
}

// Sort by date
allEntries.sort((a, b) => a.date.localeCompare(b.date));

// Generate TypeScript file
const ts = `// Auto-generated seed data from CSV files
// Generated: ${new Date().toISOString()}

export interface SetEntry {
  weight: number;
  reps: number;
  notes?: string;
}

export interface ExerciseEntry {
  name: string;
  sets: SetEntry[];
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'pull' | 'push' | 'leg';
  exercises: ExerciseEntry[];
}

export const seedWorkouts: WorkoutEntry[] = ${JSON.stringify(allEntries, null, 2).replace(/"([^"]+)":/g, '$1:')};

export const EXERCISES_BY_TYPE: Record<string, string[]> = ${JSON.stringify(EXERCISE_NAMES, null, 2)};
`;

writeFileSync(`${csvDir}/src/data/seedData.ts`, ts, 'utf-8');
console.log(`\nGenerated seed data with ${allEntries.length} total entries`);
console.log(`  Pull: ${allEntries.filter(e => e.type === 'pull').length}`);
console.log(`  Push: ${allEntries.filter(e => e.type === 'push').length}`);
console.log(`  Leg: ${allEntries.filter(e => e.type === 'leg').length}`);
