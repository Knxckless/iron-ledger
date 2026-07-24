// Anatomische Muskel-Heatmap (Front + Rücken) im geometrischen Brutalist-Stil.
// Farbintensität = gewichtetes Trainingsvolumen im gewählten Zeitraum.

import { useMemo, useState } from 'react';
import type { MuscleId } from '../data/muscles';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleStatsMap } from '../lib/stats';
import { round1 } from '../lib/stats';

interface Props {
  stats: MuscleStatsMap;
}

interface Zone {
  muscle: MuscleId;
  paths: string[];
}

const FRONT_ZONES: Zone[] = [
  { muscle: 'front_delts', paths: ['M31 26 L38 24 L38 32 L31 34 Z', 'M69 26 L62 24 L62 32 L69 34 Z'] },
  { muscle: 'side_delts', paths: ['M24 28 L31 26 L31 36 L24 38 Z', 'M76 28 L69 26 L69 36 L76 38 Z'] },
  { muscle: 'chest', paths: ['M38 26 L62 26 L64 42 L50 48 L36 42 Z'] },
  { muscle: 'biceps', paths: ['M25 40 L32 38 L32 52 L25 54 Z', 'M75 40 L68 38 L68 52 L75 54 Z'] },
  { muscle: 'forearms', paths: ['M23 57 L30 55 L28 71 L21 69 Z', 'M77 57 L70 55 L72 71 L79 69 Z'] },
  { muscle: 'abs', paths: ['M42 50 L58 50 L57 74 L50 78 L43 74 Z'] },
  { muscle: 'quads', paths: ['M38 82 L48 82 L47 110 L40 114 Z', 'M52 82 L62 82 L60 114 L53 110 Z'] },
  { muscle: 'adductors', paths: ['M47 83 L50 83 L49 104 L47 104 Z', 'M50 83 L53 83 L53 104 L51 104 Z'] },
  { muscle: 'calves', paths: ['M40 120 L46 118 L45 142 L41 142 Z', 'M60 120 L54 118 L55 142 L59 142 Z'] },
];

const BACK_ZONES: Zone[] = [
  { muscle: 'traps', paths: ['M42 22 L58 22 L62 34 L50 38 L38 34 Z'] },
  { muscle: 'rear_delts', paths: ['M25 27 L34 25 L34 36 L25 38 Z', 'M75 27 L66 25 L66 36 L75 38 Z'] },
  { muscle: 'upper_back', paths: ['M36 36 L64 36 L62 50 L50 54 L38 50 Z'] },
  { muscle: 'lats', paths: ['M36 51 L46 55 L44 69 L36 62 Z', 'M64 51 L54 55 L56 69 L64 62 Z'] },
  { muscle: 'lower_back', paths: ['M44 62 L56 62 L55 76 L50 80 L45 76 Z'] },
  { muscle: 'triceps', paths: ['M24 40 L31 38 L31 53 L24 55 Z', 'M76 40 L69 38 L69 53 L76 55 Z'] },
  { muscle: 'glutes', paths: ['M40 82 L60 82 L61 96 L50 100 L39 96 Z'] },
  { muscle: 'abductors', paths: ['M33 82 L39 83 L39 93 L34 91 Z', 'M67 82 L61 83 L61 93 L66 91 Z'] },
  { muscle: 'hamstrings', paths: ['M39 100 L48 102 L47 120 L40 122 Z', 'M61 100 L52 102 L53 120 L60 122 Z'] },
  { muscle: 'calves', paths: ['M40 126 L47 124 L46 146 L41 146 Z', 'M60 126 L53 124 L54 146 L59 146 Z'] },
];

function Silhouette() {
  return (
    <g fill="none" stroke="#4a4a4a" strokeWidth="1.2">
      <circle cx="50" cy="11" r="8" />
      <path d="M46 19 L46 24 L54 24 L54 19" />
      {/* Torso */}
      <path d="M31 25 L69 25 L66 55 L60 80 L40 80 L34 55 Z" />
      {/* Arme */}
      <path d="M31 25 L23 30 L21 56 L19 71 M69 25 L77 30 L79 56 L81 71" />
      {/* Beine */}
      <path d="M40 80 L37 116 L39 148 M60 80 L63 116 L61 148" />
      <path d="M50 82 L50 100" strokeWidth="0.6" />
    </g>
  );
}

function heatColor(intensity: number): string {
  if (intensity <= 0) return 'var(--color-concrete)';
  const pct = Math.round(15 + intensity * 85);
  return `color-mix(in srgb, var(--color-accent) ${pct}%, var(--color-concrete))`;
}

function Figure({ zones, stats, maxVolume, selected, onSelect, title }: {
  zones: Zone[];
  stats: MuscleStatsMap;
  maxVolume: number;
  selected: MuscleId | null;
  onSelect: (m: MuscleId) => void;
  title: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <svg viewBox="0 0 100 156" className="w-full max-w-[150px] mx-auto block">
        <Silhouette />
        {zones.map(zone => {
          const st = stats[zone.muscle];
          const intensity = maxVolume > 0 ? st.weightedVolume / maxVolume : 0;
          const isSel = selected === zone.muscle;
          return (
            <g key={zone.muscle} onClick={() => onSelect(zone.muscle)} style={{ cursor: 'pointer' }}>
              {zone.paths.map((d, i) => (
                <path key={i} d={d}
                  fill={heatColor(intensity)}
                  stroke={isSel ? 'var(--color-text)' : '#000'}
                  strokeWidth={isSel ? 1.4 : 0.7}
                  opacity={intensity > 0 ? 0.95 : 0.45}
                  className="transition-all duration-500">
                  <title>{MUSCLE_BY_ID[zone.muscle].label}</title>
                </path>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="text-center text-[9px] text-text-muted font-mono uppercase tracking-widest mt-1">{title}</div>
    </div>
  );
}

export function BodyHeatmap({ stats }: Props) {
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const maxVolume = useMemo(
    () => Math.max(...Object.values(stats).map(s => s.weightedVolume), 0),
    [stats]
  );

  const sel = selected ? stats[selected] : null;

  return (
    <div>
      <div className="flex gap-2">
        <Figure zones={FRONT_ZONES} stats={stats} maxVolume={maxVolume}
          selected={selected} onSelect={m => setSelected(s => s === m ? null : m)} title="Front" />
        <Figure zones={BACK_ZONES} stats={stats} maxVolume={maxVolume}
          selected={selected} onSelect={m => setSelected(s => s === m ? null : m)} title="Rücken" />
      </div>

      {/* Legende */}
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[9px] text-text-muted font-mono">
        <span>wenig</span>
        {[0.05, 0.3, 0.6, 1].map(v => (
          <span key={v} className="w-3 h-3 block border border-black" style={{ backgroundColor: heatColor(v) }} />
        ))}
        <span>viel</span>
      </div>

      {/* Detail zum angetippten Muskel */}
      {sel && (
        <div className="brutal-card-inset mt-2 px-3 py-2 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-bold text-text font-display tracking-wider uppercase">
            {MUSCLE_BY_ID[sel.muscle].label}
          </span>
          <span className="text-[10px] text-text-dim font-mono">
            {round1(sel.weightedSets)} Sätze · {Math.round(sel.weightedVolume).toLocaleString('de-DE')} kg
            · {sel.sessions}× trainiert
          </span>
        </div>
      )}
    </div>
  );
}
