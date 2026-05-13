import { useMemo } from 'react';
import type { WorkoutEntry } from '../data/seedData';

interface Props {
  workouts: WorkoutEntry[];
}

const MUSCLE_ZONES = {
  chest: { label: 'Brust', path: 'M35 28 L65 28 L68 50 L58 58 L42 58 L32 50 Z', types: ['push'] },
  shoulders: { label: 'Schultern', path: 'M28 26 L35 28 L32 50 L20 38 Z M65 28 L72 26 L80 38 L68 50 Z', types: ['push'] },
  back: { label: 'Rücken', path: 'M32 50 L42 58 L42 80 L30 82 L28 62 Z M58 58 L68 50 L72 62 L70 82 L58 80 Z', types: ['pull'] },
  biceps: { label: 'Bizeps', path: 'M20 38 L15 55 L22 55 L28 50 Z M80 38 L85 55 L78 55 L72 50 Z', types: ['pull'] },
  triceps: { label: 'Trizeps', path: 'M20 38 L22 50 L28 50 L28 42 Z M80 38 L78 50 L72 50 L72 42 Z', types: ['push'] },
  abs: { label: 'Bauch', path: 'M42 58 L58 58 L58 72 L42 72 Z', types: ['push', 'leg'] },
  quads: { label: 'Quads', path: 'M30 82 L42 80 L42 110 L38 115 L28 110 Z M58 80 L70 82 L72 110 L62 115 L58 110 Z', types: ['leg'] },
  hamstrings: { label: 'Hamstrings', path: 'M38 115 L42 110 L42 130 L40 135 Z M62 115 L58 110 L58 130 L60 135 Z', types: ['leg'] },
  calves: { label: 'Waden', path: 'M38 135 L42 130 L42 148 L40 150 Z M62 135 L58 130 L58 148 L60 150 Z', types: ['leg'] },
} as const;

export function BodyMap({ workouts }: Props) {
  const activeZones = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo);
    const types = new Set(thisWeek.map(w => w.type));

    const zones: Record<string, { active: boolean; color: string }> = {};
    for (const [key, zone] of Object.entries(MUSCLE_ZONES)) {
      const active = zone.types.some(t => types.has(t));
      let color = '#333';
      if (active) {
        const matchingTypes = zone.types.filter(t => types.has(t));
        if (matchingTypes.includes('push') && matchingTypes.includes('leg')) color = 'var(--color-warning)';
        else if (matchingTypes.includes('push')) color = 'var(--color-push)';
        else if (matchingTypes.includes('pull')) color = 'var(--color-pull)';
        else if (matchingTypes.includes('leg')) color = 'var(--color-leg)';
      }
      zones[key] = { active, color };
    }
    return { zones, types };
  }, [workouts]);

  return (
    <div className="brutal-card-sm p-3 animate-slide-up stagger-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">
          Muskeln dieser Woche
        </h3>
        <div className="flex gap-2 text-[9px] font-mono text-text-dim">
          {['push', 'pull', 'leg'].map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className="w-2 h-2 block" style={{
                backgroundColor: t === 'push' ? 'var(--color-push)' : t === 'pull' ? 'var(--color-pull)' : 'var(--color-leg)',
                opacity: (activeZones.types as Set<string>).has(t) ? 1 : 0.2,
              }} />
              {t === 'push' ? 'Push' : t === 'pull' ? 'Pull' : 'Leg'}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg viewBox="0 0 100 155" className="w-full max-w-[180px]">
          {/* Body outline */}
          <g transform="translate(0,2)">
            {/* Head */}
            <ellipse cx="50" cy="10" rx="12" ry="14" fill="none" stroke="#555" strokeWidth="1.5" />

            {/* Neck */}
            <rect x="46" y="22" width="8" height="6" fill="none" stroke="#555" strokeWidth="1" />

            {/* Torso outline */}
            <path d="M32 28 L68 28 L72 52 L68 60 L58 70 L42 70 L32 60 L28 52 Z"
              fill="none" stroke="#555" strokeWidth="1.5" />

            {/* Arms */}
            <path d="M32 30 L22 55 L25 70 M68 30 L78 55 L75 70"
              fill="none" stroke="#555" strokeWidth="1.5" />
            <path d="M28 55 L18 60 M72 55 L82 60"
              fill="none" stroke="#555" strokeWidth="1" />

            {/* Legs */}
            <path d="M42 70 L38 110 L36 140 M58 70 L62 110 L64 140"
              fill="none" stroke="#555" strokeWidth="1.5" />
            <path d="M38 110 L30 115 M62 110 L70 115"
              fill="none" stroke="#555" strokeWidth="0.8" />

            {/* Muscle zone fills */}
            {Object.entries(MUSCLE_ZONES).map(([key, zone]) => (
              <path
                key={key}
                d={zone.path}
                fill={activeZones.zones[key]?.color || '#333'}
                opacity={activeZones.zones[key]?.active ? 0.8 : 0.08}
                className="transition-all duration-700"
              >
                <title>{zone.label}{activeZones.zones[key]?.active ? ' - Trainiert' : ''}</title>
              </path>
            ))}
          </g>

          {/* Labels */}
          <g fontFamily="'DM Mono', monospace" fontSize="5" fill="#666">
            <text x="2" y="40">Brust</text>
            <text x="75" y="40">Rücken</text>
            <text x="2" y="88">Bizeps</text>
            <text x="80" y="88">Trizeps</text>
            <text x="38" y="95">Abs</text>
            <text x="35" y="128">Quads</text>
            <text x="70" y="128">Waden</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
