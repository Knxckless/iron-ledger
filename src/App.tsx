import { useState, useCallback, useEffect, useRef } from 'react';
import { useLedger } from './hooks/useLedger';
import { HomeView } from './views/HomeView';
import { TodayView } from './views/TodayView';
import { HistoryView } from './views/HistoryView';
import { ProgressView } from './views/ProgressView';
import { NutritionView } from './views/NutritionView';
import { SettingsView } from './views/SettingsView';
import { LibraryView } from './views/LibraryView';
import { Home, Dumbbell, Clock, TrendingUp, Apple } from 'lucide-react';

type Tab = 'home' | 'today' | 'progress' | 'nutrition' | 'history';

const TABS: { key: Tab; icon: typeof Home; label: string }[] = [
  { key: 'home', icon: Home, label: 'Start' },
  { key: 'today', icon: Dumbbell, label: 'Training' },
  { key: 'progress', icon: TrendingUp, label: 'Analyse' },
  { key: 'nutrition', icon: Apple, label: 'Diät' },
  { key: 'history', icon: Clock, label: 'Verlauf' },
];

function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const ledger = useLedger();

  // Design-Theme auf <html> anwenden (Tokens in index.css). 'beton' = Standard.
  const theme = ledger.settings.theme ?? 'beton';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
      if (bg) meta.setAttribute('content', bg);
    }
  }, [theme]);

  const handleStartTraining = useCallback((templateId?: string) => {
    setPendingTemplateId(templateId);
    setShowSettings(false);
    setShowLibrary(false);
    setTab('today');
  }, []);

  // "Heute dran"-Vorwahl nur einmal verbrauchen: verlässt man den Training-Tab,
  // wird sie gelöscht, damit beim Zurückkommen der laufende Entwurf wiederkommt.
  useEffect(() => {
    if (tab !== 'today' && pendingTemplateId !== undefined) setPendingTemplateId(undefined);
  }, [tab, pendingTemplateId]);

  const selectTab = useCallback((key: Tab) => { setShowSettings(false); setShowLibrary(false); setTab(key); }, []);

  // Wischen nach links/rechts wechselt den Tab. Gesten auf horizontal scroll-
  // baren Elementen (Chip-Leisten, Chart-Brush) oder Eingaben werden ignoriert.
  const touchRef = useRef<{ x: number; y: number; skip: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (showSettings || showLibrary || e.touches.length !== 1) { touchRef.current = null; return; }
    const t = e.touches[0];
    let skip = false;
    let el = e.target as HTMLElement | null;
    if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) skip = true;
    while (el && el !== e.currentTarget) {
      const ox = getComputedStyle(el).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 4) { skip = true; break; }
      el = el.parentElement;
    }
    touchRef.current = { x: t.clientX, y: t.clientY, skip };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchRef.current;
    touchRef.current = null;
    if (!s || s.skip) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const idx = TABS.findIndex(x => x.key === tab);
    const ni = dx < 0 ? Math.min(idx + 1, TABS.length - 1) : Math.max(idx - 1, 0);
    if (TABS[ni].key !== tab) setTab(TABS[ni].key);
  };

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
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {showSettings ? (
          <div className="animate-fade-in">
            <SettingsView ledger={ledger} onClose={() => setShowSettings(false)} />
          </div>
        ) : showLibrary ? (
          <div className="animate-fade-in">
            <LibraryView ledger={ledger} onClose={() => setShowLibrary(false)} />
          </div>
        ) : (
          <div key={tab} className="animate-fade-in">
            {tab === 'home' && <HomeView ledger={ledger} onStartTraining={handleStartTraining} onOpenSettings={() => setShowSettings(true)} onOpenDiet={() => selectTab('nutrition')} />}
            {tab === 'today' && <TodayView ledger={ledger} initialTemplateId={pendingTemplateId} onOpenLibrary={() => setShowLibrary(true)} />}
            {tab === 'nutrition' && <NutritionView ledger={ledger} />}
            {tab === 'history' && <HistoryView ledger={ledger} />}
            {tab === 'progress' && <ProgressView ledger={ledger} />}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 brutal-card z-50" style={{
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ key, icon: Icon, label }) => {
            const active = tab === key && !showSettings;
            return (
              <button
                key={key}
                onClick={() => selectTab(key)}
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
