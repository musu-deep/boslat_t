import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3, FileText, Eye, Filter } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Spinner, EmptyState } from '@/components/ui';
import { fetchContent, fetchAgents, createContent, updateContent, deleteContent } from '@/lib/api';
import { statusLabels, statusColors, formatDate } from '@/lib/utils';
import type { Content, Agent } from '@/types';

export function ContentView() {
  const [content, setContent] = useState<Content[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Content | null>(null);
  const [viewing, setViewing] = useState<Content | null>(null);

  const [form, setForm] = useState({
    title: '', body: '', type: 'article', status: 'draft', platform: 'twitter', tags: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [c, a] = await Promise.all([fetchContent(), fetchAgents()]);
      setContent(c); setAgents(a);
    } catch (err) { console.error('Content load error:', err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', body: '', type: 'article', status: 'draft', platform: 'twitter', tags: '' });
    setShowModal(true);
  }

  function openEdit(item: Content) {
    setEditing(item);
    setForm({ title: item.title, body: item.body ?? '', type: item.type, status: item.status, platform: item.platform ?? 'twitter', tags: (item.tags ?? []).join(', ') });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const data = { title: form.title, body: form.body, type: form.type, status: form.status, platform: form.platform, tags };
    try {
      if (editing) { await updateContent(editing.id, data); } else { await createContent(data); }
      setShowModal(false); await loadData();
    } catch (err) { console.error('Save content error:', err); }
  }

  async function handleDelete(id: string) {
    try { await deleteContent(id); setContent(content.filter((c) => c.id !== id)); }
    catch (err) { console.error('Delete content error:', err); }
  }

  const filtered = content.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (loading) {
    return (<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-800 font-display">إدارة المحتوى</h2>
          <p className="text-sm text-slate-400 mt-1">إضاءات استراتيجية - مقالات ومنشورات</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> محتوى جديد</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المحتوى..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-gold-400 outline-none text-sm bg-white">
            <option value="all">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="review">قيد المراجعة</option>
            <option value="scheduled">مجدول</option>
            <option value="published">منشور</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-16 h-16" />} title="لا يوجد محتوى" description="ابدأ بإنشاء أول قطعة محتوى"
          action={<Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> إنشاء محتوى</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const agent = item.author_agent_id ? agentMap.get(item.author_agent_id) : null;
            return (
              <Card key={item.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-800 font-display mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{item.body ?? 'لا يوجد محتوى'}</p>
                  </div>
                  <Badge label={statusLabels[item.status] ?? item.status} colorClass={statusColors[item.status] ?? ''} />
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge label={item.type === 'article' ? 'مقال' : item.type === 'post' ? 'منشور' : item.type} colorClass="bg-navy-50 text-navy-600" />
                  {item.platform && <Badge label={item.platform} colorClass="bg-navy-50 text-navy-600" />}
                  {item.tags && item.tags.length > 0 && item.tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} label={`#${tag}`} colorClass="bg-gold-50 text-gold-700" />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {agent && (
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: agent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }}>
                          {agent.name.charAt(0)}
                        </span>
                        {agent.name}
                      </span>
                    )}
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewing(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل المحتوى' : 'محتوى جديد'} size="lg">
        <div className="space-y-4">
          <Input label="العنوان" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="عنوان المحتوى" />
          <Input label="المحتوى" value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="نص المحتوى" type="textarea" rows={6} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="النوع" value={form.type} onChange={(v) => setForm({ ...form, type: v })} type="select" options={[
              { value: 'article', label: 'مقال' }, { value: 'post', label: 'منشور' }, { value: 'social_post', label: 'منشور سوشال' },
            ]} />
            <Input label="الحالة" value={form.status} onChange={(v) => setForm({ ...form, status: v })} type="select" options={[
              { value: 'draft', label: 'مسودة' }, { value: 'review', label: 'قيد المراجعة' }, { value: 'scheduled', label: 'مجدول' }, { value: 'published', label: 'منشور' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="المنصة" value={form.platform} onChange={(v) => setForm({ ...form, platform: v })} type="select" options={[
              { value: 'twitter', label: 'تويتر' }, { value: 'instagram', label: 'إنستغرام' }, { value: 'facebook', label: 'فيسبوك' }, { value: 'telegram', label: 'تيليغرام' }, { value: 'whatsapp', label: 'واتساب' },
            ]} />
            <Input label="الوسوم (افصل بفاصلة)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="تأملات، نصائح" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button variant="gold" onClick={handleSave}>{editing ? 'حفظ التغييرات' : 'إنشاء'}</Button>
          </div>
        </div>
      </Modal>

      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing.title} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label={statusLabels[viewing.status] ?? viewing.status} colorClass={statusColors[viewing.status] ?? ''} />
              <Badge label={viewing.type} colorClass="bg-navy-50 text-navy-600" />
              {viewing.platform && <Badge label={viewing.platform} colorClass="bg-navy-50 text-navy-600" />}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto scrollbar-thin">
              <p className="text-sm text-navy-700 whitespace-pre-wrap leading-relaxed">{viewing.body ?? 'لا يوجد محتوى'}</p>
            </div>
            {viewing.tags && viewing.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {viewing.tags.map((tag, i) => (<Badge key={i} label={`#${tag}`} colorClass="bg-gold-50 text-gold-700" />))}
              </div>
            )}
            <div className="flex justify-end"><Button variant="ghost" onClick={() => setViewing(null)}>إغلاق</Button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
