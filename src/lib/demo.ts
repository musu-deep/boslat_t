import type { Agent, Task, Content, FridayPost, Topic, SocialPost, Analytics, Template } from '@/types';
type Tables = { agents: Agent; tasks: Task; content: Content; friday_posts: FridayPost; topics: Topic; social_posts: SocialPost; analytics: Analytics; templates: Template };
type Database = { [K in keyof Tables]: Tables[K][] };
const storageKey = 'alboslah.demo.v1';
const created_at = '2026-10-11T09:00:00.000Z';
const agents: Agent[] = ['وكيل إعداد المحتوى','وكيل النشر','وكيل تحليل الأداء','وكيل إدارة التواصل الاجتماعي','وكيل تطوير الموضوعات'].map((name,i) => ({ id: `demo-agent-${i}`, name, role: ['إعداد المحتوى','النشر','تحليل الأداء','إدارة التواصل الاجتماعي','تطوير الموضوعات'][i], description: ['إعداد المحتوى الاستراتيجي','تجهيز المحتوى للنشر','تحليل الأداء والتفاعل','إدارة حسابات التواصل الاجتماعي','تطوير الموضوعات'][i], status: 'idle', avatar_color: i % 2 ? '#c5a55a' : '#1a3a5c', current_task: null, performance_score: 0, tasks_completed: 0, created_at }));
const initial: Database = {
 agents,
 tasks: [{id:'demo-task',title:'مراجعة مسودة تجريبية',description:'مهمة للتعرف على دورة إعداد المحتوى',agent_id:agents[0].id,status:'pending',priority:'medium',due_date:null,content_id:null,completed_at:null,created_at}],
 content: [{id:'demo-content',title:'مسودة تجريبية — من الفكرة إلى التطبيق',body:'هذا نص تجريبي للتعرف على أدوات تحرير المحتوى ومراجعته. يمكنك تعديله أو حذفه.',type:'article',status:'draft',author_agent_id:agents[0].id,platform:null,tags:['تجربة'],scheduled_at:null,published_at:null,engagement_metrics:{},created_at}],
 friday_posts: [{id:'demo-friday',title:'بوست الجمعة — نموذج تجريبي',content:'مساحة تجريبية لتجهيز بوست الجمعة قبل مراجعته ونشره.',template:'default',status:'draft',verse:null,hadith:null,wisdom:null,main_topic:'تجربة إعداد المحتوى',agent_id:agents[0].id,scheduled_date:null,created_at}],
 topics: [{id:'demo-topic',title:'فكرة تجريبية للمراجعة',description:'مثال قابل للتعديل والحذف',category:'استراتيجي',status:'idea',source_agent_id:agents[4].id,inspiration:'بيانات تجريبية',priority:5,created_at}],
 social_posts: [{id:'demo-social',platform:'twitter',content:'منشور تجريبي قابل للتعديل. لا يتم نشره خارج المنصة.',media_url:null,status:'draft',agent_id:agents[3].id,scheduled_at:null,published_at:null,likes:0,comments:0,shares:0,created_at}],
 analytics: [],
 templates: [{id:'demo-template',name:'قالب الجمعة',type:'friday_post',structure:{sections:['افتتاحية','الموضوع','الخاتمة']},description:'قالب تجريبي لتنظيم محتوى بوست الجمعة',is_active:true,created_at}]
};
function load(): Database {
 const raw = localStorage.getItem(storageKey);
 if (!raw) return structuredClone(initial);
 const value = JSON.parse(raw);
 if (!value || Object.keys(initial).some(key => !Array.isArray(value[key]))) throw new Error('تعذر قراءة البيانات المحلية');
 let updated = false;
 for (const row of value.agents as Agent[]) {
  const current = agents.find(agent => agent.id === row.id);
  if (current && (row.name !== current.name || row.role !== current.role || row.description !== current.description)) {
   Object.assign(row, { name: current.name, role: current.role, description: current.description });
   updated = true;
  }
 }
 if (updated) save(value);
 return value;
}
function save(db: Database): void { localStorage.setItem(storageKey, JSON.stringify(db)); }
export function localRead<K extends keyof Tables>(table: K, field: string, ascending: boolean): Tables[K][] {
 const rows = load()[table];
 return rows.sort((a,b) => {
  const x = (a as unknown as Record<string, unknown>)[field];
  const y = (b as unknown as Record<string, unknown>)[field];
  const result = typeof x === 'number' && typeof y === 'number' ? x-y : String(x ?? '').localeCompare(String(y ?? ''));
  return ascending ? result : -result;
 });
}
export function localCreate<K extends keyof Tables>(table: K, input: Partial<Tables[K]>): Tables[K] {
 const db = load();
 const defaults: Record<string, unknown> = {
 tasks:{status:'pending',priority:'medium',agent_id:null,description:null,due_date:null,content_id:null,completed_at:null},
 content:{body:null,type:'article',status:'draft',author_agent_id:null,platform:null,tags:[],scheduled_at:null,published_at:null,engagement_metrics:{}},
 friday_posts:{template:'default',status:'draft',content:null,verse:null,hadith:null,wisdom:null,main_topic:null,agent_id:null,scheduled_date:null},
 topics:{description:null,category:'استراتيجي',status:'idea',source_agent_id:null,inspiration:null,priority:5},
 social_posts:{platform:'twitter',content:null,media_url:null,status:'draft',agent_id:null,scheduled_at:null,published_at:null,likes:0,comments:0,shares:0}
 };
 const row = { ...(defaults[table] as object), ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() } as Tables[K];
 db[table].push(row); save(db); return row;
}
export function localUpdate<K extends keyof Tables>(table: K, id: string, input: Partial<Tables[K]>): void {
 const db = load(); const row = db[table].find(row => row.id === id);
 if (!row) throw new Error('السجل غير موجود');
 Object.assign(row,input,{id,created_at:row.created_at}); save(db);
}
export function localDelete<K extends keyof Tables>(table: K, id: string): void {
 const db = load(); const index = db[table].findIndex(row => row.id === id);
 if (index >= 0) db[table].splice(index,1); save(db);
}
