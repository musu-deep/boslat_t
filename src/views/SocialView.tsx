import { useEffect, useState } from 'react';
import { Plus, Share2, Trash2, Edit3, Heart, MessageCircle, Repeat2, Calendar, Send } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Spinner, EmptyState } from '@/components/ui';
import { fetchSocialPosts, fetchAgents, createSocialPost, updateSocialPost, deleteSocialPost } from '@/lib/api';
import { statusLabels, statusColors, platformLabels, platformColors, formatDateTime } from '@/lib/utils';
import type { SocialPost, Agent } from '@/types';

export function SocialView() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [filterPlatform, setFilterPlatform] = useState('all');

  const [form, setForm] = useState({ platform: 'twitter', content: '', status: 'draft', scheduled_at: '', agent_id: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const [s, a] = await Promise.all([fetchSocialPosts(), fetchAgents()]); setPosts(s); setAgents(a); }
    catch (err) { console.error('Social posts load error:', err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ platform: 'twitter', content: '', status: 'draft', scheduled_at: '', agent_id: agents[0]?.id ?? '' });
    setShowModal(true);
  }

  function openEdit(post: SocialPost) {
    setEditing(post);
    setForm({ platform: post.platform, content: post.content ?? '', status: post.status, scheduled_at: post.scheduled_at ?? '', agent_id: post.agent_id ?? '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.content.trim()) return;
    const data = { platform: form.platform, content: form.content, status: form.status, scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null, agent_id: form.agent_id || null };
    try {
      if (editing) { await updateSocialPost(editing.id, data); } else { await createSocialPost(data); }
      setShowModal(false); await loadData();
    } catch (err) { console.error('Save social post error:', err); }
  }

  async function handleDelete(id: string) {
    try { await deleteSocialPost(id); setPosts(posts.filter((p) => p.id !== id)); }
    catch (err) { console.error('Delete social post error:', err); }
  }

  const filtered = filterPlatform === 'all' ? posts : posts.filter((p) => p.platform === filterPlatform);
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const platformStats = ['twitter', 'instagram', 'facebook', 'telegram', 'whatsapp'].map((p) => ({
    platform: p,
    count: posts.filter((post) => post.platform === p).length,
    engagement: posts.filter((post) => post.platform === p).reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0),
  }));

  if (loading) { return (<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>); }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-800 font-display flex items-center gap-2">
            <Share2 className="w-7 h-7 text-navy-500" /> سوشال مونتيور
          </h2>
          <p className="text-sm text-slate-400 mt-1">حضور رقمي ثابت وبسيط وعميق</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> منشور جديد</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {platformStats.map((stat) => (
          <Card key={stat.platform} className={`p-4 cursor-pointer transition-all ${filterPlatform === stat.platform ? 'ring-2 ring-gold-300' : ''}`} onClick={() => setFilterPlatform(filterPlatform === stat.platform ? 'all' : stat.platform)}>
            <Badge label={platformLabels[stat.platform] ?? stat.platform} colorClass={platformColors[stat.platform] ?? ''} />
            <p className="text-2xl font-bold text-navy-800 mt-2 font-display">{stat.count}</p>
            <p className="text-xs text-slate-400">{stat.engagement.toLocaleString('ar-SA')} تفاعل</p>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Share2 className="w-16 h-16" />} title="لا توجد منشورات" description="ابدأ بإنشاء أول منشور للسوشال ميديا"
          action={<Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4" /> إنشاء منشور</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => {
            const agent = post.agent_id ? agentMap.get(post.agent_id) : null;
            return (
              <Card key={post.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge label={platformLabels[post.platform] ?? post.platform} colorClass={platformColors[post.platform] ?? ''} />
                    <Badge label={statusLabels[post.status] ?? post.status} colorClass={statusColors[post.status] ?? ''} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                  <p className="text-sm text-navy-700 line-clamp-4 whitespace-pre-wrap">{post.content ?? 'لا يوجد محتوى'}</p>
                </div>
                {post.status === 'published' && (
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-500"><Heart className="w-3.5 h-3.5 text-gold-500" />{post.likes.toLocaleString('ar-SA')}</span>
                    <span className="flex items-center gap-1 text-slate-500"><MessageCircle className="w-3.5 h-3.5 text-navy-400" />{post.comments.toLocaleString('ar-SA')}</span>
                    <span className="flex items-center gap-1 text-slate-500"><Repeat2 className="w-3.5 h-3.5 text-navy-400" />{post.shares.toLocaleString('ar-SA')}</span>
                  </div>
                )}
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
                    {post.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateTime(post.scheduled_at)}</span>}
                  </div>
                  {post.status === 'scheduled' && <Button size="sm" variant="secondary"><Send className="w-3.5 h-3.5" /> نشر الآن</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل المنشور' : 'منشور جديد'} size="md">
        <div className="space-y-4">
          <Input label="المنصة" value={form.platform} onChange={(v) => setForm({ ...form, platform: v })} type="select" options={[
            { value: 'twitter', label: 'تويتر' }, { value: 'instagram', label: 'إنستغرام' }, { value: 'facebook', label: 'فيسبوك' }, { value: 'telegram', label: 'تيليغرام' }, { value: 'whatsapp', label: 'واتساب' }, { value: 'youtube', label: 'يوتيوب' },
          ]} />
          <Input label="المحتوى" value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="اكتب المنشور..." type="textarea" rows={5} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="الحالة" value={form.status} onChange={(v) => setForm({ ...form, status: v })} type="select" options={[
              { value: 'draft', label: 'مسودة' }, { value: 'scheduled', label: 'مجدول' }, { value: 'published', label: 'منشور' },
            ]} />
            <Input label="الوكيل المسؤول" value={form.agent_id} onChange={(v) => setForm({ ...form, agent_id: v })} type="select" options={[
              { value: '', label: 'بدون' }, ...agents.map((a) => ({ value: a.id, label: a.name })),
            ]} />
          </div>
          {form.status === 'scheduled' && <Input label="وقت النشر المجدول" value={form.scheduled_at} onChange={(v) => setForm({ ...form, scheduled_at: v })} type="date" />}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button variant="gold" onClick={handleSave}>{editing ? 'حفظ التغييرات' : 'إنشاء'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
