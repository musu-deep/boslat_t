import { AgentsHero } from '@/components/AgentsHero';
import { useEffect, useState } from 'react';
import { Users, FileText, CalendarHeart, Share2, TrendingUp, Activity, CheckCircle2, Clock, ArrowUpRight, Sparkles, Zap, Compass } from 'lucide-react';
import { Card, Badge, Spinner } from '@/components/ui';
import { fetchAgents, fetchTasks, fetchContent, fetchSocialPosts, fetchFridayPosts } from '@/lib/api';
import { statusLabels, statusColors, timeAgo, priorityColors, priorityLabels } from '@/lib/utils';
import type { Agent, Task, Content, SocialPost, FridayPost } from '@/types';
import type { ViewKey } from '@/components/Sidebar';

interface DashboardProps {
  onNavigate: (view: ViewKey) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [fridayPosts, setFridayPosts] = useState<FridayPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, t, c, s, f] = await Promise.all([
          fetchAgents(),
          fetchTasks(),
          fetchContent(),
          fetchSocialPosts(),
          fetchFridayPosts(),
        ]);
        setAgents(a);
        setTasks(t);
        setContent(c);
        setSocialPosts(s);
        setFridayPosts(f);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const workingAgents = agents.filter((a) => a.status === 'working').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const publishedContent = content.filter((c) => c.status === 'published').length;
  const totalEngagement = socialPosts.reduce((sum, s) => sum + s.likes + s.comments + s.shares, 0);
  const upcomingFriday = fridayPosts.find((f) => f.status === 'draft' || f.status === 'scheduled');

  const stats = [
    { label: 'الوكلاء النشطون', value: `${workingAgents}/${agents.length}`, icon: Users, trend: '+2' },
    { label: 'مهام قيد التنفيذ', value: pendingTasks, icon: Activity, trend: '+5' },
    { label: 'محتوى منشور', value: publishedContent, icon: FileText, trend: '+12' },
    { label: 'إجمالي التفاعل', value: totalEngagement.toLocaleString('ar-SA'), icon: TrendingUp, trend: '+18%' },
  ];

  const recentTasks = tasks.slice(0, 5);
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return (
    <div className="space-y-6 animate-fadeIn">
      <AgentsHero onNavigate={onNavigate} hasFridayDraft={Boolean(upcomingFriday)} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isGold = i % 2 === 0;
          return (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy-800 font-display">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-xs text-gold-700 font-medium">{stat.trend}</span>
                    <span className="text-xs text-slate-400">عن الأسبوع الماضي</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  isGold
                    ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-200'
                    : 'bg-gradient-to-br from-navy-600 to-navy-800 shadow-navy-200'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Agents Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-navy-800 font-display">حالة الوكلاء</h3>
          <button onClick={() => onNavigate('agents')} className="text-sm text-navy-600 hover:text-navy-700 flex items-center gap-1 font-medium">
            عرض الكل <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {agents.map((agent, idx) => {
            const isGold = idx % 2 === 0;
            const color = isGold ? '#c5a55a' : '#1a3a5c';
            return (
              <Card key={agent.id} className="p-4 text-center">
                <div className="relative inline-block mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${
                    agent.status === 'working' ? 'bg-gold-400' : agent.status === 'idle' ? 'bg-slate-300' : 'bg-amber-400'
                  }`} />
                </div>
                <h4 className="font-bold text-navy-800 text-sm">{agent.name}</h4>
                <p className="text-xs text-slate-400 mb-2">{agent.role}</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-500">{agent.tasks_completed} مهمة</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-gold-700 font-medium">{agent.performance_score}%</span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${agent.performance_score}%`, backgroundColor: color }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-800 font-display">المهام الأخيرة</h3>
              <Badge label={`${pendingTasks} نشطة`} colorClass="bg-navy-50 text-navy-600" />
            </div>
            <div className="space-y-3">
              {recentTasks.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">لا توجد مهام حالياً</p>
              )}
              {recentTasks.map((task) => {
                const agent = task.agent_id ? agentMap.get(task.agent_id) : null;
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.status === 'completed' ? 'bg-navy-100 text-navy-600' :
                      task.status === 'in_progress' ? 'bg-gold-50 text-gold-700' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-700 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {agent && (
                          <span className="text-xs font-medium" style={{ color: agent.avatar_color === '#c5a55a' ? '#a8884a' : '#1a3a5c' }}>{agent.name}</span>
                        )}
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{timeAgo(task.created_at)}</span>
                      </div>
                    </div>
                    <Badge label={priorityLabels[task.priority] ?? task.priority} colorClass={priorityColors[task.priority] ?? ''} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-navy-800 font-display mb-4">إجراءات سريعة</h3>
            <div className="space-y-2">
              <QuickAction icon={CalendarHeart} label="تجهيز بوست الجمعة" color="bg-gold-50 text-gold-700" onClick={() => onNavigate('friday')} />
              <QuickAction icon={FileText} label="إنشاء محتوى جديد" color="bg-navy-50 text-navy-600" onClick={() => onNavigate('content')} />
              <QuickAction icon={Share2} label="جدولة منشور سوشال" color="bg-navy-50 text-navy-600" onClick={() => onNavigate('social')} />
              <QuickAction icon={Zap} label="ابتكار موضوع جديد" color="bg-gold-50 text-gold-700" onClick={() => onNavigate('topics')} />
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-navy-50 to-white border-navy-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <h3 className="font-bold text-navy-800 font-display text-sm">آخر التحديثات</h3>
            </div>
            <div className="space-y-3">
              {socialPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold-400" />
                  <span className="text-slate-600 truncate flex-1">{post.content?.slice(0, 40) ?? 'منشور'}...</span>
                  <span className="text-xs text-slate-400">{post.likes} إعجاب</span>
                </div>
              ))}
              {socialPosts.length === 0 && <p className="text-sm text-slate-400">لا توجد تحديثات</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: typeof Users; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-navy-700">{label}</span>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-navy-400 mr-auto transition-colors" />
    </button>
  );
}
