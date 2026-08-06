// Körpermaße (Gewicht/Taille/Brust/Arm/Oberschenkel) + Diätphasen (Cut/Bulk/Maintain).
// Eigenständiges Panel — lebt im Diät-Tab (NutritionView). Hängt nur an metrics/dietPhases.

import { useMemo, useState } from 'react';
import {
  Scale, ChevronDown, ChevronUp, Utensils, Plus, Check, X, Trash2,
} from 'lucide-react';
import {
  LineChart, Line, YAxis, XAxis, ResponsiveContainer, Tooltip, ReferenceArea, ReferenceLine, Label,
} from 'recharts';
import { DIET_PHASE_INFO } from '../data/model';
import type { DietPhaseType } from '../data/model';
import { round1, dietPhaseProgress } from '../lib/stats';
import { METRIC_INFO } from '../lib/storage';
import type { MetricId } from '../lib/storage';
import type { Ledger } from '../hooks/useLedger';

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

// hideWeightMetric: Gewicht wird woanders erfasst (Diät-Tab hat eigenen Gewichtstrend)
//   → im Maß-Umschalter weglassen, Standard = Taille.
// showPhases: Diätphasen-Verwaltung (Cut/Bulk/Maintain) einblenden.
export function BodyMetricsPanel({ ledger, hideWeightMetric = false, showPhases = true }: {
  ledger: Ledger;
  hideWeightMetric?: boolean;
  showPhases?: boolean;
}) {
  const { metrics, addMetric, deleteMetric, dietPhases, addDietPhase, deleteDietPhase } = ledger;

  const metricIds = (Object.keys(METRIC_INFO) as MetricId[]).filter(id => !hideWeightMetric || id !== 'weight');
  const [metricId, setMetricId] = useState<MetricId>(hideWeightMetric ? 'waist' : 'weight');
  const [bmDate, setBmDate] = useState(isoDate(new Date()));
  const [bmValue, setBmValue] = useState('');
  const [bmExpanded, setBmExpanded] = useState(true);

  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseType, setPhaseType] = useState<DietPhaseType>('cut');
  const [phaseStart, setPhaseStart] = useState(isoDate(new Date()));
  const [phaseEnd, setPhaseEnd] = useState('');
  const [phaseTarget, setPhaseTarget] = useState('');

  // Neueste zuerst — unabhängig von der Speicherreihenfolge (Import kann abweichen)
  const metricEntries = useMemo(
    () => metrics.filter(m => m.metric === metricId).sort((a, b) => b.date.localeCompare(a.date)),
    [metrics, metricId]
  );

  // Gesamtänderung = neuester − ältester Wert
  const metricDelta = useMemo(() => {
    if (metricEntries.length < 2) return null;
    return round1(metricEntries[0].value - metricEntries[metricEntries.length - 1].value);
  }, [metricEntries]);

  // Gewichtspunkte aufsteigend für Chart + Phasen-Fortschritt
  const weightPoints = useMemo(
    () => metrics.filter(m => m.metric === 'weight')
      .map(m => ({ date: m.date, value: m.value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [metrics]
  );
  const weightChart = useMemo(() => weightPoints.slice(-40), [weightPoints]);

  // Aktive Phase = deckt heute ab; bei mehreren die mit spätestem Start
  const todayIso = isoDate(new Date());
  const activePhase = useMemo(() => {
    const covering = dietPhases
      .filter(p => p.startDate <= todayIso && (!p.endDate || p.endDate >= todayIso))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return covering[0] ?? null;
  }, [dietPhases, todayIso]);
  const activeProgress = useMemo(
    () => activePhase ? dietPhaseProgress(activePhase, weightPoints, todayIso) : null,
    [activePhase, weightPoints, todayIso]
  );

  // Phasen auf sichtbare Chart-Datenpunkte klemmen (kategoriale X-Achse)
  const phaseBands = useMemo(() => {
    if (weightChart.length < 2) return [];
    const dates = weightChart.map(p => p.date);
    const firstD = dates[0], lastD = dates[dates.length - 1];
    return dietPhases
      .map(p => {
        const start = p.startDate < firstD ? firstD : p.startDate;
        const end = (p.endDate && p.endDate < lastD ? p.endDate : lastD);
        if (start > lastD || end < firstD || start > end) return null;
        const x1 = dates.find(d => d >= start);
        const x2 = [...dates].reverse().find(d => d <= end);
        if (!x1 || !x2) return null;
        return { id: p.id, x1, x2, color: DIET_PHASE_INFO[p.type].color, target: p.targetWeight };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
  }, [dietPhases, weightChart]);

  const handleAddPhase = () => {
    if (!phaseStart) return;
    const target = parseFloat(phaseTarget);
    addDietPhase({
      type: phaseType,
      startDate: phaseStart,
      endDate: phaseEnd || undefined,
      targetWeight: !isNaN(target) && target > 0 ? target : undefined,
    });
    setPhaseEnd('');
    setPhaseTarget('');
    setShowPhaseForm(false);
  };

  const info = METRIC_INFO[metricId];

  return (
    <div className="brutal-card-sm p-3 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Körpermaße</h3>
          {metricDelta !== null && (
            <span className="text-[10px] font-mono font-bold"
              style={{ color: metricDelta <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {metricDelta > 0 ? '+' : ''}{metricDelta} {info.unit} gesamt
            </span>
          )}
        </div>
        <button onClick={() => setBmExpanded(!bmExpanded)}
          className="text-text-muted hover:text-text transition-colors p-1">
          {bmExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {bmExpanded && (
        <>
          <div className="flex flex-wrap gap-1 mb-3">
            {metricIds.map(id => (
              <button key={id} onClick={() => setMetricId(id)}
                className={`brutal-chip px-2.5 py-1 text-[10px] whitespace-nowrap ${metricId === id ? 'active' : ''}`}>
                {METRIC_INFO[id].label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input type="date" value={bmDate} onChange={e => setBmDate(e.target.value)}
              className="brutal-input px-2 py-2 text-xs font-mono flex-1 min-w-0" />
            <input type="number" inputMode="decimal" placeholder={info.unit}
              value={bmValue} onChange={e => setBmValue(e.target.value)}
              className="brutal-input w-20 px-2 py-2 text-sm text-center font-mono" />
            <button
              onClick={() => {
                const v = parseFloat(bmValue);
                if (!isNaN(v) && v > 0) { addMetric(metricId, bmDate, v); setBmValue(''); }
              }}
              disabled={!bmValue.trim() || isNaN(parseFloat(bmValue))}
              className="brutal-btn brutal-btn-accent px-3 py-2 text-xs">OK</button>
          </div>

          {/* Chart: für Gewicht mit Phasen-Bändern, sonst Sparkline */}
          {metricId === 'weight' && weightChart.length >= 2 ? (
            <div className="mb-3 brutal-card-inset p-2" style={{ width: '100%', height: 120 }}>
              <ResponsiveContainer>
                <LineChart data={weightChart}>
                  {phaseBands.map(b => (
                    <ReferenceArea key={b.id} x1={b.x1} x2={b.x2}
                      fill={b.color} fillOpacity={0.14} stroke={b.color} strokeOpacity={0.3} />
                  ))}
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} width={30}
                    stroke="#666" fontSize={9} fontFamily="DM Mono" />
                  {activePhase?.targetWeight && (
                    <ReferenceLine y={activePhase.targetWeight}
                      stroke={DIET_PHASE_INFO[activePhase.type].color} strokeDasharray="5 3">
                      <Label value={`Ziel ${activePhase.targetWeight}kg`} position="insideBottomRight"
                        fill={DIET_PHASE_INFO[activePhase.type].color} fontSize={9} fontFamily="DM Mono" />
                    </ReferenceLine>
                  )}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                      boxShadow: '3px 3px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                    }}
                    formatter={(v) => [`${v} kg`, 'Gewicht']}
                    labelFormatter={(d) => new Date(String(d)).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })} />
                  <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
                    strokeWidth={2.5} dot={{ r: 2, fill: 'var(--color-accent)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : metricEntries.length >= 2 && (
            <div className="mb-3 brutal-card-inset p-2" style={{ width: '100%', height: 90 }}>
              <ResponsiveContainer>
                <LineChart data={[...metricEntries].reverse().slice(-30)}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-steel)', border: '2px solid #000',
                      boxShadow: '3px 3px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11,
                    }}
                    formatter={(v) => [`${v} ${info.unit}`, info.label]}
                    labelFormatter={() => ''} />
                  <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
                    strokeWidth={2.5} dot={{ r: 2, fill: 'var(--color-accent)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* DIÄTPHASEN */}
          {showPhases && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="section-label flex items-center gap-1.5">
                  <Utensils className="w-3 h-3" /> Diätphase
                </span>
                <button onClick={() => setShowPhaseForm(!showPhaseForm)}
                  className="brutal-chip px-2 py-1 text-[10px] gap-1">
                  {showPhaseForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {showPhaseForm ? 'Abbrechen' : 'Phase'}
                </button>
              </div>

              {/* Aktive Phase mit Fortschritt */}
              {activePhase && activeProgress ? (
                <div className="brutal-card-inset p-2.5 mb-2"
                  style={{ borderLeft: `4px solid ${DIET_PHASE_INFO[activePhase.type].color}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-display tracking-wider uppercase"
                        style={{ color: DIET_PHASE_INFO[activePhase.type].color }}>
                        {DIET_PHASE_INFO[activePhase.type].label}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono">
                        seit {new Date(activePhase.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        {' · '}{Math.max(Math.round(activeProgress.days / 7), 0)} Wo.
                      </span>
                    </div>
                    {activeProgress.onTrack !== null && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border"
                        style={activeProgress.onTrack
                          ? { color: 'var(--color-success)', borderColor: 'var(--color-success)' }
                          : { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}>
                        {activeProgress.onTrack ? 'im Plan' : 'off track'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-text-dim">
                    {activeProgress.startWeight !== null && (
                      <span>Δ <span className="font-bold"
                        style={{ color: activeProgress.delta <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {activeProgress.delta > 0 ? '+' : ''}{activeProgress.delta} kg</span></span>
                    )}
                    <span>Rate <span className="text-text font-bold">
                      {activeProgress.ratePerWeek > 0 ? '+' : ''}{activeProgress.ratePerWeek} kg/Wo.</span></span>
                    {activeProgress.remaining !== null && (
                      <span>bis Ziel <span className="text-accent font-bold">
                        {activeProgress.remaining > 0 ? '+' : ''}{activeProgress.remaining} kg</span></span>
                    )}
                    {activeProgress.startWeight === null && (
                      <span className="text-text-muted">noch kein Gewicht in dieser Phase</span>
                    )}
                  </div>
                </div>
              ) : !showPhaseForm && (
                <p className="text-[10px] text-text-muted font-mono mb-2">
                  Keine aktive Phase. Lege eine an, um Diät/Aufbau/Erhaltung zu tracken.
                </p>
              )}

              {/* Formular */}
              {showPhaseForm && (
                <div className="brutal-card-inset p-2.5 mb-2 space-y-2 animate-slide-up">
                  <div className="flex gap-1.5">
                    {(Object.keys(DIET_PHASE_INFO) as DietPhaseType[]).map(t => (
                      <button key={t} onClick={() => setPhaseType(t)}
                        className="brutal-chip flex-1 justify-center py-1.5 text-[10px]"
                        style={phaseType === t
                          ? { backgroundColor: DIET_PHASE_INFO[t].color, color: '#000', borderColor: '#000' }
                          : {}}>
                        {DIET_PHASE_INFO[t].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-text-muted font-mono w-10">Start</span>
                    <input type="date" value={phaseStart} onChange={e => setPhaseStart(e.target.value)}
                      className="brutal-input px-2 py-1.5 text-xs font-mono flex-1 min-w-0" />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-text-muted font-mono w-10">Ende</span>
                    <input type="date" value={phaseEnd} onChange={e => setPhaseEnd(e.target.value)}
                      className="brutal-input px-2 py-1.5 text-xs font-mono flex-1 min-w-0" />
                    <span className="text-[9px] text-text-muted font-mono">optional</span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-text-muted font-mono w-10">Ziel</span>
                    <input type="number" inputMode="decimal" placeholder="kg"
                      value={phaseTarget} onChange={e => setPhaseTarget(e.target.value)}
                      className="brutal-input w-20 px-2 py-1.5 text-xs text-center font-mono" />
                    <span className="text-[9px] text-text-muted font-mono">optional</span>
                  </div>
                  <button onClick={handleAddPhase} disabled={!phaseStart}
                    className="brutal-btn brutal-btn-accent w-full py-2 text-xs">
                    <Check className="w-3.5 h-3.5" /> Phase speichern
                  </button>
                </div>
              )}

              {/* Alle Phasen */}
              {dietPhases.length > 0 && (
                <div className="space-y-1">
                  {dietPhases.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1 brutal-card-inset text-[10px] font-mono">
                      <span className="w-2 h-4 flex-shrink-0" style={{ backgroundColor: DIET_PHASE_INFO[p.type].color }} />
                      <span className="font-bold text-text w-16">{DIET_PHASE_INFO[p.type].label}</span>
                      <span className="text-text-dim flex-1 truncate">
                        {new Date(p.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        {p.endDate ? ` – ${new Date(p.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}` : ' – laufend'}
                        {p.targetWeight ? ` · Ziel ${p.targetWeight}kg` : ''}
                      </span>
                      <button onClick={() => deleteDietPhase(p.id)}
                        className="text-text-muted hover:text-danger transition-colors p-0.5 flex-shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {metricEntries.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metricEntries.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between py-1 px-2 brutal-card-inset">
                  <span className="text-xs text-text-dim font-mono">
                    {new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text font-bold font-mono">{e.value} {info.unit}</span>
                    <button onClick={() => deleteMetric(e.id)}
                      className="text-text-muted hover:text-danger transition-colors p-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-text-muted font-mono text-center py-2">
              Noch keine {info.label}-Einträge
            </p>
          )}
        </>
      )}
    </div>
  );
}
