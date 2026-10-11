import { useState } from 'react';
import { Sidebar, type ViewKey } from '@/components/Sidebar';
import { Dashboard } from '@/views/Dashboard';
import { AgentsView } from '@/views/AgentsView';
import { ContentView } from '@/views/ContentView';
import { FridayView } from '@/views/FridayView';
import { TopicsView } from '@/views/TopicsView';
import { SocialView } from '@/views/SocialView';
import { AnalyticsView } from '@/views/AnalyticsView';

function App() {
  const [view, setView] = useState<ViewKey>('dashboard');

  const titles: Record<ViewKey, string> = {
    dashboard: 'لوحة التحكم',
    agents: 'الوكلاء',
    content: 'مهام إعداد المحتوى',
    friday: 'غروب الجمعة',
    topics: 'مقترحات الوكلاء',
    social: 'سوشال مونتيور',
    analytics: 'الأداء والتقارير',
  };

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar current={view} onNavigate={setView} />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-lg font-bold text-navy-800 font-display">{titles[view]}</h1>
              <p className="text-xs text-slate-400">منصة البوصلة | إضاءات استراتيجية نحو التغيير</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-gold-400 font-bold text-sm shadow-md ring-1 ring-gold-500/20">
                ع
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'agents' && <AgentsView />}
          {view === 'content' && <ContentView />}
          {view === 'friday' && <FridayView />}
          {view === 'topics' && <TopicsView />}
          {view === 'social' && <SocialView />}
          {view === 'analytics' && <AnalyticsView />}
        </div>
      </main>
    </div>
  );
}

export default App;

