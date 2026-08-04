// Ernährung & Gewicht: geglätteter Gewichtstrend, Kalorien-/Protein-Log,
// adaptiver Kalorienbedarf (TDEE) und Zielkalorien je aktiver Diätphase.

import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label,
} from 'recharts';
import { Flame, Scale, Trash2, Utensils, Target, TrendingDown, TrendingUp, Minus, Settings2 } from 'lucide-react';
import { DIET_PHASE_INFO } from '../data/model';
import { movingAverage, weightTrendRate, adaptiveTDEE, mifflinTDEE } from '../lib/stats';
import { BodyMetricsPanel } from '../components/BodyMetricsPanel';
import type { Ledger } from '../hooks/useLedger';

interface Props { ledger: Ledger; }

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }
function fmtNum(n: number) { return String(n).replace('.', ','); }
function fmtDate(s: string) { return new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }); }

const ACTIVITY = [
  { v: 1.2, label: 'Sitzend' },
  { v: 1.375, label: 'Leicht' },
  { v: 1.55, label: 'Mittel' },
  { v: 1.725, label: 'Aktiv' },
  { v: 1.9, label: 'Sehr aktiv' },
];

export function NutritionView({ ledger }: Props) {
  const { metrics, addMetric, nutrition, addNutrition, deleteNutrition, dietPhases, settings, updateSettings } = ledger;

  const today = isoDate(new Date());
  const [wDate, setWDate] = useState(today);
  const [wVal, setWVal] = useState('');
  const [nDate, setNDate] = useState(today);
  const [kcal, setKcal] = useState('');
  const [burned, setBurned] = useState('');
  const [protein, setProtein] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Gewichtspunkte aufsteigend
  const weightPoints = useMemo(
    () => metrics.filter(m => m.metric === 'weight')
      .map(m => ({ date: m.date, value: m.value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [metrics]
  );
  const bodyweight = weightPoints.length ? weightPoints[weightPoints.length - 1].value : null;
  // Heutiges Gewicht (falls schon eingetragen) — ein Eintrag pro Tag, überschreibt
  const todaysWeight = useMemo(
    () => metrics.find(m => m.metric === 'weight' && m.date === today)?.value ?? null,
    [metrics, today]
  );

  // Chart: roh + gleitender 7-Tage-Schnitt
  const chart = useMemo(() => {
    const avg = movingAverage(weightPoints, 7);
    const byDate = new Map(avg.map(p => [p.date, p.value]));
    return weightPoints.slice(-60).map(p => ({ date: p.date, raw: p.value, avg: byDate.get(p.date) }));
  }, [weightPoints]);

  const rate = useMemo(() => weightTrendRate(weightPoints, 21), [weightPoints]);

  // aktive Diätphase
  const activePhase = useMemo(() =>
    dietPhases.find(p => p.startDate <= today && (!p.endDate || p.endDate >= today)) ?? null,
    [dietPhases, today]
  );

  // TDEE: erst adaptiv aus Daten, sonst Formel (Profil)
  const intake = useMemo(() => nutrition.map(n => ({ date: n.date, kcal: n.kcal })), [nutrition]);
  const tdeeAdaptive = useMemo(() => adaptiveTDEE(weightPoints, intake, 21), [weightPoints, intake]);
  const profileComplete = !!(settings.heightCm && settings.age && settings.sex && settings.activity && bodyweight);
  const tdeeFormula = profileComplete
    ? mifflinTDEE(bodyweight!, settings.heightCm!, settings.age!, settings.sex!, settings.activity!)
    : null;
  const tdee = tdeeAdaptive ?? tdeeFormula;
  const tdeeSource = tdeeAdaptive != null ? 'aus deinen Daten' : tdeeFormula != null ? 'Formel-Schätzung' : null;

  // Abgleich Daten-Bedarf ↔ Formel-Erwartung: sagt, ob dein Tracking stimmt.
  // Positiver gap = echter Verbrauch über der Formel (mehr verbraucht ODER
  // mehr gegessen als getrackt); negativer gap = umgekehrt.
  const reconcile = useMemo(() => {
    if (tdeeAdaptive == null || tdeeFormula == null) return null;
    const gap = tdeeAdaptive - tdeeFormula;
    return { gap, data: tdeeAdaptive, formula: tdeeFormula };
  }, [tdeeAdaptive, tdeeFormula]);

  // Ø extra verbrannte kcal (Sport) der letzten 3 Wochen — nur Info
  const burnedAvg = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 21);
    const recent = nutrition.filter(n => new Date(n.date) >= cutoff && (n.burned || 0) > 0);
    return recent.length ? Math.round(recent.reduce((a, n) => a + (n.burned || 0), 0) / recent.length) : 0;
  }, [nutrition]);

  // Zielkalorien je Phase
  const targetKcal = useMemo(() => {
    if (!tdee) return null;
    const t = activePhase?.type;
    if (t === 'cut') return Math.round((tdee - 500) / 10) * 10;
    if (t === 'bulk') return Math.round((tdee + 300) / 10) * 10;
    return Math.round(tdee / 10) * 10; // Erhaltung / keine Phase
  }, [tdee, activePhase]);
  const proteinTarget = bodyweight ? Math.round(1.8 * bodyweight) : null;

  // Kalorien-Log
  const nutriSorted = useMemo(() => [...nutrition].sort((a, b) => b.date.localeCompare(a.date)), [nutrition]);
  // Netto = gegessen − Sport. Das ist der Wert, der zum Ziel/Defizit zählt.
  const netOf = (n: { kcal: number; burned?: number }) => n.kcal - (n.burned || 0);
  const weeklyNetAvg = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const recent = nutrition.filter(n => new Date(n.date) >= cutoff && n.kcal > 0);
    return recent.length ? Math.round(recent.reduce((a, n) => a + netOf(n), 0) / recent.length) : null;
  }, [nutrition]);

  const RateIcon = rate == null ? Minus : rate < -0.05 ? TrendingDown : rate > 0.05 ? TrendingUp : Minus;
  const rateCol = rate == null ? 'var(--color-text-muted)'
    : (activePhase?.type === 'bulk' ? (rate > 0 ? 'var(--color-success)' : 'var(--color-warning)')
      : rate < 0 ? 'var(--color-success)' : 'var(--color-warning)');

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h1 className="text-3xl tracking-wider text-text font-display">Ernährung</h1>
          <p className="text-xs text-text-dim uppercase tracking-widest font-mono">Gewicht · Kalorien · Bedarf</p>
        </div>
        <Utensils className="w-8 h-8 text-accent" />
      </div>

      {/* GEWICHTSTREND */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Gewichtstrend</h3>
          </div>
          {rate != null && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-1.5 py-0.5 border"
              style={{ color: rateCol, borderColor: rateCol }}>
              <RateIcon className="w-3 h-3" /> {rate > 0 ? '+' : ''}{fmtNum(rate)} kg/Wo.
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-3">
          <input type="date" value={wDate} onChange={e => setWDate(e.target.value)}
            className="brutal-input px-2 py-2 text-xs font-mono flex-1 min-w-0" />
          <input type="text" inputMode="decimal" placeholder="kg"
            value={wVal} onChange={e => setWVal(e.target.value)}
            className="brutal-input w-20 px-2 py-2 text-sm text-center font-mono" />
          <button onClick={() => { const v = parseFloat(wVal.replace(',', '.')); if (!isNaN(v) && v > 0) { addMetric('weight', wDate, v); setWVal(''); } }}
            disabled={!wVal.trim()}
            className="brutal-btn brutal-btn-accent px-3 py-2 text-xs">OK</button>
        </div>
        <p className="text-[9px] text-text-muted font-mono -mt-2 mb-3">
          {todaysWeight != null
            ? <>heute: <span className="text-text font-bold">{fmtNum(todaysWeight)} kg</span> ✓ · neuer Wert überschreibt</>
            : <>1 Eintrag pro Tag — ein neuer Wert am selben Tag überschreibt den alten</>}
        </p>

        {chart.length >= 2 ? (
          <div className="brutal-card-inset p-2" style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={chart}>
                <XAxis dataKey="date" tickFormatter={fmtDate} stroke="#666" fontSize={9} fontFamily="DM Mono" interval="preserveStartEnd" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} width={34} stroke="#666" fontSize={9} fontFamily="DM Mono" />
                {activePhase?.targetWeight && (
                  <ReferenceLine y={activePhase.targetWeight} stroke={DIET_PHASE_INFO[activePhase.type].color} strokeDasharray="5 3">
                    <Label value={`Ziel ${activePhase.targetWeight}`} position="insideBottomRight"
                      fill={DIET_PHASE_INFO[activePhase.type].color} fontSize={9} fontFamily="DM Mono" />
                  </ReferenceLine>
                )}
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-steel)', border: '2px solid #000', boxShadow: '3px 3px 0 #000', fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                  formatter={(v, n) => [`${v} kg`, n === 'avg' ? 'Ø 7 Tage' : 'Gewicht']}
                  labelFormatter={d => new Date(String(d)).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })} />
                <Line type="monotone" dataKey="raw" stroke="var(--color-text-muted)" strokeWidth={1} dot={false} opacity={0.5} />
                <Line type="monotone" dataKey="avg" stroke="var(--color-accent)" strokeWidth={2.5} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[10px] text-text-muted font-mono text-center py-3">Mindestens 2 Gewichtseinträge für den Trend.</p>
        )}
        <p className="text-[9px] text-text-muted font-mono mt-1.5">
          Dünn = Tageswert · Kräftig = gleitender 7-Tage-Schnitt (glättet Wasser­schwankungen)
        </p>
      </div>

      {/* DIÄTPHASEN + KÖRPERMASSE (Taille/Brust/Arm/Bein) — Gewicht kommt oben aus dem Trend */}
      <div className="mb-5">
        <BodyMetricsPanel ledger={ledger} hideWeightMetric showPhases />
      </div>

      {/* KALORIENBEDARF */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Kalorienbedarf</h3>
          </div>
          <button onClick={() => setShowProfile(!showProfile)} className="text-text-muted hover:text-accent transition-colors p-1">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {tdee ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="brutal-card-inset p-2.5 text-center">
                <span className="block text-2xl font-bold text-text font-display tracking-wide leading-none">{tdee}</span>
                <span className="block text-[9px] text-text-muted uppercase tracking-wider font-display mt-1">Erhaltung kcal</span>
                <span className="block text-[8px] text-text-muted font-mono mt-0.5">{tdeeSource}</span>
              </div>
              <div className="brutal-card-inset p-2.5 text-center"
                style={{ borderLeft: `3px solid ${activePhase ? DIET_PHASE_INFO[activePhase.type].color : 'var(--color-accent)'}` }}>
                <span className="block text-2xl font-bold font-display tracking-wide leading-none"
                  style={{ color: activePhase ? DIET_PHASE_INFO[activePhase.type].color : 'var(--color-accent)' }}>
                  {targetKcal}
                </span>
                <span className="block text-[9px] text-text-muted uppercase tracking-wider font-display mt-1">
                  Ziel {activePhase ? DIET_PHASE_INFO[activePhase.type].label : '(keine Phase)'}
                </span>
                {proteinTarget && <span className="block text-[8px] text-text-muted font-mono mt-0.5">≈ {proteinTarget} g Protein</span>}
              </div>
            </div>
            {tdeeAdaptive == null && (
              <p className="text-[9px] text-text-muted font-mono mt-2">
                Trag ein paar Tage Kalorien + Gewicht ein → dann wird der Bedarf aus deinen echten Daten berechnet (genauer als die Formel).
              </p>
            )}

            {/* ABGLEICH: echter Bedarf (aus Daten) vs. Formel-Erwartung */}
            {tdeeAdaptive != null && (
              <div className="brutal-card-inset p-2.5 mt-2"
                style={{ borderLeft: `3px solid ${reconcile && Math.abs(reconcile.gap) > 100 ? 'var(--color-warning)' : 'var(--color-success)'}` }}>
                <span className="section-label flex items-center gap-1.5 mb-1">
                  <Scale className="w-3 h-3" /> Abgleich
                </span>
                <p className="text-[10px] text-text-dim font-mono leading-relaxed">
                  Bedarf aus deinem Verlauf: <span className="text-text font-bold">{tdeeAdaptive} kcal</span>.
                  {' '}So viel verbrauchst du wirklich (Zufuhr + Gewichtsentwicklung).
                </p>
                {reconcile ? (
                  <p className="text-[10px] font-mono leading-relaxed mt-1"
                    style={{ color: Math.abs(reconcile.gap) > 100 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {Math.abs(reconcile.gap) <= 100
                      ? `Passt zur Formel (${reconcile.formula} kcal, Δ ${reconcile.gap > 0 ? '+' : ''}${reconcile.gap}) — dein Tracking wirkt stimmig.`
                      : reconcile.gap > 0
                        ? `${reconcile.gap} kcal über der Formel (${reconcile.formula}). Du verbrauchst mehr als gedacht — oder isst mehr, als du trackst.`
                        : `${-reconcile.gap} kcal unter der Formel (${reconcile.formula}). Du verbrauchst weniger — oder trackst mehr, als du isst.`}
                  </p>
                ) : (
                  <p className="text-[9px] text-text-muted font-mono mt-1">
                    Fülle dein Profil (Zahnrad) aus → dann vergleiche ich den Daten-Bedarf mit der Formel und zeige dir, ob dein Tracking passt.
                  </p>
                )}
                <p className="text-[9px] text-text-muted font-mono mt-1">
                  Ziel & Bedarf oben nutzen bereits diesen echten Wert.
                  {burnedAvg > 0 && <> · Ø Sport {burnedAvg} kcal/Tag (zählt ins Tages­budget, nicht doppelt in den Bedarf).</>}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-[10px] text-text-dim font-mono">
            Fülle dein Profil aus (Zahnrad oben rechts) oder logge einige Tage Kalorien + Gewicht,
            dann schätzt die App deinen Kalorienbedarf.
          </p>
        )}

        {showProfile && (
          <div className="brutal-card-inset p-2.5 mt-2 space-y-2 animate-slide-up">
            <span className="section-label">Profil (für Formel-Schätzung)</span>
            <div className="flex gap-1.5">
              {(['m', 'f'] as const).map(s => (
                <button key={s} onClick={() => updateSettings({ sex: s })}
                  className={`brutal-chip flex-1 justify-center py-1.5 text-[11px] ${settings.sex === s ? 'active' : ''}`}>
                  {s === 'm' ? 'Mann' : 'Frau'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" placeholder="Größe cm" defaultValue={settings.heightCm ?? ''}
                onChange={e => updateSettings({ heightCm: e.target.value ? parseInt(e.target.value) : undefined })}
                className="brutal-input flex-1 px-2 py-1.5 text-xs font-mono min-w-0" />
              <input type="number" inputMode="numeric" placeholder="Alter" defaultValue={settings.age ?? ''}
                onChange={e => updateSettings({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="brutal-input w-20 px-2 py-1.5 text-xs font-mono" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY.map(a => (
                <button key={a.v} onClick={() => updateSettings({ activity: a.v })}
                  className={`brutal-chip px-2 py-1 text-[10px] ${settings.activity === a.v ? 'active' : ''}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KALORIEN-LOG */}
      <div className="brutal-card-sm p-3 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text font-display tracking-wider uppercase">Kalorien-Log</h3>
          </div>
          {weeklyNetAvg != null && (
            <span className="text-[10px] text-text-dim font-mono">
              Ø 7 T netto: <span className="font-bold"
                style={{ color: targetKcal && weeklyNetAvg <= targetKcal ? 'var(--color-success)' : 'var(--color-text)' }}>
                {weeklyNetAvg}
              </span> kcal
            </span>
          )}
        </div>

        {/* Datum */}
        <input type="date" value={nDate} onChange={e => setNDate(e.target.value)}
          className="brutal-input w-full px-2 py-2 text-xs font-mono mb-1.5" />
        {/* Gegessen · +Sport · Protein · OK */}
        <div className="flex gap-1.5 mb-1">
          <div className="flex-1 min-w-0">
            <span className="block text-[8px] text-text-muted font-mono uppercase tracking-wider mb-0.5 text-center">Gegessen</span>
            <input type="number" inputMode="numeric" placeholder="kcal" value={kcal} onChange={e => setKcal(e.target.value)}
              className="brutal-input w-full px-1 py-2 text-sm text-center font-mono" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[8px] text-warning font-mono uppercase tracking-wider mb-0.5 text-center">+ Sport</span>
            <input type="number" inputMode="numeric" placeholder="kcal" value={burned} onChange={e => setBurned(e.target.value)}
              className="brutal-input w-full px-1 py-2 text-sm text-center font-mono"
              style={{ color: 'var(--color-warning)' }} title="Extra verbrannte Kalorien (Cardio/Sport)" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[8px] text-text-muted font-mono uppercase tracking-wider mb-0.5 text-center">Protein g</span>
            <input type="number" inputMode="numeric" placeholder="g" value={protein} onChange={e => setProtein(e.target.value)}
              className="brutal-input w-full px-1 py-2 text-sm text-center font-mono" />
          </div>
          <button onClick={() => {
            const k = parseInt(kcal);
            if (isNaN(k) || k <= 0) return;
            const pr = parseInt(protein);
            const bn = parseInt(burned);
            addNutrition(nDate, k, isNaN(pr) ? undefined : pr, isNaN(bn) || bn <= 0 ? undefined : bn);
            setKcal(''); setProtein(''); setBurned('');
          }}
            disabled={!kcal.trim()}
            className="brutal-btn brutal-btn-accent px-3 self-end py-2 text-xs">OK</button>
        </div>
        {/* Live-Netto-Vorschau bei aktivem Sport-Eintrag */}
        {(() => {
          const k = parseInt(kcal); const bn = parseInt(burned);
          if (isNaN(k) || isNaN(bn) || bn <= 0) return null;
          return (
            <p className="text-[10px] font-mono text-text-muted mb-2">
              Netto: <span className="text-text font-bold">{k} − {bn} = {k - bn} kcal</span>
              {targetKcal && <span> · Ziel {targetKcal}</span>}
            </p>
          );
        })()}
        <p className="text-[9px] text-text-muted font-mono mb-2">
          Netto = Gegessen − Sport. Der Sport erhöht dein Tagesbudget, dein Defizit bleibt gleich.
        </p>

        {nutriSorted.length > 0 ? (
          <div className="space-y-1 max-h-44 overflow-y-auto">
            {nutriSorted.slice(0, 8).map(n => {
              const net = netOf(n);
              const hasSport = (n.burned || 0) > 0;
              return (
                <div key={n.id} className="flex items-center justify-between py-1 px-2 brutal-card-inset">
                  <span className="text-xs text-text-dim font-mono">{fmtDate(n.date)}</span>
                  <div className="flex items-center gap-2.5">
                    {hasSport ? (
                      <span className="font-mono text-right leading-tight">
                        <span className="text-sm text-text font-bold">{net}</span>
                        <span className="text-[9px] text-text-muted"> netto</span>
                        <span className="block text-[9px] text-text-muted">
                          {n.kcal} − <span className="text-warning">{n.burned}</span>
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-text font-bold font-mono">{n.kcal} kcal</span>
                    )}
                    {n.protein != null && <span className="text-[10px] text-text-muted font-mono">{n.protein}g P</span>}
                    <button onClick={() => deleteNutrition(n.id)} className="text-text-muted hover:text-danger transition-colors p-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-text-muted font-mono text-center py-2">Noch keine Kalorien-Einträge</p>
        )}
      </div>
    </div>
  );
}
