import { useEffect, useState } from 'react';
import { Plus, Lightbulb, Edit3, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Spinner, EmptyState } from '@/components/ui';
import { fetchTopics, fetchAgents, createTopic, updateTopic, assignProposal } from '@/lib/api';
import type { Topic, Agent } from '@/types';

const labels: Record<string,string> = {idea:'بانتظار الاعتماد',approved:'معتمد للتكليف',in_progress:'تم التكليف',completed:'تم اعتماد المخرج'};
const blank = {title:'',goal:'',audience:'',reason:'',category:'استراتيجي',priority:'5',source:''};
export function TopicsView() {
 const [topics,setTopics]=useState<Topic[]>([]),[agents,setAgents]=useState<Agent[]>([]);
 const [loading,setLoading]=useState(true),[show,setShow]=useState(false),[editing,setEditing]=useState<Topic|null>(null);
 const [form,setForm]=useState(blank),[assigning,setAssigning]=useState<Topic|null>(null),[agentId,setAgentId]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function load(){try{const [t,a]=await Promise.all([fetchTopics(),fetchAgents()]);setTopics(t);setAgents(a);}catch{setError('تعذر تحميل المقترحات');}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 function edit(topic?:Topic){setEditing(topic??null);setError('');const d=topic?.description??'';const parts=d.split('\nالجمهور: ');setForm(topic?{title:topic.title,goal:parts[0].replace(/^الهدف: /,''),audience:parts[1]??'',reason:topic.inspiration??'',category:topic.category,priority:String(topic.priority),source:topic.source_agent_id??''}:blank);setShow(true);}
 async function save(){if(!form.title.trim()||!form.goal.trim()||!form.audience.trim()||!form.reason.trim()){setError('أكمل العنوان والهدف والجمهور وسبب المقترح');return;}setBusy(true);setError('');try{const data={title:form.title.trim(),description:`الهدف: ${form.goal.trim()}\nالجمهور: ${form.audience.trim()}`,inspiration:form.reason.trim(),category:form.category,priority:Math.max(1,Math.min(10,Number(form.priority)||5)),source_agent_id:form.source||null};if(editing)await updateTopic(editing.id,data);else await createTopic({...data,status:'idea'});setShow(false);await load();}catch{setError('تعذر حفظ المقترح');}finally{setBusy(false);}}
 async function approve(topic:Topic){setBusy(true);setError('');try{await updateTopic(topic.id,{status:'approved'});await load();setMessage('تم اعتماد المقترح؛ يمكنك تكليف وكيل بإعداده');}catch{setError('تعذر اعتماد المقترح');}finally{setBusy(false);}}
 async function assign(){if(!assigning||!agentId)return;setBusy(true);setError('');try{await assignProposal(assigning.id,agentId);setAssigning(null);await load();setMessage('تم إنشاء التكليف. تابع التنفيذ في «مهام إعداد المحتوى»');}catch(e){setError(e instanceof Error?e.message:'تعذر إنشاء التكليف');}finally{setBusy(false);}}
 if(loading)return <div className="flex justify-center py-24"><Spinner size="lg"/></div>;
 return <div className="space-y-6">
  <div className="flex justify-between gap-4"><div><h2 className="text-2xl font-bold text-navy-800 font-display">مقترحات الوكلاء</h2><p className="text-sm text-slate-500 mt-2">مراجعة الموضوع وسبب اختياره وهدفه وجمهوره، ثم اعتماده وتكليف الوكيل.</p></div><Button variant="gold" onClick={()=>edit()}><Plus size={16}/>مقترح جديد</Button></div>
  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-navy-700">المسار: مقترح ← اعتماد ← تكليف وكيل ← مراجعة المخرج ← تسليم للمدونة</div>
  {message&&<p role="status" className="rounded-xl bg-gold-50 p-3 text-sm text-navy-700">{message}</p>}
  {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
  {!topics.length?<EmptyState title="لا توجد مقترحات" description="أضف مقترحًا للمراجعة والاعتماد" icon={<Lightbulb size={48}/>}/>:<div className="grid md:grid-cols-2 gap-4">{topics.map(topic=><Card key={topic.id} className="p-5 space-y-4">
   <div className="flex justify-between gap-3"><h3 className="font-bold text-navy-800">{topic.title}</h3><Badge label={labels[topic.status]??topic.status}/></div>
   <p className="text-sm whitespace-pre-wrap text-slate-600">{topic.description||'لم تُحدد تفاصيل المقترح'}</p>
   <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400 mb-1">سبب اختيار الموضوع</p><p className="text-sm text-navy-700">{topic.inspiration||'لم يحدد'}</p></div>
   <p className="text-xs text-slate-500">{topic.category} · أولوية {topic.priority} · {agents.find(a=>a.id===topic.source_agent_id)?.name??'مقترح يدوي'}</p>
   <div className="flex gap-2 flex-wrap">{topic.status==='idea'&&<><Button size="sm" disabled={busy} onClick={()=>edit(topic)}><Edit3 size={14}/>تعديل المقترح</Button><Button size="sm" variant="gold" disabled={busy} onClick={()=>approve(topic)}><CheckCircle2 size={14}/>اعتماد المقترح</Button></>}{topic.status==='approved'&&<><Button size="sm" disabled={busy} onClick={()=>{setAssigning(topic);setAgentId(agents.find(a=>a.role==='إعداد المحتوى')?.id??agents[0]?.id??'');}}>تكليف وكيل</Button><Button size="sm" variant="ghost" onClick={()=>edit(topic)}>تعديل التفاصيل</Button></>}</div>
  </Card>)}</div>}
  <Modal open={show} onClose={()=>setShow(false)} title={editing?'تعديل المقترح':'مقترح جديد'} size="lg"><div className="space-y-4">
   <Input label="الموضوع المقترح" value={form.title} onChange={title=>setForm({...form,title})}/>
   <Input label="الهدف" value={form.goal} onChange={goal=>setForm({...form,goal})} type="textarea"/>
   <Input label="الجمهور المقصود" value={form.audience} onChange={audience=>setForm({...form,audience})}/>
   <Input label="سبب اختيار الموضوع" value={form.reason} onChange={reason=>setForm({...form,reason})} type="textarea"/>
   <Input label="الوكيل صاحب المقترح" value={form.source} onChange={source=>setForm({...form,source})} type="select" options={[{value:'',label:'مقترح يدوي'},...agents.map(a=>({value:a.id,label:a.name}))]}/>
   <div className="grid grid-cols-2 gap-4"><Input label="التصنيف" value={form.category} onChange={category=>setForm({...form,category})}/><Input label="الأولوية (1–10)" value={form.priority} onChange={priority=>setForm({...form,priority})} type="number"/></div>
   {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}<Button variant="gold" disabled={busy} onClick={save}>حفظ المقترح</Button>
  </div></Modal>
  <Modal open={!!assigning} onClose={()=>setAssigning(null)} title="تكليف وكيل بإعداد المحتوى"><div className="space-y-4"><p className="font-bold text-navy-800">{assigning?.title}</p><Input label="الوكيل المسؤول عن التنفيذ" value={agentId} onChange={setAgentId} type="select" options={agents.map(a=>({value:a.id,label:a.name}))}/><p className="text-sm text-slate-500">يُنقل موجز المقترح إلى المهمة تلقائيًا، دون إعادة إدخاله.</p>{error&&<p role="alert" className="text-red-700">{error}</p>}<Button variant="gold" disabled={busy||!agentId} onClick={assign}>إنشاء التكليف</Button></div></Modal>
 </div>;
}
