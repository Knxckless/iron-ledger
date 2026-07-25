// Training loggen: Workout-Template wählen (Presets + eigene), Sätze erfassen,
// Countdown-Pausentimer mit Vibration, letztes Training laden, PR-Erkennung.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Save, Plus, X, Dumbbell, ChevronDown, ChevronUp, Timer,
  Copy, Trophy, Pause, Play, RotateCcw, ClipboardList, TrendingUp, TrendingDown, Minus, Target, ListChecks,
  Check, Circle,
} from 'lucide-react';
import type { WorkoutEntry, ExerciseEntry, WorkoutTemplate } from '../data/model';
import { MUSCLE_BY_ID } from '../data/muscles';
import type { MuscleId } from '../data/muscles';
import { detectNewPRs, round1, suggestNextTarget } from '../lib/stats';
import type { NewPR, TargetSuggestion } from '../lib/stats';
import type { Ledger } from '../hooks/useLedger';
import { readJSON, writeJSON, KEYS } from '../lib/storage';

// Laufendes, noch nicht gespeichertes Training (übersteht Tab-Wechsel + App-Schließen)
interface WorkoutDraft {
  templateId: string;
  session: ExerciseEntry[];
  activeIdx: number | null;
  doneIdx: number[];
  savedAt: number;
}

interface Props {
  ledger: Ledger;
  initialTemplateId?: string;   // von "Heute dran" auf Start: dieses Workout vorwählen
}

const TIMER_PRESETS = [60, 90, 120, 180];

function emptySets(): ExerciseEntry['sets'] {
  return [{ weight: 0, reps: 0, notes: '' }];
}

