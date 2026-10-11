import { PlatformHeader } from '@/components/PlatformHeader';
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
  const [contentRequest, setContentRequest] = useState<{ token: number; taskId?: string; create?: boolean } | undefined>();
  function navigate(next: ViewKey, taskId?: string) { setView(next); if (next === 'content') setContentRequest({ token: Date.now(), taskId }); }

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
        <PlatformHeader title={titles[view]} view={view} onNavigate={navigate} />

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'agents' && <AgentsView />}
          {view === 'content' && <ContentView request={contentRequest} />}
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

