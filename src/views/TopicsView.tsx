import { useEffect, useState } from 'react';
import { Plus, Lightbulb, Trash2, Edit3, Sparkles, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Spinner, EmptyState } from '@/components/ui';
import { fetchTopics, fetchAgents, createTopic, updateTopic, deleteTopic } from '@/lib/api';
import { statusLabels, statusColors } from '@/lib/utils';
import type { Topic, Agent } from '@/types';

export function TopicsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);

  const [form, setForm] = useState({ title: '', description: '', category: 'استراتيجي', status: 'idea', inspiration: '', priority: '5' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const [t, a] = await Promise.all([fetchTopics(), fetchAgents()]); setTopics(t); setAgents(a); }
    catch (err) { console.error('Topics load error:', err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', category: 'استراتيجي', status: 'idea', inspiration: '', priority: '5' });
    setShowModal(true);
  }

  function openEdit(topic: Topic) {
    setEditing(topic);
    setForm({ title: topic.title, description: topic.description ?? '', category: topic.category, status: topic.status, inspiration: topic.inspiration ?? '', priority: topic.priority.toString() });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const data = { title: form.title, description: form.description || null, category: form.category, status: form.status, inspiration: form.inspiration || null, priority: parseInt(form.priority) || 5 };
    try {
      if (editing) { await updateTopic(editing.id, data); } else { await createTopic(data); }
      setShowModal(false); await loadData();
    } catch (err) { console.error('Save topic error:', err); }
  }

  async function handleDelete(id: string) {
    try { await deleteTopic(id); setTopics(topics.filter((t) => t.id !== id)); }
    catch (err) { console.error('Delete topic error:', err); }
  }

  async function changeStatus(topic: Topic, direction: 'up' | 'down') {
    const flow = ['idea', 'approved', 'in_progress', 'completed'];
    const idx = flow.indexOf(topic.status);
    const newIdx = direction === 'up' ? Math.min(idx + 1, flow.length - 1) : Math.max(idx - 1, 0);
    if (newIdx === idx) return;
    try { await updateTopic(topic.id, { status: flow[newIdx] }); setTopics(topics.map((t) => (t.id === topic.id ? { ...t, status: flow[newIdx] } : t))); }
    catch (err) { console.error('Update topic status error:', err); }
  }

  if (loading) { return (<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>); }

  const categoryColors: Record<string, string> = {
    'استراتيجي': 'bg-navy-100 text-navy-700',
    'قيادة': 'bg-gold-50 text-gold-700 border border-gold-200',
    'تأملات': 'bg-navy-50 text-navy-600',
    'نصائح': 'bg-navy-50 text-navy-600',
    'أخلاق': 'bg-gold-50 text-gold-700',
    'تربية': 'bg-navy-50 text-navy-600',
    'اجتماعي': 'bg-navy-50 text-navy-600',
    'general': 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-800 font-display flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-gold-500" /> ابتكار المواضيع
          </h2>
          <p className="text-sm text-slate-400 mt-1">توليد الأفكار الاستراتيجية نحو التغيير</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> موضوع جديد</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'أفكار', count: topics.filter((t) => t.status === 'idea').length, color: 'bg-gold-50 text-gold-700' },
          { label: 'معتمد', count: topics.filter((t) => t.status === 'approved').length, color: 'bg-navy-700 text-white' },
          { label: 'قيد التنفيذ', count: topics.filter((t) => t.status === 'in_progress').length, color: 'bg-navy-100 text-navy-700' },
          { label: 'مكتمل', count: topics.filter((t) => t.status === 'completed').length, color: 'bg-navy-50 text-navy-600' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} mb-2`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-navy-800 font-display">{stat.count}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {topics.length === 0 ? (
        <EmptyState icon={<Lightbulb className="w-16 h-16" />} title="لا توجد مواضيع" description="ابدأ بابتكار أول موضوع"
          action={<Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> إنشاء موضوع</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-md">
                    <Lightbulb className="w-5 h-5 text-gold-400" />
                  </div>
                  <Badge label={topic.category} colorClass={categoryColors[topic.category] ?? 'bg-slate-100 text-slate-600'} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeStatus(topic, 'up')} className="p-1 rounded-lg hover:bg-gold-50 text-slate-300 hover:text-gold-700 transition-colors opacity-0 group-hover:opacity-100"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => changeStatus(topic, 'down')} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-bold text-navy-800 font-display mb-1">{topic.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">{topic.description ?? 'لا يوجد وصف'}</p>
              {topic.inspiration && (
                <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" /><span className="truncate">{topic.inspiration}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge label={statusLabels[topic.status] ?? topic.status} colorClass={statusColors[topic.status] ?? ''} />
                  <div className="flex items-center gap-1 text-xs text-slate-400"><TrendingUp className="w-3.5 h-3.5" /> أولوية {topic.priority}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(topic)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(topic.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل الموضوع' : 'موضوع جديد'} size="md">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="عنوان الموضوع" />
          <Input label="الوصف" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="وصف الموضوع" type="textarea" rows={3} />
          <Input label="مصدر الإلهام" value={form.inspiration} onChange={(v) => setForm({ ...form, inspiration: v })} placeholder="ما الذي ألهم هذا الموضوع؟" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="التصنيف" value={form.category} onChange={(v) => setForm({ ...form, category: v })} type="select" options={[
              { value: 'استراتيجي', label: 'استراتيجي' }, { value: 'قيادة', label: 'قيادة' }, { value: 'تأملات', label: 'تأملات' }, { value: 'نصائح', label: 'نصائح' }, { value: 'أخلاق', label: 'أخلاق' }, { value: 'تربية', label: 'تربية' },
            ]} />
            <Input label="الحالة" value={form.status} onChange={(v) => setForm({ ...form, status: v })} type="select" options={[
              { value: 'idea', label: 'فكرة' }, { value: 'approved', label: 'معتمد' }, { value: 'in_progress', label: 'قيد التنفيذ' }, { value: 'completed', label: 'مكتمل' },
            ]} />
            <Input label="الأولوية (1-10)" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} type="number" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button variant="gold" onClick={handleSave}>{editing ? 'حفظ التغييرات' : 'إنشاء'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