// Kommazahlen zulassen: "7,5" und "7.5" → 7.5; leer/ungültig → 0
function parseDec(v: string): number {
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

// Zahl mit deutschem Komma anzeigen (7.5 → "7,5")
function fmtNum(n: number): string {
  return String(n).replace('.', ',');
}

// Gehört ein Workout-Eintrag zu diesem Template? (custom via id, Preset via typ)
function belongsTo(w: WorkoutEntry, tpl: WorkoutTemplate): boolean {
  return w.templateId === tpl.id || (!!tpl.preset && w.type === tpl.preset);
}

// ===== Pausentimer (Countdown) =====

function RestTimer({ defaultSec, autoStart, onToggleAutoStart, startSignal }: {
  defaultSec: number;
  autoStart: boolean;
  onToggleAutoStart: (v: boolean) => void;
  startSignal: number;
}) {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(defaultSec);
  const [remaining, setRemaining] = useState(defaultSec);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const firedRef = useRef(false);
  const scheduledRef = useRef<OscillatorNode[]>([]);   // vorgeplante Alarm-Töne
  const keepAliveRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  // Audio-Kontext auf Nutzergeste anlegen/entsperren (nötig fürs Piepen)
  const ensureAudio = () => {
    if (!audioRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    if (audioRef.current?.state === 'suspended') void audioRef.current.resume();
    return audioRef.current;
  };

  // Keepalive: ein praktisch stummer Dauerton hält den Audio-Kontext auch im
  // Hintergrund/bei gesperrtem Bildschirm aktiv, damit der vorgeplante Alarm feuert.
  // Web-Audio mischt sich unter laufende Musik, statt sie zu pausieren.
  const startKeepAlive = () => {
    const ctx = audioRef.current;
    if (!ctx || keepAliveRef.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 40;
    gain.gain.value = 0.0004;   // unhörbar, aber != 0 → Hardware bleibt wach
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    keepAliveRef.current = { osc, gain };
  };
  const stopKeepAlive = () => {
    try { keepAliveRef.current?.osc.stop(); keepAliveRef.current?.osc.disconnect(); } catch { /* ignore */ }
    keepAliveRef.current = null;
  };

  // Lauten, durchdringenden Alarm exakt auf die Endzeit der Audio-Uhr einplanen.
  // Feuert auch, wenn die JS-Timer im Hintergrund gedrosselt werden.
  const cancelAlarm = () => {
    scheduledRef.current.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch { /* ignore */ } });
    scheduledRef.current = [];
  };
  const scheduleAlarm = (atTime: number) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    cancelAlarm();
    const pattern = [0, 0.34, 0.68, 1.02, 1.44];   // 5 Beeps, letzter höher/länger
    pattern.forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = i === pattern.length - 1 ? 1560 : 1040;
      const st = atTime + t;
      const len = i === pattern.length - 1 ? 0.5 : 0.26;
      gain.gain.setValueAtTime(0.0001, st);
      gain.gain.exponentialRampToValueAtTime(1.0, st + 0.015);   // laut
      gain.gain.setValueAtTime(1.0, st + len - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + len);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(st); osc.stop(st + len + 0.02);
      scheduledRef.current.push(osc);
    });
  };

  const notify = () => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pause vorbei 💪', { body: 'GO! Nächster Satz.', tag: 'rest-timer' });
      }
    } catch { /* ignore */ }
  };

  // Wake Lock: Bildschirm bleibt während der Pause an (damit Ton/Vibration sicher feuern)
  const acquireWake = async () => {
    try {
      if ('wakeLock' in navigator && !wakeRef.current) {
        wakeRef.current = await navigator.wakeLock.request('screen');
      }
    } catch { /* ignore */ }
  };
  const releaseWake = () => {
    try { void wakeRef.current?.release(); } catch { /* ignore */ }
    wakeRef.current = null;
  };

  useEffect(() => {
    if (!running) return;
    firedRef.current = false;
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        setRunning(false);
        // Ton kommt aus dem vorgeplanten Alarm (feuert auch im Hintergrund);
        // Vibration + Notification sind ergänzende Best-Effort-Signale.
        navigator.vibrate?.([300, 120, 300, 120, 500]);
        notify();
        stopKeepAlive();
        releaseWake();
      }
    }, 250);
    return () => clearInterval(tick);
  }, [running]);

  // Wake Lock nach Tab-Wechsel erneut anfordern (Browser gibt ihn beim Wegwischen frei)
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible' && running) void acquireWake(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [running]);

  // Audio bei der ersten Nutzergeste im Training entsperren, damit der
  // Auto-Start (nach ausgefülltem Satz) sofort einen laufenden Kontext hat.
  useEffect(() => {
    const unlock = () => ensureAudio();
    document.addEventListener('pointerdown', unlock);
    return () => document.removeEventListener('pointerdown', unlock);
  }, []);

  // Aufräumen beim Verlassen (Tab-Wechsel): Alarm + Keepalive + Wake Lock lösen
  useEffect(() => () => { cancelAlarm(); stopKeepAlive(); releaseWake(); }, []);

  const start = (secs: number) => {
    const ctx = ensureAudio();
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
    void acquireWake();
    startKeepAlive();
    if (ctx) scheduleAlarm(ctx.currentTime + secs);
    setDuration(secs);
    setRemaining(secs);
    endRef.current = Date.now() + secs * 1000;
    setRunning(true);
  };

  const resume = () => {
    const ctx = ensureAudio();
    void acquireWake();
    startKeepAlive();
    if (ctx) scheduleAlarm(ctx.currentTime + remaining);
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  };

  // Auto-Start: nach einem erfassten Satz die Pause automatisch starten.
  // startSignal wird beim "Satz +" hochgezählt; ersten Wert überspringen.
  const startRef = useRef(start);
  startRef.current = start;
  const seenSignal = useRef(startSignal);
  useEffect(() => {
    if (startSignal === seenSignal.current) return;
    seenSignal.current = startSignal;
    if (!autoStart) return;
    setVisible(true);
    startRef.current(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progress = duration > 0 ? remaining / duration : 0;
  const done = !running && remaining === 0;

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)}
        className="w-full py-2.5 mb-4 brutal-card-sm text-text-dim flex items-center justify-center gap-2
          hover:text-accent transition-colors font-display tracking-wider uppercase text-xs">
        <Timer className="w-3.5 h-3.5" /> Pausentimer
      </button>
    );
  }

  return (
    <div className="brutal-card-sm p-3 mb-4 animate-slide-up"
      style={done ? { borderColor: 'var(--color-success)' } : {}}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {TIMER_PRESETS.map(s => (
            <button key={s} onClick={() => start(s)}
              className={`brutal-chip px-2 py-1 text-[10px] ${duration === s && (running || remaining > 0) ? 'active' : ''}`}>
              {s < 120 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>
        <button onClick={() => { setRunning(false); setRemaining(duration); cancelAlarm(); stopKeepAlive(); releaseWake(); setVisible(false); }}
          className="text-text-muted hover:text-danger p-1"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold font-mono tabular-nums tracking-wider"
          style={{ color: done ? 'var(--color-success)' : remaining <= 10 && running ? 'var(--color-warning)' : 'var(--color-text)' }}>
          {done ? 'GO!' : fmt(remaining)}
        </span>
        <div className="flex-1 h-3 border border-black" style={{ backgroundColor: 'var(--color-concrete)' }}>
          <div className="h-full transition-all duration-300"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: remaining <= 10 && running ? 'var(--color-warning)' : 'var(--color-accent)',
            }} />
        </div>
        <div className="flex gap-1">
          {running ? (
            <button onClick={() => { setRunning(false); cancelAlarm(); stopKeepAlive(); releaseWake(); }} className="brutal-chip px-2.5 py-1.5">
              <Pause className="w-3.5 h-3.5" /></button>
          ) : (
            <button onClick={() => remaining > 0 && remaining < duration ? resume() : start(duration)}
              className="brutal-chip px-2.5 py-1.5 active">
              <Play className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={() => { setRunning(false); setRemaining(duration); cancelAlarm(); stopKeepAlive(); releaseWake(); }}
            className="brutal-chip px-2.5 py-1.5"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Auto-Start-Schalter: nach jedem "Satz +" die Pause automatisch starten */}
      <button onClick={() => onToggleAutoStart(!autoStart)}
        className="mt-2.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider
          text-text-muted hover:text-text transition-colors">
        <span className="w-8 h-4 border border-black flex items-center px-0.5 transition-all"
          style={{ backgroundColor: autoStart ? 'var(--color-accent)' : 'var(--color-concrete)',
            justifyContent: autoStart ? 'flex-end' : 'flex-start' }}>
          <span className="w-3 h-3 bg-black block" />
        </span>
        Auto-Start nach Satz {autoStart ? 'an' : 'aus'}
      </button>
    </div>
  );
}

// ===== PR-Feier-Overlay =====

function PRCelebration({ prs, onClose }: { prs: NewPR[]; onClose: () => void }) {
  const kindLabel: Record<NewPR['kind'], string> = {
    weight: 'Max-Gewicht', reps: 'Max-Wdh.', e1rm: 'e1RM',
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="brutal-card p-5 max-w-sm w-full animate-slam-in"
        style={{ borderColor: 'var(--color-warning)', boxShadow: '6px 6px 0 #000, 0 0 40px rgba(255,214,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-warning"
            style={{ animation: 'slamIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }} />
          <h2 className="text-3xl font-display tracking-wider text-warning">NEUER REKORD!</h2>
        </div>
        <div className="space-y-2 mb-4">
          {prs.map((pr, i) => (
            <div key={i} className="brutal-card-inset px-3 py-2 flex items-center justify-between animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div>
                <span className="text-sm font-bold text-text font-display tracking-wider block">{pr.exerciseName}</span>
                <span className="text-[9px] text-text-muted font-mono uppercase">{kindLabel[pr.kind]}</span>
              </div>
              <span className="text-sm font-mono">
                <span className="text-text-muted">{round1(pr.previous)}</span>
                <span className="text-text-dim mx-1">→</span>
                <span className="text-warning font-bold">{round1(pr.value)}{pr.kind === 'reps' ? '' : ' kg'}</span>
              </span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="brutal-btn brutal-btn-accent w-full py-3 text-sm">
          Weiter
        </button>
      </div>
    </div>
  );
}

// ===== Hauptview =====

export function TodayView({ ledger, initialTemplateId }: Props) {
  const { templates, exercises: libraryExercises, exercisesByName, workouts, addWorkout, addExercise,
    routines, settings, updateSettings } = ledger;

  // Pausentimer-Einstellungen (Default: 180 s, Auto-Start an)
  const restDefault = settings.restDefaultSec ?? 180;
  const autoStartRest = settings.timerAutoStart ?? true;
  const [restSignal, setRestSignal] = useState(0);
  // Sätze, die den Auto-Start schon ausgelöst haben (verhindert Mehrfachstart)
  const startedSetsRef = useRef<Set<string>>(new Set());

  // Aktive Routine: nur deren Workouts (in Routinen-Reihenfolge) zeigen.
  // Ohne aktive Routine (oder wenn leer/verwaist) → alle Workouts.
  const activeRoutine = routines.find(r => r.id === settings.activeRoutineId) ?? null;
  const visibleTemplates = useMemo(() => {
    if (!activeRoutine) return templates;
    const inRoutine = activeRoutine.templateIds
      .map(id => templates.find(t => t.id === id))
      .filter((t): t is WorkoutTemplate => !!t);
    return inRoutine.length ? inRoutine : templates;
  }, [activeRoutine, templates]);

  const [templateId, setTemplateId] = useState<string>(visibleTemplates[0]?.id ?? '');
  const template: WorkoutTemplate | undefined =
    visibleTemplates.find(t => t.id === templateId)
    ?? templates.find(t => t.id === templateId)
    ?? visibleTemplates[0];

  const [session, setSession] = useState<ExerciseEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPRs, setNewPRs] = useState<NewPR[] | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  // Geführtes Training: am Anfang ist KEINE Übung aktiv — alle sind "geplant".
  // Tippt man eine an, wird sie zur aktuellen Übung und rutscht nach ganz oben.
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [doneIdx, setDoneIdx] = useState<Set<number>>(new Set());

  // Übung aktivieren → nach oben holen; Vorschau einklappen, damit sie oben sitzt
  const activate = (exIdx: number) => {
    setActiveIdx(exIdx);
    setShowPreview(false);
  };

  const markDone = (exIdx: number) => {
    setDoneIdx(prev => {
      const next = new Set(prev);
      next.add(exIdx);
      // zur nächsten noch offenen Übung springen (sonst zurück zur Planung)
      const nextOpen = session.findIndex((_, i) => i !== exIdx && !next.has(i));
      setActiveIdx(nextOpen >= 0 ? nextOpen : null);
      return next;
    });
  };
  const reopen = (exIdx: number) => {
    setDoneIdx(prev => { const n = new Set(prev); n.delete(exIdx); return n; });
    setActiveIdx(exIdx);
  };

  // Standard-Belegung = Übungen der letzten Session dieses Workouts (leere Sätze).
  // Erst wenn es noch keine Session gibt, greift die Template-Liste aus dem Builder.
  const loadTemplate = useCallback((tpl: WorkoutTemplate | undefined) => {
    let names: string[] = [];
    if (tpl) {
      const sessions = workouts
        .filter(w => belongsTo(w, tpl))
        .sort((a, b) => b.date.localeCompare(a.date));
      names = sessions.length ? sessions[0].exercises.map(e => e.name) : tpl.exerciseNames;
    }
    setSession(names.map(name => ({ name, sets: emptySets() })));
    setEdits({});
    setActiveIdx(null);
    setDoneIdx(new Set());
    startedSetsRef.current = new Set();
    setSaved(false);
    setShowAddExercise(false);
  }, [workouts]);

  // Erste Initialisierung, sobald Templates geladen sind:
  // "Heute dran" > laufender Entwurf > Standard (letzte Session).
  useEffect(() => {
    if (initialized || !template) return;
    // 1) Explizit über "Heute dran" gestartet → dieses Template frisch laden
    if (initialTemplateId && templates.some(t => t.id === initialTemplateId)) {
      const tpl = templates.find(t => t.id === initialTemplateId)!;
      setTemplateId(initialTemplateId);
      loadTemplate(tpl);
      setInitialized(true);
      return;
    }
    // 2) Laufender Entwurf mit echten Daten → wiederherstellen
    const draft = readJSON<WorkoutDraft>(KEYS.draft);
    const draftTpl = draft && templates.find(t => t.id === draft.templateId);
    const draftHasData = !!draft?.session?.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));
    if (draft && draftTpl && draftHasData) {
      setTemplateId(draft.templateId);
      setSession(draft.session);
      setActiveIdx(draft.activeIdx ?? null);
      setDoneIdx(new Set(draft.doneIdx ?? []));
      const started = new Set<string>();
      draft.session.forEach(ex => ex.sets.forEach((s, i) => {
        if (s.weight > 0 && s.reps > 0) started.add(`${ex.name}#${i}`);
      }));
      startedSetsRef.current = started;
      setInitialized(true);
      return;
    }
    // 3) Standard
    loadTemplate(template);
    setTemplateId(template.id);
    setInitialized(true);
  }, [initialized, template, templates, initialTemplateId, loadTemplate]);

  // Routinenwechsel: fällt das gewählte Workout aus der Auswahl, aufs erste springen
  useEffect(() => {
    if (initialized && visibleTemplates.length &&
        !visibleTemplates.some(t => t.id === templateId)) {
      setTemplateId(visibleTemplates[0].id);
      loadTemplate(visibleTemplates[0]);
    }
  }, [visibleTemplates, initialized, templateId, loadTemplate]);

  const selectTemplate = (id: string) => {
    setTemplateId(id);
    loadTemplate(templates.find(t => t.id === id));
  };

  // Laufendes Training als Entwurf sichern (nur wenn echte Daten vorhanden).
  // So bleibt es beim Tab-Wechsel erhalten und übersteht das Schließen der App.
  useEffect(() => {
    if (!initialized) return;
    const hasAny = session.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));
    if (hasAny) {
      writeJSON(KEYS.draft, {
        templateId, session, activeIdx, doneIdx: [...doneIdx], savedAt: Date.now(),
      } satisfies WorkoutDraft);
    } else {
      localStorage.removeItem(KEYS.draft);
    }
  }, [session, activeIdx, doneIdx, templateId, initialized]);

  // Muskeln, die die heutige Session trifft (aus der Bibliothek abgeleitet)
  const sessionMuscles = useMemo(() => {
    const primary = new Set<MuscleId>();
    const secondary = new Set<MuscleId>();
    for (const ex of session) {
      const defn = exercisesByName.get(ex.name);
      if (!defn) continue;
      for (const { muscle, role } of defn.muscles) {
        if (role === 'primary') primary.add(muscle);
        else secondary.add(muscle);
      }
    }
    for (const m of primary) secondary.delete(m);
    return { primary: [...primary], secondary: [...secondary] };
  }, [session, exercisesByName]);

  const getLastThree = (exerciseName: string) =>
    workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .map(w => ({ date: w.date, exercise: w.exercises.find(e => e.name === exerciseName)! }))
      .filter(h => h.exercise.sets.some(s => s.weight > 0 && s.reps > 0))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

  const toggleRef = (name: string) => {
    setExpandedRefs(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  // Ziel-Vorschlag pro Übung der Session, aus dem gesamten Verlauf abgeleitet
  const targets = useMemo(() => {
    const map = new Map<string, TargetSuggestion | null>();
    for (const ex of session) {
      if (map.has(ex.name)) continue;
      const history = workouts
        .filter(w => w.exercises.some(e => e.name === ex.name))
        .map(w => ({ date: w.date, sets: w.exercises.find(e => e.name === ex.name)!.sets }));
      map.set(ex.name, suggestNextTarget(history));
    }
    return map;
  }, [session, workouts]);

  // Alle bisherigen Sessions dieses Workouts, neueste zuerst
  const templateSessions = useMemo(() => {
    if (!template) return [];
    return workouts
      .filter(w => belongsTo(w, template))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [workouts, template]);

  const lastOfTemplate = templateSessions[0] ?? null;

  // Workout-eigene Übungs-Bib: alles, was je in diesem Workout gemacht wurde
  // (nach Häufigkeit sortiert) — dient als Schnellauswahl beim Hinzufügen.
  const workoutPool = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of templateSessions) {
      for (const ex of w.exercises) counts.set(ex.name, (counts.get(ex.name) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
  }, [templateSessions]);

  // Vorschau der letzten Session dieses Templates: Übungen, Reihenfolge, Satzzahl
  const [showPreview, setShowPreview] = useState(true);
  const templatePreview = useMemo(() => {
    if (!lastOfTemplate) return null;
    return lastOfTemplate.exercises.map(ex => {
      const valid = ex.sets.filter(s => s.weight > 0 && s.reps > 0);
      const top = valid.reduce((mx, s) => (s.weight > mx ? s.weight : mx), 0);
      return { name: ex.name, setCount: valid.length, topWeight: top };
    });
  }, [lastOfTemplate]);

  const duplicateLast = () => {
    if (!lastOfTemplate) return;
    setSession(lastOfTemplate.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, rir: s.rir, notes: '' })),
    })));
    setActiveIdx(null);
    setDoneIdx(new Set());
    setSaved(false);
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'notes' | 'rir', value: string | number | undefined) => {
    setSession(prev => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  // Tipp-Puffer für Zahlenfelder: hält den rohen String (z. B. "7,") während des
  // Tippens, damit Kommazahlen nicht vorzeitig auf die geparste Zahl zurückspringen.
  const [edits, setEdits] = useState<Record<string, string>>({});
  const editKey = (exIdx: number, setIdx: number, field: string) => `${exIdx}-${setIdx}-${field}`;

  const setNumField = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'rir', raw: string) => {
    setEdits(prev => ({ ...prev, [editKey(exIdx, setIdx, field)]: raw }));
    const val = field === 'rir'
      ? (raw.trim() === '' ? undefined : parseDec(raw))
      : parseDec(raw);
    updateSet(exIdx, setIdx, field, val);
  };
  const blurNumField = (exIdx: number, setIdx: number, field: string) => {
    setEdits(prev => { const n = { ...prev }; delete n[editKey(exIdx, setIdx, field)]; return n; });
    // Auto-Start: sobald ein Satz vollständig ist (Gewicht + Wdh.), Pause starten —
    // je Satz nur einmal, damit Nachbearbeiten nicht erneut auslöst.
    const set = session[exIdx]?.sets[setIdx];
    if (set && set.weight > 0 && set.reps > 0) {
      const key = `${session[exIdx].name}#${setIdx}`;
      if (!startedSetsRef.current.has(key)) {
        startedSetsRef.current.add(key);
        setRestSignal(s => s + 1);
      }
    }
  };
  const numFieldValue = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'rir', stored: number | undefined) => {
    const k = editKey(exIdx, setIdx, field);
    if (k in edits) return edits[k];
    if (field === 'rir') return stored == null ? '' : fmtNum(stored);
    return stored ? fmtNum(stored) : '';
  };

  const addSet = (exIdx: number) => {
    setSession(prev => {
      const updated = [...prev];
      const last = updated[exIdx].sets[updated[exIdx].sets.length - 1];
      // Neuer Satz übernimmt das Gewicht des letzten — spart Tipparbeit
      updated[exIdx] = {
        ...updated[exIdx],
        sets: [...updated[exIdx].sets, { weight: last?.weight || 0, reps: 0, notes: '' }],
      };
      return updated;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setSession(prev => {
      const updated = [...prev];
      const sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
      updated[exIdx] = { ...updated[exIdx], sets: sets.length ? sets : emptySets() };
      return updated;
    });
  };

  const removeSessionExercise = (exIdx: number) => {
    setSession(prev => prev.filter((_, i) => i !== exIdx));
    // Fertig-Markierungen an die verschobenen Indizes anpassen
    setDoneIdx(prev => {
      const n = new Set<number>();
      prev.forEach(i => { if (i < exIdx) n.add(i); else if (i > exIdx) n.add(i - 1); });
      return n;
    });
    setActiveIdx(a => (a === null ? null : a === exIdx ? null : a > exIdx ? a - 1 : a));
  };

  const handleAddExercise = (name: string, keepOpen = false) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!exercisesByName.has(trimmed)) {
      // Neue Übung landet automatisch in der Bibliothek (Muskeln später zuordnen)
      addExercise({ name: trimmed, equipment: 'machine', muscles: [] });
    }
    setSession(prev => {
      if (prev.some(s => s.name === trimmed)) return prev;
      setActiveIdx(prev.length);   // neue Übung wird aktiv
      return [...prev, { name: trimmed, sets: emptySets() }];
    });
    setNewExerciseName('');
    if (!keepOpen) setShowAddExercise(false);
  };

  // Schnellauswahl aus diesem Workout (noch nicht in der Session)
  const poolToAdd = useMemo(
    () => workoutPool.filter(n => !session.some(s => s.name === n)),
    [workoutPool, session]
  );

  const availableToAdd = useMemo(
    () => libraryExercises
      .filter(e => !session.some(s => s.name === e.name) && !workoutPool.includes(e.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'de')),
    [libraryExercises, session, workoutPool]
  );

  const handleSave = () => {
    if (!template) return;
    const validExercises = session
      .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.weight > 0 && s.reps > 0) }))
      .filter(ex => ex.sets.length > 0);
    if (validExercises.length === 0) return;

    const entry: Omit<WorkoutEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      type: template.preset ?? 'custom',
      label: template.name,
      templateId: template.id,
      exercises: validExercises,
    };
    const prs = detectNewPRs(entry, workouts);
    addWorkout(entry);
    localStorage.removeItem(KEYS.draft);
    setSaved(true);
    if (prs.length > 0) setNewPRs(prs);
    // Editor für die nächste Session frisch machen (Entwurf ist erledigt)
    setSession(prev => prev.map(ex => ({ name: ex.name, sets: emptySets() })));
    setActiveIdx(null);
    setDoneIdx(new Set());
    setEdits({});
    startedSetsRef.current = new Set();
    setTimeout(() => setSaved(false), 2500);
  };

  const hasData = session.some(ex => ex.sets.some(s => s.weight > 0 && s.reps > 0));
  const accentColor = template?.color ?? 'var(--color-accent)';

  return (
    <div className="p-4">
      {newPRs && <PRCelebration prs={newPRs} onClose={() => setNewPRs(null)} />}

      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <div>
          <h1 className="text-3xl tracking-wider text-text font-display">Training</h1>
          <p className="text-xs text-text-dim uppercase tracking-widest font-mono">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Dumbbell className="w-8 h-8 text-accent" />
      </div>

      <RestTimer
        defaultSec={restDefault}
        autoStart={autoStartRest}
        onToggleAutoStart={v => updateSettings({ timerAutoStart: v })}
        startSignal={restSignal} />

      {/* Aktive Routine (falls gesetzt) */}
      {activeRoutine && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <ListChecks className="w-3 h-3 text-accent" />
          <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider">
            Routine: <span className="text-text font-bold">{activeRoutine.name}</span>
          </span>
        </div>
      )}

      {/* Workout-Auswahl (nur Workouts der aktiven Routine, sonst alle) */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {visibleTemplates.map(t => (
          <button key={t.id} onClick={() => selectTemplate(t.id)}
            className="brutal-chip px-3.5 py-2.5 text-sm whitespace-nowrap flex-shrink-0"
            style={template?.id === t.id
              ? { backgroundColor: t.color, color: '#000', borderColor: '#000', boxShadow: '3px 3px 0 #000' }
              : {}}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Muskel-Vorschau der Session */}
      {(sessionMuscles.primary.length > 0 || sessionMuscles.secondary.length > 0) && (
        <div className="flex flex-wrap items-center gap-1 mb-3 animate-fade-in">
          <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider mr-1">Trifft:</span>
          {sessionMuscles.primary.map(m => (
            <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 border font-bold"
              style={{ backgroundColor: accentColor, color: '#000', borderColor: '#000' }}>
              {MUSCLE_BY_ID[m].short}
            </span>
          ))}
          {sessionMuscles.secondary.map(m => (
            <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 border"
              style={{ backgroundColor: 'var(--color-concrete)', color: 'var(--color-text-dim)', borderColor: '#3d3d3d' }}>
              {MUSCLE_BY_ID[m].short}
            </span>
          ))}
        </div>
      )}

      {/* Vorschau der letzten Session dieses Templates */}
      {templatePreview && templatePreview.length > 0 && lastOfTemplate && (
        <div className="brutal-card-sm mb-3 animate-fade-in" style={{ borderLeft: `4px solid ${accentColor}` }}>
          <button onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left">
            <div className="flex items-center gap-2 min-w-0">
              <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
              <span className="text-xs font-bold text-text font-display tracking-wider uppercase">
                Letzte Session
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {new Date(lastOfTemplate.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                {' · '}{templatePreview.reduce((s, e) => s + e.setCount, 0)} Sätze
              </span>
            </div>
            {showPreview ? <ChevronUp className="w-4 h-4 text-text-dim flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-text-dim flex-shrink-0" />}
          </button>
          {showPreview && (
            <div className="px-3 pb-3 space-y-1">
              {templatePreview.map((e, i) => (
                <div key={`${e.name}-${i}`} className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-text-muted w-4 text-right">{i + 1}.</span>
                  <span className="text-text-dim flex-1 truncate">{e.name}</span>
                  <span className="px-1.5 py-0.5 border font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-concrete)', borderColor: '#3d3d3d', color: 'var(--color-text)' }}>
                    {e.setCount}×
                  </span>
                  {e.topWeight > 0 && <span className="text-accent w-14 text-right">{e.topWeight}kg</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lastOfTemplate && !hasData && (
        <button onClick={duplicateLast}
          className="w-full py-2.5 mb-3 brutal-card-sm text-text-dim flex items-center justify-center gap-2
            hover:text-accent transition-colors font-display tracking-wider uppercase text-xs animate-fade-in">
          <Copy className="w-3.5 h-3.5" />
          Letztes {template?.name}-Training laden ({new Date(lastOfTemplate.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})
        </button>
      )}

      <div className="space-y-3">
        {(activeIdx === null
          ? session.map((_, i) => i)
          : [activeIdx, ...session.map((_, i) => i).filter(i => i !== activeIdx)]
        ).map((exIdx) => {
          const ex = session[exIdx];
          const target = targets.get(ex.name) ?? null;
          const TrendMark = target?.trend === 'up' ? TrendingUp
            : target?.trend === 'down' ? TrendingDown : Minus;
          const trendCol = target?.trend === 'up' ? 'var(--color-success)'
            : target?.trend === 'down' ? 'var(--color-danger)' : 'var(--color-text-muted)';
          const isActive = exIdx === activeIdx;
          const isDone = doneIdx.has(exIdx);
          const loggedSets = ex.sets.filter(s => s.weight > 0 && s.reps > 0).length;
          const stripe = isDone ? 'var(--color-success)' : isActive ? accentColor : '#3d3d3d';
          return (
          <div key={`${ex.name}-${exIdx}`} className="brutal-card-sm p-3 animate-slide-up"
            style={{ borderLeft: `4px solid ${stripe}`, opacity: isDone && !isActive ? 0.6 : 1 }}>
            <div className="flex items-center justify-between gap-2">
              {/* Nummer + Name — antippen macht die Übung aktiv (rutscht nach oben) */}
              <button onClick={() => activate(exIdx)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left">
                <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono border"
                  style={isDone
                    ? { backgroundColor: 'var(--color-success)', color: '#000', borderColor: '#000' }
                    : isActive
                      ? { backgroundColor: accentColor, color: '#000', borderColor: '#000' }
                      : { color: 'var(--color-text-dim)', borderColor: '#3d3d3d' }}>
                  {exIdx + 1}
                </span>
                <span className={`text-sm font-bold text-text font-display tracking-wider truncate ${isDone ? 'line-through' : ''}`}>
                  {ex.name}
                </span>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-text-muted font-mono">
                  {isDone || !isActive ? `${loggedSets || ex.sets.length}×` : `${ex.sets.length}S`}
                </span>
                {isActive && (
                  <button onClick={() => removeSessionExercise(exIdx)}
                    className="text-text-muted hover:text-danger transition-colors p-1"
                    title="Aus dieser Session entfernen">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Fertig-Haken */}
                <button onClick={() => isDone ? reopen(exIdx) : markDone(exIdx)}
                  className="p-0.5 transition-colors" title={isDone ? 'Wieder öffnen' : 'Übung fertig'}>
                  {isDone
                    ? <Check className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                    : <Circle className="w-5 h-5 text-text-muted hover:text-success" />}
                </button>
              </div>
            </div>

            {/* Eingeklappt: kurze Ziel-/Zuletzt-Zeile zum schnellen Überblick */}
            {!isActive && target && (
              <div className="mt-1.5 ml-8 text-[10px] font-mono text-text-muted">
                {isDone
                  ? <span className="text-success">erledigt</span>
                  : <>Ziel <span className="text-text-dim">{fmtNum(target.weight)}kg × {fmtNum(target.reps)}</span></>}
              </div>
            )}

            {/* Aktive Übung: volle Eingabe */}
            {isActive && (<>
            <button onClick={() => toggleRef(ex.name)}
              className="mt-2 text-[10px] text-text-muted hover:text-accent transition-colors font-mono
                flex items-center gap-0.5 brutal-chip px-1.5 py-0.5 w-fit">
              Verlauf
              {expandedRefs.has(ex.name) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Zuletzt + Zielvorschlag (aus Verlauf) */}
            {target && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 my-2 text-[10px] font-mono">
                <span className="text-text-muted">
                  Zuletzt: <span className="text-text-dim">{fmtNum(target.lastWeight)}kg × {fmtNum(target.lastReps)}</span>
                  {target.lastRir != null && (
                    <span className="text-warning"> · {fmtNum(target.lastRir)} RIR</span>
                  )}
                  <span className="text-text-muted"> · {target.lastSetCount}S</span>
                </span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 border"
                  style={{ borderColor: accentColor, color: 'var(--color-text)' }}>
                  <Target className="w-3 h-3" style={{ color: accentColor }} />
                  Ziel {fmtNum(target.weight)}kg × {fmtNum(target.reps)}
                  <TrendMark className="w-3 h-3" style={{ color: trendCol }} />
                </span>
              </div>
            )}

            {expandedRefs.has(ex.name) && (
              <div className="mb-2 p-2 animate-slide-up" style={{ backgroundColor: 'var(--color-concrete)' }}>
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
                            .map(s => `${fmtNum(s.weight)}kg × ${fmtNum(s.reps)}${s.rir != null ? ` · ${fmtNum(s.rir)} RIR` : ''}`)
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

            <div className="space-y-1.5">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted w-4 text-right font-mono">{setIdx + 1}</span>
                  <input type="text" inputMode="decimal"
                    placeholder={target ? fmtNum(target.weight) : '0'}
                    value={numFieldValue(exIdx, setIdx, 'weight', set.weight)}
                    onChange={e => setNumField(exIdx, setIdx, 'weight', e.target.value)}
                    onBlur={() => blurNumField(exIdx, setIdx, 'weight')}
                    className="brutal-input w-[68px] px-1 py-2.5 text-xs text-center font-mono" />
                  <span className="text-text-muted text-[10px] uppercase font-mono">kg</span>
                  <input type="text" inputMode="decimal"
                    placeholder={target ? fmtNum(target.reps) : '0'}
                    value={numFieldValue(exIdx, setIdx, 'reps', set.reps)}
                    onChange={e => setNumField(exIdx, setIdx, 'reps', e.target.value)}
                    onBlur={() => blurNumField(exIdx, setIdx, 'reps')}
                    className="brutal-input w-12 px-1 py-2.5 text-xs text-center font-mono" />
                  <input type="text" inputMode="decimal" placeholder="RIR"
                    value={numFieldValue(exIdx, setIdx, 'rir', set.rir)}
                    onChange={e => setNumField(exIdx, setIdx, 'rir', e.target.value)}
                    onBlur={() => blurNumField(exIdx, setIdx, 'rir')}
                    className="brutal-input w-10 px-0.5 py-2.5 text-xs text-center font-mono"
                    style={{ color: 'var(--color-warning)' }}
                    title="Reps in Reserve (optional)" />
                  <input type="text" placeholder="Notiz"
                    value={set.notes || ''}
                    onChange={e => updateSet(exIdx, setIdx, 'notes', e.target.value)}
                    className="brutal-input flex-1 px-2 py-2.5 text-xs font-mono min-w-0" />
                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(exIdx, setIdx)}
                      className="text-text-muted hover:text-danger flex-shrink-0 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => addSet(exIdx)}
              className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-hot transition-colors
                font-display tracking-wider uppercase py-1">
              <Plus className="w-3 h-3" /> Satz
            </button>

            {/* Übung abhaken → springt zur nächsten offenen Übung */}
            <button onClick={() => markDone(exIdx)}
              className="brutal-btn w-full py-2.5 mt-3 text-sm"
              style={{ backgroundColor: 'var(--color-success)', color: '#000' }}>
              <Check className="w-4 h-4" />
              {doneIdx.size + 1 >= session.length ? 'Übung fertig' : 'Fertig → nächste Übung'}
            </button>
            </>)}
          </div>
          );
        })}
      </div>

      {showAddExercise ? (
        <div className="brutal-card-sm p-3 mt-3 animate-slide-up space-y-2.5">
          {/* Schnellauswahl aus diesem Workout */}
          {poolToAdd.length > 0 && (
            <div>
              <span className="section-label mb-1">Aus diesem Workout</span>
              <div className="flex flex-wrap gap-1.5">
                {poolToAdd.map(name => (
                  <button key={name} onClick={() => handleAddExercise(name, true)}
                    className="brutal-chip px-2.5 py-1.5 text-[11px] gap-1"
                    style={{ backgroundColor: accentColor, color: '#000', borderColor: '#000' }}>
                    <Plus className="w-3 h-3" /> {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableToAdd.length > 0 && (
            <div className="relative">
              <select value="" key={session.length}
                onChange={e => e.target.value && handleAddExercise(e.target.value, true)}
                className="w-full appearance-none brutal-input px-3 py-2.5 text-sm font-mono cursor-pointer">
                <option value="" disabled>Aus Bibliothek wählen…</option>
                {availableToAdd.map(ex => (
                  <option key={ex.id} value={ex.name}>{ex.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddExercise(newExerciseName)}
              placeholder="…oder neue Übung anlegen"
              className="brutal-input flex-1 px-3 py-2.5 text-sm font-mono min-w-0" />
            <button onClick={() => handleAddExercise(newExerciseName)} disabled={!newExerciseName.trim()}
              className="brutal-btn brutal-btn-accent px-3 py-2 text-sm">OK</button>
            <button onClick={() => setShowAddExercise(false)}
              className="brutal-btn brutal-btn-dark px-3 py-2 text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddExercise(true)}
          className="mt-3 w-full py-3 brutal-card-sm text-text-dim flex items-center justify-center gap-2
            hover:text-text transition-colors font-display tracking-wider uppercase text-sm">
          <Plus className="w-4 h-4" /> Übung hinzufügen
        </button>
      )}

      <button onClick={handleSave} disabled={!hasData}
        className={`brutal-btn w-full py-3.5 mt-4 text-lg animate-slam-in ${
          saved ? '' : hasData ? 'brutal-btn-accent' : 'brutal-btn-dark'
        }`}
        style={saved ? { backgroundColor: 'var(--color-success)', color: '#000' } : {}}>
        <Save className="w-4 h-4" />
        {saved ? 'GESPEICHERT' : 'Training speichern'}
      </button>
    </div>
  );
}
