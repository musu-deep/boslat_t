import { useEffect, useState } from 'react';
import { Plus, CalendarHeart, Trash2, Edit3, Eye, BookOpen, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Spinner, EmptyState } from '@/components/ui';
import { fetchFridayPosts, fetchAgents, fetchTemplates, createFridayPost, updateFridayPost, deleteFridayPost } from '@/lib/api';
import { statusLabels, statusColors, formatDate } from '@/lib/utils';
import type { FridayPost, Agent, Template } from '@/types';

export function FridayView() {
  const [posts, setPosts] = useState<FridayPost[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState<FridayPost | null>(null);
  const [editing, setEditing] = useState<FridayPost | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    title: '', main_topic: '', verse: '', hadith: '', wisdom: '', content: '', status: 'draft', scheduled_date: '', agent_id: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [f, a, t] = await Promise.all([fetchFridayPosts(), fetchAgents(), fetchTemplates()]);
      setPosts(f); setAgents(a); setTemplates(t);
    } catch (err) { console.error('Friday posts load error:', err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', main_topic: '', verse: '', hadith: '', wisdom: '', content: '', status: 'draft', scheduled_date: '', agent_id: agents[0]?.id ?? '' });
    setShowModal(true);
  }

  function openEdit(post: FridayPost) {
    setEditing(post);
    setForm({ title: post.title, main_topic: post.main_topic ?? '', verse: post.verse ?? '', hadith: post.hadith ?? '', wisdom: post.wisdom ?? '', content: post.content ?? '', status: post.status, scheduled_date: post.scheduled_date ?? '', agent_id: post.agent_id ?? '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const data = { title: form.title, main_topic: form.main_topic || null, verse: form.verse || null, hadith: form.hadith || null, wisdom: form.wisdom || null, content: form.content || null, status: form.status, scheduled_date: form.scheduled_date || null, agent_id: form.agent_id || null };
    try {
      if (editing) { await updateFridayPost(editing.id, data); } else { await createFridayPost(data); }
      setShowModal(false); await loadData();
    } catch (err) { console.error('Save friday post error:', err); }
  }

  async function handleDelete(id: string) {
    try { await deleteFridayPost(id); setPosts(posts.filter((p) => p.id !== id)); }
    catch (err) { console.error('Delete friday post error:', err); }
  }

  function copyToClipboard(post: FridayPost) {
    const text = [post.title, '', post.content ?? '', '', post.verse ? `الآية: ${post.verse}` : '', post.hadith ? `الحديث: ${post.hadith}` : '', post.wisdom ? `حكمة: ${post.wisdom}` : ''].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (loading) { return (<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>); }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-800 font-display flex items-center gap-2">
            <CalendarHeart className="w-7 h-7 text-gold-500" /> غروب الجمعة
          </h2>
          <p className="text-sm text-slate-400 mt-1">تجهيز ومراجعة إصدارات غروب الجمعة بنسق موحد</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> إصدار جديد</Button>
      </div>

      {templates.length > 0 && (
        <Card className="p-4 bg-gradient-to-l from-gold-50 to-navy-50/30 border-gold-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-navy-700">{templates[0].name}</p>
              <p className="text-xs text-slate-400">{templates[0].description}</p>
            </div>
            <Badge label="نشط" colorClass="bg-navy-700 text-white" />
          </div>
        </Card>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={<CalendarHeart className="w-16 h-16" />} title="لا توجد بوستات جمعة" description="ابدأ بتجهيز أول بوست جمعة"
          action={<Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> إنشاء بوست</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {posts.map((post) => {
            const agent = post.agent_id ? agentMap.get(post.agent_id) : null;
            return (
              <Card key={post.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                      <CalendarHeart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-800 font-display">{post.title}</h3>
                      {post.main_topic && <p className="text-xs text-slate-400">{post.main_topic}</p>}
                    </div>
                  </div>
                  <Badge label={statusLabels[post.status] ?? post.status} colorClass={statusColors[post.status] ?? ''} />
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-3 max-h-32 overflow-hidden">
                  <p className="text-sm text-navy-600 line-clamp-3">{post.content ?? 'لا يوجد محتوى'}</p>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {post.verse && <Badge label="آية" colorClass="bg-navy-50 text-navy-600" icon={<BookOpen className="w-3 h-3" />} />}
                  {post.hadith && <Badge label="حديث" colorClass="bg-navy-50 text-navy-600" icon={<BookOpen className="w-3 h-3" />} />}
                  {post.wisdom && <Badge label="حكمة" colorClass="bg-gold-50 text-gold-700" icon={<Sparkles className="w-3 h-3" />} />}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {agent && (
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: agent.avatar_color === '#c5a55a' ? '#c5a55a' : '#1a3a5c' }}>
                          {agent.name.charAt(0)}
                        </span>
                        {agent.name}
                      </span>
                    )}
                    {post.scheduled_date && <span>• {formatDate(post.scheduled_date)}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewing(post)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => copyToClipboard(post)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-gold-700 transition-colors">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-gold-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل غروب الجمعة' : 'إصدار جديد لغروب الجمعة'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="العنوان" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="عنوان غروب الجمعة" />
            <Input label="الموضوع الرئيسي" value={form.main_topic} onChange={(v) => setForm({ ...form, main_topic: v })} placeholder="موضوع البوست" />
          </div>
          <Input label="المحتوى (الافتتاحية والموعظة)" value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="اكتب محتوى البوست..." type="textarea" rows={5} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="الآية الكريمة" value={form.verse} onChange={(v) => setForm({ ...form, verse: v })} placeholder="الآية وتفسيرها" type="textarea" rows={2} />
            <Input label="الحديث الشريف" value={form.hadith} onChange={(v) => setForm({ ...form, hadith: v })} placeholder="الحديث ودرجته" type="textarea" rows={2} />
          </div>
          <Input label="حكمة" value={form.wisdom} onChange={(v) => setForm({ ...form, wisdom: v })} placeholder="حكمة مقتبسة" type="textarea" rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="الحالة" value={form.status} onChange={(v) => setForm({ ...form, status: v })} type="select" options={[
              { value: 'draft', label: 'مسودة' }, { value: 'review', label: 'قيد المراجعة' }, { value: 'scheduled', label: 'مجدول' }, { value: 'published', label: 'منشور' },
            ]} />
            <Input label="تاريخ النشر" value={form.scheduled_date} onChange={(v) => setForm({ ...form, scheduled_date: v })} type="date" />
            <Input label="الوكيل المسؤول" value={form.agent_id} onChange={(v) => setForm({ ...form, agent_id: v })} type="select" options={[
              { value: '', label: 'بدون' }, ...agents.map((a) => ({ value: a.id, label: a.name })),
            ]} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button variant="gold" onClick={handleSave}>{editing ? 'حفظ التغييرات' : 'إنشاء البوست'}</Button>
          </div>
        </div>
      </Modal>

      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing.title} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge label={statusLabels[viewing.status] ?? viewing.status} colorClass={statusColors[viewing.status] ?? ''} />
              {viewing.main_topic && <Badge label={viewing.main_topic} colorClass="bg-gold-50 text-gold-700" />}
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-navy-700 whitespace-pre-wrap leading-relaxed">{viewing.content ?? 'لا يوجد محتوى'}</p>
            </div>
            {viewing.verse && (
              <div className="bg-navy-50 rounded-xl p-4 border-r-4 border-navy-400">
                <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-navy-600" /><span className="text-sm font-bold text-navy-700">الآية الكريمة</span></div>
                <p className="text-sm text-navy-700 whitespace-pre-wrap">{viewing.verse}</p>
              </div>
            )}
            {viewing.hadith && (
              <div className="bg-navy-50 rounded-xl p-4 border-r-4 border-navy-400">
                <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-navy-600" /><span className="text-sm font-bold text-navy-700">الحديث الشريف</span></div>
                <p className="text-sm text-navy-700 whitespace-pre-wrap">{viewing.hadith}</p>
              </div>
            )}
            {viewing.wisdom && (
              <div className="bg-gold-50 rounded-xl p-4 border-r-4 border-gold-400">
                <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4 text-gold-600" /><span className="text-sm font-bold text-gold-700">حكمة</span></div>
                <p className="text-sm text-navy-700 whitespace-pre-wrap">{viewing.wisdom}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => copyToClipboard(viewing)}><Copy className="w-4 h-4" /> نسخ</Button>
              <Button variant="ghost" onClick={() => setViewing(null)}>إغلاق</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
