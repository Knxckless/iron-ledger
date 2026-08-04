// Muskel-Tracking: Front/Back-Heatmap, Kategorie-Balance, Ø Sätze/Woche pro Muskel,
// Balance-Hinweise. Eigenständig — lebt im Analyse-Tab (ProgressView).

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BodyHeatmap } from './BodyHeatmap';
import { CATEGORY_LABELS, CATEGORY_COLORS, MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleCategory } from '../data/muscles';
import {
  computeMuscleStats, computeBalance, muscleLabel, round1,
  weeklySetsPerMuscle, WEEKLY_SET_TARGET,
} from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

const MUSCLE_RANGES = [
  { label: 'Woche', days: 7 },
  { label: '4 Wochen', days: 28 },
  { label: '3 Monate', days: 90 },
];

export function MuscleAnalysis({ ledger }: { ledger: Ledger }) {
  const { workouts, exercisesByName } = ledger;
  const [muscleRange, setMuscleRange] = useState(28);

  const { muscleStats, balance } = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - muscleRange);
    const ms = computeMuscleStats(workouts, exercisesByName, isoDate(from));
    return { muscleStats: ms, balance: computeBalance(ms) };
  }, [workouts, exercisesByName, muscleRange]);

  const totalCategoryVolume = Object.values(balance.categoryVolume).reduce((a, b) => a + b, 0);

  const weeklyLoad = useMemo(
    () => weeklySetsPerMuscle(muscleStats, muscleRange).sort((a, b) => b.perWeek - a.perWeek),
    [muscleStats, muscleRange]
  );
  const lagging = useMemo(
    () => weeklyLoad.filter(w => w.status === 'low').sort((a, b) => a.perWeek - b.perWeek),
    [weeklyLoad]
  );

  return (
    <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Muskel-Tracking</h3>
        <div className="flex gap-1">
          {MUSCLE_RANGES.map(r => (
            <button key={r.days} onClick={() => setMuscleRange(r.days)}
              className={`brutal-chip px-2 py-1 text-[9px] ${muscleRange === r.days ? 'active' : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <BodyHeatmap stats={muscleStats} />

      {/* Kategorie-Balance */}
      {totalCategoryVolume > 0 && (
        <div className="mt-4 space-y-1.5">
          {(Object.keys(balance.categoryVolume) as MuscleCategory[]).map(cat => {
            const vol = balance.categoryVolume[cat];
            const pct = totalCategoryVolume > 0 ? vol / totalCategoryVolume : 0;
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-[9px] text-text-dim font-mono uppercase w-10">{CATEGORY_LABELS[cat]}</span>
                <div className="flex-1 h-2.5 border border-black" style={{ backgroundColor: 'var(--color-concrete)' }}>
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: CATEGORY_COLORS[cat] }} />
                </div>
                <span className="text-[9px] text-text-muted font-mono w-8 text-right">{Math.round(pct * 100)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Ø Sätze pro Muskel pro Woche */}
      {totalCategoryVolume > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="section-label">Ø Sätze / Woche</span>
            <span className="text-[9px] text-text-muted font-mono">Ziel ≥ {WEEKLY_SET_TARGET} · gewichtet</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {weeklyLoad.map(w => {
              const col = w.status === 'ok' ? 'var(--color-success)'
                : w.status === 'low' ? 'var(--color-warning)' : 'var(--color-text-muted)';
              const frac = Math.min(w.perWeek / WEEKLY_SET_TARGET, 1);
              return (
                <div key={w.muscle} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-dim font-mono truncate flex-1"
                    title={MUSCLE_BY_ID[w.muscle].label}>
                    {MUSCLE_BY_ID[w.muscle].short}
                  </span>
                  <div className="w-10 h-1.5 border border-black flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-concrete)' }}>
                    <div className="h-full" style={{ width: `${frac * 100}%`, backgroundColor: col }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold w-7 text-right" style={{ color: col }}>
                    {round1(w.perWeek)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance-Hinweise + Volumen-Ermahnung */}
      <div className="mt-3 space-y-1.5">
        {balance.pushPullRatio !== null && isFinite(balance.pushPullRatio) &&
          (balance.pushPullRatio > 1.5 || balance.pushPullRatio < 0.67) && (
          <div className="brutal-card-inset px-2.5 py-1.5 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <span className="text-[10px] text-text-dim font-mono">
              Push/Pull-Ratio {round1(balance.pushPullRatio)} —
              {balance.pushPullRatio > 1.5 ? ' Push-lastig, mehr Rücken einplanen' : ' Pull-lastig, mehr Drücken einplanen'}
            </span>
          </div>
        )}
        {balance.neglected.length > 0 && balance.neglected.length <= 6 && (
          <div className="brutal-card-inset px-2.5 py-1.5 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-text-dim font-mono">
              Nicht trainiert: {balance.neglected.map(muscleLabel).join(', ')}
            </span>
          </div>
        )}
        {lagging.length > 0 && (
          <div className="brutal-card-inset px-2.5 py-1.5 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-text-dim font-mono">
              Hinkt hinterher (unter {WEEKLY_SET_TARGET}/Woche):{' '}
              {lagging.slice(0, 6).map(w => `${MUSCLE_BY_ID[w.muscle].short} (${round1(w.perWeek)})`).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
