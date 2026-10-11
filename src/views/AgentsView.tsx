import { useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, Settings, CheckCircle2, Activity, Zap, Cpu } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { fetchAgents, fetchTasks, updateAgent } from '@/lib/api';
import { statusLabels, statusColors } from '@/lib/utils';
import type { Agent, Task } from '@/types';

export function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [a, t] = await Promise.all([fetchAgents(), fetchTasks()]);
      setAgents(a);
      setTasks(t);
    } catch (err) {
      console.error('Agents load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAgentStatus(agent: Agent) {
    const newStatus = agent.status === 'working' ? 'idle' : 'working';
    try {
      await updateAgent(agent.id, { status: newStatus });
      setAgents(agents.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a)));
      if (selectedAgent?.id === agent.id) setSelectedAgent({ ...agent, status: newStatus });
    } catch (err) {
      console.error('Update agent error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const agentTasks = selectedAgent ? tasks.filter((t) => t.agent_id === selectedAgent.id) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-800 font-display">وكلاء الذكاء الاصطناعي</h2>
          <p className="text-sm text-slate-400 mt-1">فريق العمل الاستراتيجي - الثبات والبساطة والعمق</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent, idx) => {
          const isGold = idx % 2 === 1;
          const color = isGold ? '#c5a55a' : '#1a3a5c';
          const agentTaskCount = tasks.filter((t) => t.agent_id === agent.id && t.status !== 'completed').length;
          return (
            <Card key={agent.id} className="overflow-hidden">
              {/* Card Header with gradient */}
              <div
                className="h-24 relative"
                style={{ background: isGold ? 'linear-gradient(135deg, #c5a55a22, #c5a55a44)' : 'linear-gradient(135deg, #1a3a5c22, #1a3a5c44)' }}
              >
                <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 70% 50%, ${color}, transparent)` }} />
              </div>

              <div className="px-5 pb-5 -mt-12">
                {/* Avatar */}
                <div className="flex items-end justify-between mb-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white"
                    style={{ backgroundColor: color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <Badge
                    label={statusLabels[agent.status] ?? agent.status}
                    colorClass={statusColors[agent.status] ?? ''}
                    icon={
                      agent.status === 'working' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse-soft" />
                      ) : null
                    }
                  />
                </div>

                <h3 className="font-bold text-navy-800 text-lg font-display">{agent.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{agent.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-slate-50 rounded-xl py-2">
                    <p className="text-xs text-slate-400">المهام</p>
                    <p className="font-bold text-navy-700">{agentTaskCount}</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl py-2">
                    <p className="text-xs text-slate-400">منجزة</p>
                    <p className="font-bold text-navy-700">{agent.tasks_completed}</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl py-2">
                    <p className="text-xs text-slate-400">الأداء</p>
                    <p className="font-bold text-gold-700">{agent.performance_score}%</p>
                  </div>
                </div>

                {/* Performance bar */}
                <div className="mb-4">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${agent.performance_score}%`, backgroundColor: color }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={agent.status === 'working' ? 'secondary' : 'gold'}
                    size="sm"
                    onClick={() => toggleAgentStatus(agent)}
                    className="flex-1"
                  >
                    {agent.status === 'working' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {agent.status === 'working' ? 'إيقاف' : 'تشغيل'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedAgent(agent)}>
                    <Settings className="w-4 h-4" />
                    تفاصيل
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedAgent(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideIn">
            <div className="h-20" style={{ background: selectedAgent.avatar_color === '#c5a55a' ? 'linear-gradient(135deg, #c5a55a22, #c5a55a66)' : 'linear-gradient(135deg, #1a3a5c22, #1a3a5c66)' }} />
            <div className="px-6 pb-6 -mt-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white mb-3" style={{ backgroundColor: selectedAgent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }}>
                {selectedAgent.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-navy-800 font-display">{selectedAgent.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{selectedAgent.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox icon={Activity} label="الأداء" value={`${selectedAgent.performance_score}%`} color="text-gold-700" />
                <StatBox icon={CheckCircle2} label="مهام منجزة" value={selectedAgent.tasks_completed.toString()} color="text-navy-600" />
                <StatBox icon={Zap} label="مهام نشطة" value={agentTasks.filter((t) => t.status !== 'completed').length.toString()} color="text-gold-700" />
                <StatBox icon={Cpu} label="الحالة" value={statusLabels[selectedAgent.status] ?? selectedAgent.status} color="text-navy-600" />
              </div>

              <h4 className="font-bold text-navy-700 text-sm mb-2">المهام المرتبطة</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {agentTasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">لا توجد مهام</p>}
                {agentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-navy-500' : 'bg-gold-400'}`} />
                    <span className="text-sm text-navy-600 flex-1 truncate">{task.title}</span>
                    <Badge label={statusLabels[task.status] ?? task.status} colorClass={statusColors[task.status] ?? ''} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant={selectedAgent.status === 'working' ? 'secondary' : 'gold'} size="sm" className="flex-1" onClick={() => toggleAgentStatus(selectedAgent)}>
                  {selectedAgent.status === 'working' ? <><Pause className="w-4 h-4" /> إيقاف</> : <><Play className="w-4 h-4" /> تشغيل</>}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>إغلاق</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
