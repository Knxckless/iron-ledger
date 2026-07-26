// Einstellungen (Vollbild, über das Zahnrad auf der Startseite erreichbar):
// Übungen & Workouts (Bibliothek), Routinen, Backup/Import und Werksreset.

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Upload, Trash2, BookOpen, ListChecks, Database, Target } from 'lucide-react';
import { RoutineSettings } from '../components/RoutineSettings';
import { LibraryView } from './LibraryView';
import { exportBackup, importBackup, resetAll } from '../lib/storage';
import type { Ledger } from '../hooks/useLedger';

interface Props {
  ledger: Ledger;
  onClose: () => void;
}

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }

export function SettingsView({ ledger, onClose }: Props) {
  const { reload, settings, updateSettings } = ledger;
  const showTarget = settings.showTarget !== false;
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState(0);   // 0 = zu, 1 = 1. Warnung, 2 = letzte Warnung
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-ledger-backup-${isoDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackup(String(reader.result));
      if (result.ok) { reload(); setImportMsg('Backup importiert ✓'); }
      else setImportMsg(result.error || 'Import fehlgeschlagen');
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    handleExport();                       // Sicherheitsnetz: erst Backup laden
    setResetStep(0);
    setTimeout(() => { resetAll(); window.location.reload(); }, 900);
  };

  return (
    <div className="pb-4">
      {/* Kopf mit Zurück */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 pb-3 noise-bg"
        style={{ backgroundColor: 'var(--color-bg)', borderBottom: '2px solid #000' }}>
        <button onClick={onClose} className="brutal-chip px-2.5 py-2" aria-label="Zurück">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl tracking-wider text-text font-display leading-none">Einstellungen</h1>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-mono">Übungen · Routinen · Backup</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* TRAINING */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <h2 className="section-label !text-sm">Training</h2>
          </div>
          <div className="brutal-card-sm p-3">
            <button onClick={() => updateSettings({ showTarget: !showTarget })}
              className="w-full flex items-center justify-between">
              <div className="text-left">
                <span className="block text-xs font-bold text-text font-display tracking-wider uppercase">Zielvorschlag</span>
                <span className="block text-[10px] text-text-dim font-mono mt-0.5">
                  Empfohlenes Gewicht × Wdh. pro Übung im Training anzeigen
                </span>
              </div>
              <span className="w-10 h-5 border-2 border-black flex items-center px-0.5 flex-shrink-0 transition-all"
                style={{ backgroundColor: showTarget ? 'var(--color-accent)' : 'var(--color-concrete)',
                  justifyContent: showTarget ? 'flex-end' : 'flex-start' }}>
                <span className="w-3.5 h-3.5 bg-black block" />
              </span>
            </button>
          </div>
        </section>

        {/* ROUTINEN */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-accent" />
            <h2 className="section-label !text-sm">Routinen</h2>
          </div>
          <RoutineSettings ledger={ledger} />
        </section>

        {/* ÜBUNGEN & WORKOUTS (komplette Bibliothek) */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="section-label !text-sm">Übungen & Workouts</h2>
          </div>
          {/* LibraryView bringt eigenen Header/Padding mit → negativer Rand gleicht das aus */}
          <div className="-mx-4">
            <LibraryView ledger={ledger} />
          </div>
        </section>

        {/* BACKUP + RESET */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-accent" />
            <h2 className="section-label !text-sm">Backup & Daten</h2>
          </div>
          <div className="brutal-card-sm p-3">
            <p className="text-[10px] text-text-dim font-mono mb-3">
              Alle Daten liegen nur lokal auf diesem Gerät. Regelmäßig exportieren!
            </p>
            <div className="flex gap-2">
              <button onClick={handleExport} className="brutal-btn brutal-btn-accent flex-1 py-2.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">
                <Upload className="w-3.5 h-3.5" /> Import
              </button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }} />
            </div>
            {importMsg && (
              <p className="text-[10px] font-mono mt-2"
                style={{ color: importMsg.includes('✓') ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {importMsg}
              </p>
            )}

            {/* Werksreset — zwei Bestätigungen + automatischer Backup-Download */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-steel-light)' }}>
              {resetStep === 0 && (
                <button onClick={() => setResetStep(1)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-display
                    tracking-wider uppercase text-danger hover:text-red-300 transition-colors border border-danger">
                  <Trash2 className="w-3.5 h-3.5" /> Alle Daten zurücksetzen
                </button>
              )}
              {resetStep === 1 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-[10px] text-text-dim font-mono">
                    <span className="text-danger font-bold">Schritt 1 von 2.</span> Das löscht alle
                    Workouts, Übungen, Maße, Diätphasen und Routinen. Vorher wird automatisch ein
                    Backup heruntergeladen.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setResetStep(2)} className="brutal-btn flex-1 py-2.5 text-xs"
                      style={{ backgroundColor: 'var(--color-warning)', color: '#000' }}>Weiter</button>
                    <button onClick={() => setResetStep(0)}
                      className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">Abbrechen</button>
                  </div>
                </div>
              )}
              {resetStep === 2 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-[10px] font-mono">
                    <span className="text-danger font-bold">Schritt 2 von 2 — endgültig.</span>{' '}
                    <span className="text-text-dim">Das kann nicht rückgängig gemacht werden. Beim
                      Klick lädt zuerst dein Backup (JSON) herunter, danach werden alle Daten gelöscht.</span>
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleReset} className="brutal-btn flex-1 py-2.5 text-xs"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                      <Download className="w-3.5 h-3.5" /> Backup laden & löschen
                    </button>
                    <button onClick={() => setResetStep(0)}
                      className="brutal-btn brutal-btn-dark flex-1 py-2.5 text-xs">Abbrechen</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
