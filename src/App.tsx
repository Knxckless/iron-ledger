import { useState, useCallback, useEffect } from 'react';
import { useLedger } from './hooks/useLedger';
import { HomeView } from './views/HomeView';
import { TodayView } from './views/TodayView';
import { LibraryView } from './views/LibraryView';
import { HistoryView } from './views/HistoryView';
import { ProgressView } from './views/ProgressView';
import { NutritionView } from './views/NutritionView';
import { Home, Dumbbell, BookOpen, Clock, TrendingUp, Apple } from 'lucide-react';

type Tab = 'home' | 'today' | 'library' | 'history' | 'progress' | 'nutrition';

const TABS: { key: Tab; icon: typeof Home; label: string }[] = [
  { key: 'home', icon: Home, label: 'Start' },
  { key: 'today', icon: Dumbbell, label: 'Training' },
  { key: 'library', icon: BookOpen, label: 'Übungen' },
  { key: 'nutrition', icon: Apple, label: 'Diät' },
  { key: 'history', icon: Clock, label: 'Verlauf' },
  { key: 'progress', icon: TrendingUp, label: 'Charts' },
];

function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>();
  const ledger = useLedger();
  const handleStartTraining = useCallback((templateId?: string) => {
    setPendingTemplateId(templateId);
    setTab('today');
  }, []);

  // "Heute dran"-Vorwahl nur einmal verbrauchen: verlässt man den Training-Tab,
  // wird sie gelöscht, damit beim Zurückkommen der laufende Entwurf wiederkommt.
  useEffect(() => {
    if (tab !== 'today' && pendingTemplateId !== undefined) setPendingTemplateId(undefined);
  }, [tab, pendingTemplateId]);

  if (!ledger.ready) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 noise-bg" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-20 h-20 brutal-card flex items-center justify-center animate-slam-in"
          style={{ background: 'var(--color-accent)' }}>
          <Dumbbell className="w-10 h-10 text-black" />
        </div>
        <div className="space-y-3 text-center">
          <div className="skeleton w-40 h-5" />
          <div className="skeleton w-28 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto noise-bg overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <div key={tab} className="animate-fade-in">
          {tab === 'home' && <HomeView ledger={ledger} onStartTraining={handleStartTraining} />}
          {tab === 'today' && <TodayView ledger={ledger} initialTemplateId={pendingTemplateId} />}
          {tab === 'library' && <LibraryView ledger={ledger} />}
          {tab === 'nutrition' && <NutritionView ledger={ledger} />}
          {tab === 'history' && <HistoryView ledger={ledger} />}
          {tab === 'progress' && <ProgressView ledger={ledger} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 brutal-card z-50" style={{
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ key, icon: Icon, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 min-h-[52px] transition-all duration-150 ${
                  active ? 'text-accent' : 'text-text-dim'
                }`}
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.62rem', letterSpacing: '0.06em' }}
                aria-label={label}>
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {active && (
                  <div className="w-2 h-1 mt-0.5" style={{ backgroundColor: 'var(--color-accent)' }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
