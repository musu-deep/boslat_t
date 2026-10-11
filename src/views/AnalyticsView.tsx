import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Heart, MessageCircle, Repeat2, Users, FileText, Award, Activity } from 'lucide-react';
import { Card, Badge, Spinner } from '@/components/ui';
import { fetchAgents, fetchSocialPosts, fetchContent, fetchTasks } from '@/lib/api';
import { platformLabels, platformColors } from '@/lib/utils';
import type { Agent, SocialPost, Content, Task } from '@/types';

export function AnalyticsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, s, c, t] = await Promise.all([fetchAgents(), fetchSocialPosts(), fetchContent(), fetchTasks()]);
        setAgents(a); setSocialPosts(s); setContent(c); setTasks(t);
      } catch (err) { console.error('Analytics load error:', err); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) { return (<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>); }

  const totalLikes = socialPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = socialPosts.reduce((sum, p) => sum + p.comments, 0);
  const totalShares = socialPosts.reduce((sum, p) => sum + p.shares, 0);
  const totalEngagement = totalLikes + totalComments + totalShares;

  const platformBreakdown = ['twitter', 'instagram', 'facebook', 'telegram', 'whatsapp'].map((p) => {
    const posts = socialPosts.filter((post) => post.platform === p);
    const eng = posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
    return { platform: p, count: posts.length, engagement: eng, pct: totalEngagement > 0 ? (eng / totalEngagement) * 100 : 0 };
  }).filter((p) => p.count > 0);

  const maxEngagement = Math.max(...platformBreakdown.map((p) => p.engagement), 1);

  const agentPerformance = agents.map((agent) => {
    const agentSocial = socialPosts.filter((p) => p.agent_id === agent.id);
    const agentContent = content.filter((c) => c.author_agent_id === agent.id);
    const agentTasks = tasks.filter((t) => t.agent_id === agent.id);
    return { agent, socialCount: agentSocial.length, contentCount: agentContent.length, taskCount: agentTasks.length, engagement: agentSocial.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0) };
  });

  const metrics = [
    { label: 'إجمالي التفاعل', value: totalEngagement.toLocaleString('ar-SA'), icon: TrendingUp, color: 'from-navy-600 to-navy-800' },
    { label: 'الإعجابات', value: totalLikes.toLocaleString('ar-SA'), icon: Heart, color: 'from-gold-400 to-gold-600' },
    { label: 'التعليقات', value: totalComments.toLocaleString('ar-SA'), icon: MessageCircle, color: 'from-navy-500 to-navy-700' },
    { label: 'المشاركات', value: totalShares.toLocaleString('ar-SA'), icon: Repeat2, color: 'from-gold-400 to-gold-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-navy-800 font-display flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-navy-500" /> التحليلات والأداء
        </h2>
        <p className="text-sm text-slate-400 mt-1">قياس أثر الإضاءات الاستراتيجية</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="p-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-navy-800 font-display">{metric.value}</p>
              <p className="text-sm text-slate-400">{metric.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-bold text-navy-800 font-display mb-4">توزيع التفاعل حسب المنصة</h3>
          {platformBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-4">
              {platformBreakdown.map((p) => (
                <div key={p.platform}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge label={platformLabels[p.platform] ?? p.platform} colorClass={platformColors[p.platform] ?? ''} />
                    <span className="text-sm font-bold text-navy-700">{p.engagement.toLocaleString('ar-SA')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-l from-navy-500 to-navy-700" style={{ width: `${(p.engagement / maxEngagement) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">{p.count} منشور</span>
                    <span className="text-xs text-slate-400">{p.pct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-navy-800 font-display mb-4">أداء الوكلاء</h3>
          <div className="space-y-3">
            {agentPerformance.map(({ agent, socialCount, contentCount, taskCount, engagement }) => (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                  style={{ backgroundColor: agent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }}>
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy-800 text-sm">{agent.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {contentCount}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {socialCount}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {taskCount}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gold-700">{agent.performance_score}%</p>
                  <p className="text-xs text-slate-400">{engagement.toLocaleString('ar-SA')} تفاعل</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center"><FileText className="w-5 h-5 text-navy-600" /></div>
            <div><p className="text-2xl font-bold text-navy-800 font-display">{content.length}</p><p className="text-xs text-slate-400">إجمالي المحتوى</p></div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'منشور', count: content.filter((c) => c.status === 'published').length, color: 'bg-navy-600' },
              { label: 'مجدول', count: content.filter((c) => c.status === 'scheduled').length, color: 'bg-gold-400' },
              { label: 'مسودة', count: content.filter((c) => c.status === 'draft').length, color: 'bg-slate-300' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-sm text-navy-600 flex-1">{s.label}</span>
                <span className="text-sm font-bold text-navy-700">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center"><Activity className="w-5 h-5 text-gold-700" /></div>
            <div><p className="text-2xl font-bold text-navy-800 font-display">{tasks.length}</p><p className="text-xs text-slate-400">إجمالي المهام</p></div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'مكتملة', count: tasks.filter((t) => t.status === 'completed').length, color: 'bg-navy-600' },
              { label: 'قيد التنفيذ', count: tasks.filter((t) => t.status === 'in_progress').length, color: 'bg-gold-400' },
              { label: 'قيد الانتظار', count: tasks.filter((t) => t.status === 'pending').length, color: 'bg-slate-300' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-sm text-navy-600 flex-1">{s.label}</span>
                <span className="text-sm font-bold text-navy-700">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center"><Award className="w-5 h-5 text-navy-600" /></div>
            <div><p className="text-2xl font-bold text-navy-800 font-display">{Math.round(agents.reduce((sum, a) => sum + a.performance_score, 0) / (agents.length || 1))}%</p><p className="text-xs text-slate-400">متوسط الأداء</p></div>
          </div>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: agent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }}>
                  {agent.name.charAt(0)}
                </div>
                <span className="text-sm text-navy-600 flex-1 truncate">{agent.name}</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${agent.performance_score}%`, backgroundColor: agent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
