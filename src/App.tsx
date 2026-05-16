import { useState, useCallback } from 'react';
import { useWorkouts } from './hooks/useWorkouts';
import { HomeView } from './views/HomeView';
import { TodayView } from './views/TodayView';
import { HistoryView } from './views/HistoryView';
import { ProgressView } from './views/ProgressView';
import { Home, Dumbbell, Clock, TrendingUp } from 'lucide-react';

type Tab = 'home' | 'today' | 'history' | 'progress';

const TABS: { key: Tab; icon: typeof Home; label: string }[] = [
  { key: 'home', icon: Home, label: 'Start' },
  { key: 'today', icon: Dumbbell, label: 'Training' },
  { key: 'history', icon: Clock, label: 'Verlauf' },
  { key: 'progress', icon: TrendingUp, label: 'Charts' },
];

function App() {
  const [tab, setTab] = useState<Tab>('home');
  const { workouts, ready, addWorkout, deleteWorkout } = useWorkouts();
  const handleStartTraining = useCallback(() => setTab('today'), []);

  if (!ready) {
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
    <div className="h-full flex flex-col max-w-lg mx-auto noise-bg" style={{ backgroundColor: 'var(--color-bg)' }}>
      <main className="flex-1 overflow-y-auto pb-16">
        <div key={tab} className="animate-fade-in">
          {tab === 'home' && <HomeView workouts={workouts} onStartTraining={handleStartTraining} />}
          {tab === 'today' && <TodayView onSave={addWorkout} workouts={workouts} />}
          {tab === 'history' && <HistoryView workouts={workouts} onDelete={deleteWorkout} />}
          {tab === 'progress' && <ProgressView workouts={workouts} />}
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
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-150 ${
                  active ? 'text-accent' : 'text-text-dim'
                }`}
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.65rem', letterSpacing: '0.06em' }}
              >
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
