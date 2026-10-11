import './FridayView.css';
import { useEffect, useState } from 'react';
import { Sparkles, CalendarHeart, Plus, Copy, Save, Eye, Edit3, ArrowLeft, Link2, FileText, CheckCircle2, Trash2, BookOpen } from 'lucide-react';
import { Button, Input, Modal, Spinner, Badge } from '@/components/ui';
import { fetchFridayPosts, fetchAgents, createFridayPost, updateFridayPost, deleteFridayPost } from '@/lib/api';
import { statusLabels, formatDate } from '@/lib/utils';
import type { FridayPost, Agent } from '@/types';
const blank={title:'',main_topic:'',content:'',verse:'',hadith:'',wisdom:'',scheduled_date:'',agent_id:''};
export function FridayView(){
 const [posts,setPosts]=useState<FridayPost[]>([]),[agents,setAgents]=useState<Agent[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [editing,setEditing]=useState<string|null>(null),[form,setForm]=useState(blank),[tab,setTab]=useState<'edit'|'preview'>('edit'),[connection,setConnection]=useState(false),[deleting,setDeleting]=useState<FridayPost|null>(null);
 const [audience,setAudience]=useState('قراء البوصلة'),[length,setLength]=useState('مكثف — 30 إلى 60 كلمة'),[instructions,setInstructions]=useState(''),[reference,setReference]=useState('');
 async function load(){try{const [p,a]=await Promise.all([fetchFridayPosts(),fetchAgents()]);setPosts(p);setAgents(a);}catch{setError('تعذر تحميل الإصدارات السابقة. حاول تحديث الصفحة.');}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 const existing=posts.find(p=>p.id===editing);
 const approved=existing?.status==='approved';
 const set=(key:keyof typeof blank,value:string)=>{setForm(previous=>({...previous,[key]:value}));setNotice('');};
 const text=[form.title,form.content,form.verse?'الآية: '+form.verse:'',form.hadith?'الحديث: '+form.hadith:'',form.wisdom?'حكمة: '+form.wisdom:''].filter(Boolean).join('\n\n');
 const words=form.content.trim()?form.content.trim().split(/\s+/).length:0;
 const source=posts.find(p=>p.id===reference);
 const prompt=[
  'أنت وكيل صياغة «غروب الجمعة» في البوصلة. انطلق من كلمة واحدة أو فكرة أو نص مرجعي لبناء تأمل مترابط قابل للنشر.',
  'البذرة الدلالية: '+form.main_topic.trim(),
  'العنوان: '+(form.title.trim()||'استخرج مصدرًا مفردًا معرّفًا بـ«الـ» من جوهر التأمل؛ لا يلزم تكرار كلمة المدخل'),
  'الجمهور: '+audience,
  'الطول: '+length,
  'مسار التفكير: استكشف داخليًا ثلاثة مسارات: تجربة الإنسان، الفعل والاختيار، والأثر في الآخرين أو الزمن. اختر مسارًا واحدًا. استخرج منه معنى محوريًا ثم حركة للمعنى (انتقال أو تحول أو كشف أو استعادة)، ثم ثنائية مترابطة، ثم دلالة ختامية ناتجة عنها. لا تعرض خطوات التفكير.',
  'أخرج النص فقط بهذا النسق وبفواصل الأسطر نفسها:\n{العنوان}\nإنه {تقرير الفكرة المحورية}\n{تتمة التقرير وتعميقه}.\nبين {الحالة الأولى} و{الحالة الثانية}،\n{الدلالة الختامية}.\n\nاللهم استعملنا في رضاك\n\n#غروب_الجمعة #البوصلة #د_علي_العتيبي #{الموضوع}',
  'قواعد إلزامية: تتمة التقرير في سطر مستقل بعد سطر «إنه». جملة «بين» في سطر مستقل. الدلالة الختامية في سطر مستقل بعدها. الدعاء ثابت حرفيًا. حوّل المسافات في وسم الموضوع إلى شرطة سفلية. اختر تركيبًا مناسبًا للضمير المذكر بعد «إنه».',
  'كل سطر يخدم المعنى نفسه. الثنائية لا يشترط أن تكون تضادًا؛ الخاتمة تنشأ منها ولا تكون حكمة منفصلة. تجنب الحشو والوعظ المباشر والزخرفة المتكلفة. لا تضف مقدمة أو شرحًا أو تنسيق Markdown.',
  'راجع الترابط وفواصل الأسطر والدعاء والوسوم قبل إخراج النص. لا تختلق اقتباسات أو آيات أو أحاديث أو نسبتها. النص المعاد صياغته مستخلص وليس اقتباسًا حرفيًا. هذه مسودة للمراجعة وليست نصًا معتمدًا من د. علي العتيبي.',
  instructions.trim()?'توجيه إضافي ضمن النسق المعتمد: '+instructions.trim():'',
  source?.content?'نص مرجعي للاسترشاد بالمعنى والأسلوب دون نسخ غير معلن:\n'+source.content:'',
 ].filter(Boolean).join('\n\n');
 const lines=form.content.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 const bodyLines=lines[0]===form.title.trim()?lines.slice(1):lines;
 const formatIssues=form.content.trim()?[
  bodyLines.length!==6?'يجب أن يحتوي المتن على أربعة أسطر، ثم الدعاء، ثم الوسوم (يمكن وضع العنوان في أول المخرج).':'',
  !bodyLines[0]?.startsWith('إنه ')?'ابدأ التقرير بـ«إنه».':'',
  !bodyLines[2]?.startsWith('بين ')?'ضع جملة «بين» بعد تتمة التقرير وفي سطر مستقل.':'',
  bodyLines[4]!=='اللهم استعملنا في رضاك'?'ضع الدعاء الثابت بعد الدلالة الختامية.':'',
  !['#غروب_الجمعة','#البوصلة','#د_علي_العتيبي'].every(tag=>bodyLines.slice(5).join(' ').split(/\s+/).includes(tag))?'أضف الوسوم الثابتة بعد الدعاء.':'',
 ].filter(Boolean):[];
 function fresh(){setEditing(null);setForm({...blank,agent_id:agents.find(a=>a.role==='إعداد المحتوى')?.id??''});setTab('edit');setError('');setNotice('');setInstructions('');setReference('');}
 function open(post:FridayPost){setEditing(post.id);setForm({title:post.title,main_topic:post.main_topic??'',content:post.content??'',verse:post.verse??'',hadith:post.hadith??'',wisdom:post.wisdom??'',scheduled_date:post.scheduled_date?.slice(0,10)??'',agent_id:post.agent_id??''});setTab('edit');setNotice('');setError('');}
 async function copy(value:string,kind:string){try{await navigator.clipboard.writeText(value);setNotice('تم نسخ '+kind);}catch{setError('تعذر النسخ. حدد النص وانسخه يدويًا.');}}
 async function save(status:string){
  if(!form.title.trim()||!form.content.trim()){setError('أدخل عنوان الإصدار ونص المخرج قبل الحفظ.');return;}
  setBusy(true);setError('');try{
   const data={...form,title:form.title.trim(),status,main_topic:form.main_topic||null,verse:form.verse||null,hadith:form.hadith||null,wisdom:form.wisdom||null,scheduled_date:form.scheduled_date||null,agent_id:form.agent_id||null};
   if(editing)await updateFridayPost(editing,data);else{const post=await createFridayPost(data);setEditing(post.id);}
   await load();setNotice(status==='review'?'حُفظ الإصدار للمراجعة.':status==='approved'?'اعتُمد الإصدار للتسليم؛ لم يُنشر تلقائيًا.':'تم حفظ المسودة.');
  }catch{setError('تعذر حفظ الإصدار. النص ما زال متاحًا في المحرر.');}finally{setBusy(false);}
 }
 async function remove(){if(!deleting)return;setBusy(true);try{await deleteFridayPost(deleting.id);if(editing===deleting.id)fresh();setPosts(previous=>previous.filter(p=>p.id!==deleting.id));setDeleting(null);setNotice('تم حذف الإصدار.');}catch{setError('تعذر حذف الإصدار.');}finally{setBusy(false);}}
 if(loading)return <div className="flex justify-center py-24"><Spinner size="lg"/></div>;
 return <div className="friday-workspace">
  <div className="friday-heading"><div><span className="friday-eyebrow"><CalendarHeart size={15}/>إعداد المحتوى ومراجعته</span><h2>غروب الجمعة</h2><p>من كلمة واحدة إلى معنى وثنائية وأثر، ثم إصدار جاهز للمراجعة.</p></div><Button variant="secondary" onClick={fresh}><Plus size={16}/>إصدار جديد</Button></div>
  <div className="friday-flow"><span><b>١</b>تحديد الطلب</span><ArrowLeft size={13}/><span><b>٢</b>توليد المخرج</span><ArrowLeft size={13}/><span><b>٣</b>المراجعة والاعتماد</span><button onClick={()=>setConnection(true)}><Link2 size={14}/>OpenAI <i/>غير مربوط</button></div>
  <div className="friday-layout">
   <section className="friday-brief">
    <div className="friday-panel-heading"><span className="friday-panel-icon"><Sparkles size={20}/></span><div><h3>وكيل صياغة غروب الجمعة</h3><p>يلتقط الكلمة ويبحر في معناها وفق النسق المعتمد.</p></div></div>
    <div className="friday-fields">
     <Input label="الكلمة / الفكرة التي ينطلق منها الوكيل" value={form.main_topic} onChange={v=>set('main_topic',v)} placeholder="مثال: الصمت، الأثر، العطاء…"/>
     <div className="grid sm:grid-cols-2 gap-3"><Input label="الجمهور" value={audience} onChange={setAudience}/><Input label="طول المخرج" value={length} onChange={setLength} type="select" options={[{value:'مكثف — 30 إلى 60 كلمة',label:'مكثف'},{value:'متأمل — 60 إلى 90 كلمة',label:'متأمل'}]}/></div>
     <Input label="توجيهات الكتابة" value={instructions} onChange={setInstructions} type="textarea" rows={3} placeholder="الفكرة المحورية، الزاوية المطلوبة، وما تريد تجنّبه…"/>
     <Input label="إصدار مرجعي للأسلوب (اختياري)" value={reference} onChange={setReference} type="select" options={[{value:'',label:'دون إصدار مرجعي'},...posts.filter(p=>p.content).map(p=>({value:p.id,label:p.title}))]}/>
     <div className="friday-generation"><button disabled className="friday-generate"><Sparkles size={17}/>توليد عبر OpenAI</button><p>يتفعّل التوليد بعد إعداد خدمة الاتصال. يمكنك حاليًا نسخ الطلب وإدخال المخرج للمراجعة.</p><button disabled={!form.main_topic.trim()} onClick={()=>void copy(prompt,'طلب التوليد')} className="friday-copy-prompt"><Copy size={14}/>نسخ تعليمات الوكيل إلى ChatGPT</button><button onClick={()=>setConnection(true)} className="friday-connection-link">متطلبات تفعيل الربط<ArrowLeft size={12}/></button></div>
     <div className="friday-agent-pattern"><strong>النسق المعتمد</strong><p>العنوان<br/>إنه …<br/>تتمة التقرير في سطر مستقل.<br/>بين … و…،<br/>الدلالة الختامية في سطر مستقل.</p><p>اللهم استعملنا في رضاك</p><small>#غروب_الجمعة #البوصلة #د_علي_العتيبي #الموضوع</small></div><details className="friday-prompt"><summary>معاينة الطلب الذي سيُرسل</summary><pre>{prompt}</pre></details>
    </div>
   </section>
   <section className="friday-output">
    <div className="friday-output-heading"><div><span className="friday-eyebrow">المخرج</span><h3>{editing?'مراجعة الإصدار':'مسودة الإصدار'}</h3></div><Badge label={existing?statusLabels[existing.status]??existing.status:'لم يُحفظ بعد'} colorClass="bg-navy-50 text-navy-700"/></div>
    <div className="friday-tabs"><button className={tab==='edit'?'active':''} onClick={()=>setTab('edit')}><Edit3 size={14}/>تحرير النص</button><button className={tab==='preview'?'active':''} onClick={()=>setTab('preview')}><Eye size={14}/>معاينة الإصدار</button><span>{words} كلمة</span></div>
    {tab==='edit'?<div className="friday-editor"><Input label="عنوان الإصدار" value={form.title} onChange={v=>set('title',v)} placeholder="مصدر قصير مثل: الأثر، الإصغاء"/><Input label="نص المخرج" value={form.content} onChange={v=>set('content',v)} type="textarea" rows={10} placeholder="سيظهر المخرج هنا بعد تفعيل الربط. يمكنك الآن لصق نص من ChatGPT أو كتابة المسودة وتعديلها."/><details className="friday-extra"><summary><BookOpen size={14}/>اقتباسات ومراجع إضافية</summary><div className="space-y-3 mt-3"><Input label="آية موثقة (اختياري)" value={form.verse} onChange={v=>set('verse',v)} type="textarea" rows={2}/><Input label="حديث موثّق (اختياري)" value={form.hadith} onChange={v=>set('hadith',v)} type="textarea" rows={2}/><Input label="حكمة ومصدرها (اختياري)" value={form.wisdom} onChange={v=>set('wisdom',v)} type="textarea" rows={2}/></div></details></div>:<article className="friday-preview"><span>غروب الجمعة</span><h4>{form.title||'عنوان الإصدار'}</h4>{form.content?<p>{form.content}</p>:<div className="friday-preview-empty"><FileText size={32}/><p>ابدأ بإضافة المخرج لرؤية معاينة الإصدار.</p></div>}{form.verse&&<blockquote>{form.verse}</blockquote>}{form.hadith&&<blockquote>{form.hadith}</blockquote>}{form.wisdom&&<blockquote>{form.wisdom}</blockquote>}</article>}
    {form.content.trim()&&<div className="friday-agent-pattern" role="status"><strong>{formatIssues.length?'مراجعة النسق':'ترتيب الأسطر والدعاء والوسوم مطابق'}</strong>{formatIssues.map(issue=><p key={issue}>{issue}</p>)}<small>فحص بنيوي؛ راجع المعنى والترابط قبل الاعتماد. ضع العنوان في حقله، والمتن من «إنه» حتى الوسوم في المحرر.</small></div>}<div className="friday-output-footer"><div className="grid sm:grid-cols-2 gap-3"><Input label="موعد الإصدار" value={form.scheduled_date} onChange={v=>set('scheduled_date',v)} type="date"/><Input label="الوكيل المسؤول" value={form.agent_id} onChange={v=>set('agent_id',v)} type="select" options={[{value:'',label:'اختر الوكيل'},...agents.map(a=>({value:a.id,label:a.name}))]}/></div><div className="friday-actions"><Button size="sm" variant="secondary" disabled={busy||!form.content.trim()} onClick={()=>void save('draft')}><Save size={14}/>حفظ مسودة</Button><Button size="sm" variant="gold" disabled={busy||!form.content.trim()} onClick={()=>void save('review')}>حفظ للمراجعة</Button>{existing?.status==='review'&&<Button size="sm" disabled={busy||!form.content.trim()} onClick={()=>void save('approved')}><CheckCircle2 size={14}/>اعتماد للتسليم</Button>}<Button size="sm" variant="ghost" disabled={!form.content.trim()} onClick={()=>void copy(text,'الإصدار')}><Copy size={14}/>نسخ</Button></div><p>الحفظ والاعتماد لا ينشران المحتوى تلقائيًا.{approved?' يمكنك نسخ الإصدار المعتمد للتسليم.':''}</p></div>
   </section>
  </div>
  {error&&<p role="alert" className="friday-error">{error}</p>}{notice&&<p role="status" className="friday-notice"><CheckCircle2 size={16}/>{notice}</p>}
  <section className="friday-library"><div className="friday-library-heading"><div><h3>الإصدارات المحفوظة</h3><p>مسوداتك وإصداراتك السابقة في مكان واحد.</p></div><span>{posts.length} إصدار</span></div>{!posts.length?<p className="friday-no-posts">لم تُحفظ إصدارات بعد. ابدأ بالموجز ثم أضف المخرج واحفظه.</p>:<div className="friday-saved-grid">{posts.map(post=><div className={'friday-saved '+(editing===post.id?'selected':'')} key={post.id}><div><CalendarHeart size={18}/><Badge label={statusLabels[post.status]??post.status}/></div><h4>{post.title}</h4><p>{post.content?.slice(0,110)||'لم يُضف نص بعد'}</p><footer><span>{post.scheduled_date?formatDate(post.scheduled_date):'موعد غير محدد'}</span><button onClick={()=>open(post)} aria-label={'فتح '+post.title}><Edit3 size={15}/></button><button onClick={()=>setDeleting(post)} aria-label={'حذف '+post.title}><Trash2 size={15}/></button></footer></div>)}</div>}</section>
  <Modal open={connection} onClose={()=>setConnection(false)} title="ربط توليد غروب الجمعة بـOpenAI"><div className="space-y-4 text-sm text-slate-600 leading-relaxed"><p>واجهة إعداد الطلب والمخرج جاهزة. الاتصال الفعلي لم يُفعّل بعد.</p><ol className="list-decimal list-inside space-y-2"><li>إعداد خدمة خلفية للاتصال بـOpenAI.</li><li>حفظ مفتاح الاتصال في الخدمة الخلفية.</li><li>تفعيل صلاحيات الوصول وحدود الاستخدام.</li><li>ربط زر التوليد وإرجاع المخرج إلى المحرر.</li></ol><p>إلى حين التفعيل: انسخ الطلب، استخدمه في ChatGPT، ثم الصق الرد في نص المخرج.</p><Button onClick={()=>setConnection(false)}>فهمت</Button></div></Modal>
  <Modal open={!!deleting} onClose={()=>setDeleting(null)} title="حذف إصدار"><p className="text-sm text-slate-600 mb-5">هل تريد حذف «{deleting?.title}» من الإصدارات المحفوظة؟</p><div className="flex gap-2"><Button variant="danger" disabled={busy} onClick={()=>void remove()}>حذف الإصدار</Button><Button variant="secondary" onClick={()=>setDeleting(null)}>إلغاء</Button></div></Modal>
 </div>;
}
