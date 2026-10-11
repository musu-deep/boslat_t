import { useEffect, useRef, useState } from 'react';
import { Search, Bell, Plus, RefreshCw, ChevronDown, Database, Pause, Play, X, UserRound, CheckCircle2, Clock3, AlertCircle, ListChecks } from 'lucide-react';
import { fetchTasks, fetchContent, fetchAgents, fetchTopics } from '@/lib/api';
import { fetchSignals } from '@/lib/monitor';
import { isDemoMode } from '@/lib/supabase';
import type { Task, Content, Agent, Topic } from '@/types';
import type { MonitorSignal } from '@/types/monitor';
import type { ViewKey } from './Sidebar';

interface Props { title: string; view: ViewKey; onNavigate: (view: ViewKey, taskId?: string) => void; onAssign: () => void }
interface Notice { id: string; label: string; view: ViewKey; taskId?: string }
const empty = { tasks: [] as Task[], content: [] as Content[], agents: [] as Agent[], topics: [] as Topic[], signals: [] as MonitorSignal[] };
export function PlatformHeader({ title, view, onNavigate, onAssign }: Props) {
  const [data, setData] = useState(empty);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<'search' | 'alerts' | 'profile' | 'connection' | null>(null);
  const [connection, setConnection] = useState<'checking' | 'connected' | 'unlinked' | 'error'>(isDemoMode ? 'unlinked' : 'checking');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [updated, setUpdated] = useState<Date | null>(null);
  const [paused, setPaused] = useState(() => localStorage.getItem('alboslah.header.paused') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false), [index, setIndex] = useState(0);
  const root = useRef<HTMLElement>(null), loading = useRef(false);
  async function refresh() {
    if (loading.current) return;
    loading.current = true; setBusy(true);
    try {
      const result = await Promise.allSettled([fetchTasks(), fetchContent(), fetchAgents(), fetchTopics(), fetchSignals()]);
      const complete = result.slice(0, 4).every(r => r.status === 'fulfilled');
      setData(previous => ({
        tasks: result[0].status === 'fulfilled' ? result[0].value : previous.tasks,
        content: result[1].status === 'fulfilled' ? result[1].value : previous.content,
        agents: result[2].status === 'fulfilled' ? result[2].value : previous.agents,
        topics: result[3].status === 'fulfilled' ? result[3].value : previous.topics,
        signals: result[4].status === 'fulfilled' ? result[4].value : previous.signals,
      }));
      setConnection(isDemoMode ? 'unlinked' : complete ? 'connected' : 'error');
      setError(complete ? '' : 'تعذر تحديث بعض المؤشرات؛ آخر بيانات متاحة ما زالت ظاهرة.');
      if (complete) setUpdated(new Date());
    } finally { loading.current = false; setBusy(false); }
  }
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    let delayed: ReturnType<typeof setTimeout>;
    const update = () => { clearTimeout(delayed); delayed = setTimeout(() => void refresh(), 150); };
    window.addEventListener('alboslah:data-changed', update); window.addEventListener('storage', update); window.addEventListener('focus', update);
    return () => { clearInterval(timer); clearTimeout(delayed); window.removeEventListener('alboslah:data-changed', update); window.removeEventListener('storage', update); window.removeEventListener('focus', update); };
  }, [view]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setPanel(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setPanel(null); setQuery(''); } };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  const ongoing = data.tasks.filter(t => t.status === 'in_progress');
  const overdue = data.tasks.filter(t => !['completed', 'cancelled'].includes(t.status) && t.due_date && new Date(t.due_date).getTime() < Date.now());
  const reviews = data.content.filter(c => c.status === 'review');
  const assigned = new Set(ongoing.map(t => t.agent_id).filter(Boolean)).size;
  const completed = data.tasks.filter(t => t.status === 'completed').length;
  const eligible = data.tasks.filter(t => t.status !== 'cancelled').length;
  const rate = eligible ? Math.round(completed / eligible * 100) : null;
  const notices: Notice[] = [
    ...reviews.map(c => ({ id: 'review:' + c.id, label: 'مخرج جاهز للمراجعة: ' + c.title, view: 'content' as ViewKey, taskId: data.tasks.find(t => t.content_id === c.id)?.id })),
    ...overdue.map(t => ({ id: 'due:' + t.id, label: 'تجاوز موعد التسليم: ' + t.title, view: 'content' as ViewKey, taskId: t.id })),
    ...data.signals.filter(s => s.status === 'new').map(s => ({ id: 'signal:' + s.id, label: 'إشارة تحتاج مراجعة: ' + s.excerpt.slice(0, 80), view: 'social' as ViewKey })),
    ...data.topics.filter(t => t.status === 'approved').map(t => ({ id: 'topic:' + t.id, label: 'مقترح معتمد بانتظار التكليف: ' + t.title, view: 'topics' as ViewKey })),
  ];
  const current = notices[index % Math.max(1, notices.length)];
  useEffect(() => { if (paused || hovered || notices.length < 2) return; const timer = window.setInterval(() => setIndex(i => i + 1), 6000); return () => clearInterval(timer); }, [paused, hovered, notices.length]);
  function go(target: ViewKey, taskId?: string) { setPanel(null); setQuery(''); onNavigate(target, taskId); }
  const needle = query.trim().toLocaleLowerCase('ar');
  const results = needle ? [
    ...data.tasks.filter(t => (t.title + ' ' + (t.description ?? '')).toLocaleLowerCase('ar').includes(needle)).map(t => ({ id: 'task:' + t.id, label: t.title, kind: 'مهمة', view: 'content' as ViewKey, taskId: t.id })),
    ...data.content.filter(c => (c.title + ' ' + (c.body ?? '')).toLocaleLowerCase('ar').includes(needle)).map(c => ({ id: 'output:' + c.id, label: c.title, kind: 'مخرج', view: 'content' as ViewKey, taskId: data.tasks.find(t => t.content_id === c.id)?.id })),
    ...data.topics.filter(t => t.title.toLocaleLowerCase('ar').includes(needle)).map(t => ({ id: 'topic:' + t.id, label: t.title, kind: 'مقترح', view: 'topics' as ViewKey, taskId: undefined })),
    ...data.agents.filter(a => (a.name + ' ' + a.role).toLocaleLowerCase('ar').includes(needle)).map(a => ({ id: 'agent:' + a.id, label: a.name, kind: 'وكيل', view: 'agents' as ViewKey, taskId: undefined })),
    ...data.signals.filter(s => (s.excerpt + ' ' + s.source_note).toLocaleLowerCase('ar').includes(needle)).map(s => ({ id: 'signal:' + s.id, label: s.excerpt.slice(0, 80), kind: 'إشارة', view: 'social' as ViewKey, taskId: undefined })),
  ].slice(0, 12) : [];
  const connectionLabels = { checking: 'جارٍ التحقق', connected: 'متصل', unlinked: 'غير مربوط', error: 'تعذّر الاتصال' };
  const toggle = (value: typeof panel) => setPanel(panel === value ? null : value);
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-navy-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500';
  return <header ref={root} className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <div><h1 className="text-lg font-bold text-navy-800 font-display">{title}</h1><p className="text-xs text-slate-400 mt-1">منصة البوصلة | إضاءات استراتيجية نحو التغيير</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <label className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400"/><input aria-label="البحث في المنصة" placeholder="ابحث في المنصة…" className="bg-transparent outline-none text-sm w-40 lg:w-48 text-navy-800" value={query} onFocus={() => setPanel('search')} onChange={e => { setQuery(e.target.value); setPanel('search'); }}/></label>
          {panel === 'search' && <div className="absolute left-0 top-full mt-2 w-80 max-w-[85vw] bg-white rounded-2xl border border-slate-200 shadow-xl p-2 max-h-80 overflow-auto" role="region" aria-label="نتائج البحث">{!needle ? <p className="p-3 text-sm text-slate-500">ابحث عن مهمة أو مخرج أو مقترح أو وكيل أو إشارة.</p> : !results.length ? <p className="p-3 text-sm text-slate-500">لا توجد نتائج مطابقة.</p> : results.map(r => <button key={r.id} onClick={() => go(r.view, r.taskId)} className="w-full text-right p-3 rounded-xl hover:bg-slate-50"><span className="text-xs text-gold-700 block">{r.kind}</span><span className="text-sm text-navy-800">{r.label}</span></button>)}</div>}
        </div>
        <button className={button + ' bg-navy-800 text-white hover:bg-navy-700 border-navy-800'} onClick={() => { setPanel(null); onAssign(); }}><Plus size={16}/>تكليف وكيل</button>
        <button className={button} aria-label="تحديث المؤشرات" title="تحديث المؤشرات" onClick={() => void refresh()} disabled={busy}><RefreshCw size={16} className={busy ? 'animate-spin' : ''}/></button>
        <div className="relative"><button className={button + ' relative'} aria-label={'التنبيهات: ' + notices.length} aria-expanded={panel === 'alerts'} onClick={() => toggle('alerts')}><Bell size={17}/>{notices.length > 0 && <span className="absolute -top-2 -left-1 rounded-full bg-gold-500 text-navy-900 min-w-5 px-1 text-xs font-bold">{notices.length}</span>}</button>
          {panel === 'alerts' && <div className="absolute left-0 top-full mt-2 w-80 max-w-[85vw] rounded-2xl border border-slate-200 bg-white shadow-xl p-3 max-h-96 overflow-auto"><h2 className="font-bold text-navy-800 mb-2">ما يحتاج مراجعتك</h2>{!notices.length ? <p className="text-sm text-slate-500 p-3">لا توجد عناصر تستدعي المراجعة الآن.</p> : notices.map(n => <button className="w-full text-right p-3 border-b border-slate-100 text-sm text-navy-700 hover:bg-slate-50" key={n.id} onClick={() => go(n.view, n.taskId)}>{n.label}</button>)}</div>}
        </div>
        <div className="relative"><button className={button} aria-expanded={panel === 'profile'} onClick={() => toggle('profile')}><span className="w-8 h-8 rounded-full bg-navy-800 text-gold-300 flex items-center justify-center"><UserRound size={17}/></span><span className="hidden lg:block">د. علي العتيبي</span><ChevronDown size={14}/></button>
          {panel === 'profile' && <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl p-5 text-sm"><h2 className="font-bold text-navy-800">د. علي العتيبي</h2><p className="text-slate-500 mt-1">مستشار وخبير في الفكر الاستراتيجي</p><p className="text-xs text-slate-400 mt-3">ملف المنصة المعروض؛ تسجيل الدخول والصلاحيات لم يُربطا بعد.</p><label className="flex gap-2 items-center mt-4 text-navy-700"><input type="checkbox" checked={paused} onChange={e => { setPaused(e.target.checked); localStorage.setItem('alboslah.header.paused', String(e.target.checked)); }}/>إيقاف حركة شريط المتابعة</label><button className={button + ' mt-4 w-full'} onClick={() => go('analytics')}>الأداء والتقارير</button></div>}
        </div>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
      {[{label:'مهام جارية', value:ongoing.length, icon:Clock3}, {label:'بانتظار الاعتماد', value:reviews.length, icon:ListChecks}, {label:'متأخرة', value:overdue.length, icon:AlertCircle}, {label:'وكلاء مكلّفون بمهام جارية', value:assigned, icon:UserRound}, {label:'إنجاز المهام', value:rate === null ? '—' : rate + '٪', icon:CheckCircle2}].map((m,i) => <button key={m.label} onClick={() => go(i === 3 ? 'agents' : i === 4 ? 'analytics' : 'content')} className="inline-flex items-center gap-2 hover:text-navy-800"><m.icon size={14} className={i === 2 && overdue.length ? 'text-red-500' : 'text-gold-600'}/><span>{m.label}</span><strong className="text-navy-800">{updated ? m.value : '—'}</strong></button>)}
      <div className="relative mr-auto"><button className="inline-flex items-center gap-2 hover:text-navy-800" aria-expanded={panel === 'connection'} onClick={() => toggle('connection')}><Database size={14}/><span>قاعدة بيانات البوصلة</span><span className={'w-2 h-2 rounded-full ' + (connection === 'connected' ? 'bg-emerald-500' : connection === 'error' ? 'bg-red-500' : 'bg-amber-400')}/><strong>{connectionLabels[connection]}</strong></button>
        {panel === 'connection' && <div className="absolute left-0 top-full mt-3 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 text-sm"><h2 className="font-bold text-navy-800">حالة مصدر البيانات</h2><p className="mt-2 leading-relaxed">{isDemoMode ? 'قاعدة البيانات الخارجية غير مربوطة. المؤشرات تُقرأ من البيانات المحفوظة في هذا المتصفح.' : connection === 'connected' ? 'نجحت قراءة بيانات المهام والمخرجات والوكلاء والمقترحات من قاعدة البيانات.' : 'لم تنجح قراءة جميع بيانات المنصة. أعد التحقق من الاتصال.'}</p><p className="text-xs text-slate-400 mt-3">آخر تحديث ناجح: {updated?.toLocaleTimeString('ar-SA') ?? 'لم يتم بعد'}</p><button className={button + ' mt-3'} onClick={() => void refresh()} disabled={busy}>إعادة التحقق</button></div>}
      </div>
    </div>
    <div className="flex items-center gap-3 px-6 py-2 border-t border-slate-100 text-xs" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false); }}>
      <span className="shrink-0 text-gold-700 font-bold">متابعة المنصة</span>
      {current ? <button key={current.id} className={'truncate text-right flex-1 text-navy-700 hover:text-gold-700 ' + (paused ? '' : 'motion-safe:animate-fadeIn')} onClick={() => go(current.view, current.taskId)}>{current.label}</button> : <span className="flex-1 text-slate-400">{updated ? 'لا توجد عناصر بانتظار المراجعة.' : 'جارٍ تحميل المؤشرات…'}</span>}
      <button className="p-1 text-slate-400 hover:text-navy-800" aria-label={paused ? 'تشغيل شريط المتابعة' : 'إيقاف شريط المتابعة'} aria-pressed={paused} onClick={() => { setPaused(!paused); localStorage.setItem('alboslah.header.paused', String(!paused)); }}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button>
      <span className="hidden xl:inline text-slate-400">{updated ? updated.toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'}) : '—'}</span>
    </div>
    {error && <p role="alert" className="px-6 pb-2 text-xs text-red-600">{error}<button aria-label="إغلاق رسالة الخطأ" onClick={() => setError('')} className="mr-2"><X size={12}/></button></p>}
  </header>;
}
