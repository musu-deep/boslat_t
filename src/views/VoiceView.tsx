import { useEffect, useRef, useState } from 'react';
import './VoiceView.css';
import { Mic, Square, ArrowLeft, Volume2, VolumeX, Sparkles, Clock3, ClipboardCheck, FilePlus2, Compass, Activity, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { fetchTasks, fetchContent } from '@/lib/api';
import { parseVoiceCommand, type VoiceIntent } from '@/lib/voice';
import type { Task } from '@/types';
import type { ViewKey } from '@/components/Sidebar';
interface Recognition {
 lang:string; continuous:boolean; interimResults:boolean;
 onresult:((event:{results:ArrayLike<{isFinal:boolean;0:{transcript:string}}>})=>void)|null;
 onerror:((event:{error:string})=>void)|null; onend:(()=>void)|null;
 start:()=>void; stop:()=>void; abort:()=>void;
}
type SpeechWindow = Window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
const names:Partial<Record<ViewKey,string>>={dashboard:'لوحة التحكم',agents:'الوكلاء',content:'مهام إعداد المحتوى',friday:'غروب الجمعة',topics:'مقترحات الوكلاء',social:'سوشال مونتيور',analytics:'الأداء والتقارير'};
export function VoiceView({onNavigate,onPrepare}:{onNavigate:(view:ViewKey,taskId?:string)=>void;onPrepare:(title:string,brief:string)=>void}) {
 const [text,setText]=useState(''),[listening,setListening]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[intent,setIntent]=useState<VoiceIntent|null>(null),[tasks,setTasks]=useState<Task[]>([]);
 const recognition=useRef<Recognition|null>(null), mounted=useRef(true), request=useRef(0);
 const Speech=(window as SpeechWindow).SpeechRecognition??(window as SpeechWindow).webkitSpeechRecognition;
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;request.current++;recognition.current?.abort();window.speechSynthesis?.cancel();};},[]);
 async function interpret(command:string){
  recognition.current?.stop();const token=++request.current;setError('');setTasks([]);setMessage('');setBusy(true);
  const next=parseVoiceCommand(command);setIntent(next);
  try {
   if(next.kind==='unsupported'){setMessage('لم أحدد إجراءً مدعومًا. جرّب أحد الأمثلة أدناه. الاعتماد والنشر والحذف يتم من صفحاتها بعد المراجعة.');return;}
   if(next.kind==='create'){setMessage('جهّزت طلب التكليف بعنوان «'+next.title+'». راجع الموجز والوكيل وموعد التسليم في نموذج التكليف قبل تأكيد الإنشاء.');return;}
   if(next.kind==='navigate'){setMessage('فتح قسم «'+names[next.view]+'».');onNavigate(next.view);return;}
   const [all,outputs]=await Promise.all([fetchTasks(),fetchContent()]);if(!mounted.current||request.current!==token)return;
   const overdue=all.filter(t=>!['completed','cancelled'].includes(t.status)&&t.due_date&&new Date(t.due_date).getTime()<Date.now());
   const review=all.filter(t=>t.status!=='cancelled'&&outputs.some(c=>c.id===t.content_id&&c.status==='review'));
   if(next.kind==='summary'){setMessage('لديك '+all.filter(t=>t.status==='in_progress').length+' مهام جارية، و'+review.length+' مخرجات مرتبطة بمهام تحتاج المراجعة، و'+overdue.length+' مهام تجاوزت موعد التسليم. اكتملت '+all.filter(t=>t.status==='completed').length+' مهام.');}
   else {const rows=next.filter==='overdue'?overdue:next.filter==='review'?review:all;setTasks(rows);setMessage(rows.length?'وجدت '+rows.length+' '+(next.filter==='review'?'مهام لها مخرجات بانتظار المراجعة.':next.filter==='overdue'?'مهام متأخرة.':'مهام مسجلة.'):'لا توجد مهام مطابقة لهذا الطلب.');}
  }catch{if(mounted.current&&request.current===token)setError('تعذر قراءة بيانات المنصة. حاول مجددًا.');}finally{if(mounted.current&&request.current===token)setBusy(false);}
 }
 function start(){
  if(!Speech){setError('الإدخال الصوتي غير متاح في هذا المتصفح. يمكنك كتابة الأمر أدناه.');return;}
  setError('');setMessage('');setIntent(null);setText('');
  const r=new Speech();recognition.current=r;r.lang='ar-SA';r.continuous=false;r.interimResults=true;
  r.onresult=e=>{if(!mounted.current)return;const words=Array.from(e.results).map(row=>row[0].transcript).join(' ');setText(words);if(Array.from(e.results).every(row=>row.isFinal))void interpret(words);};
  r.onerror=e=>{if(!mounted.current)return;setListening(false);setError(e.error==='not-allowed'?'لم يُسمح باستخدام الميكروفون. فعّل الإذن من إعدادات المتصفح أو اكتب الأمر.':e.error==='no-speech'?'لم ألتقط كلامًا. اضغط الميكروفون وحاول مجددًا.':e.error==='aborted'?'':'تعذر التعرف على الصوت. تحقق من الميكروفون والاتصال، أو اكتب الأمر.');};
  r.onend=()=>{if(mounted.current)setListening(false);};
  try{r.start();setListening(true);}catch{setError('تعذر بدء الاستماع. حاول مجددًا.');}
 }
 const examples=['وش المهام المتأخرة؟','اعرض المخرجات اللي تحتاج مراجعتي','لخّص آخر مستجدات المنصة','كلّف وكيل إعداد المحتوى بموضوع عن التخطيط الاستراتيجي','افتح سوشال مونتيور'];
 const icons=[Clock3,ClipboardCheck,Activity,FilePlus2,Compass];
 const labels=['متابعة المواعيد','مراجعة المخرجات','مستجدات المنصة','تكليف جديد','التنقل بين الأقسام'];
 return <div className="voice-workspace">
  <div className="voice-heading"><div><span className="voice-eyebrow"><Sparkles size={14}/>إدارة المنصة بالصوت</span><h2>وكيل الأوامر الصوتية</h2><p>طلب واحد يوصلك إلى المهام والمخرجات والإجراء التالي.</p></div><span className={'voice-status '+(listening?'is-live':'')}><i/>{listening?'الاستماع نشط':busy?'معالجة الطلب':'جاهز لطلبك'}</span></div>
  <div className="voice-layout">
   <section className="voice-console" aria-label="مساحة الأوامر الصوتية">
    <div className={'voice-stage '+(listening?'is-listening':'')}>
     <span className="voice-stage-label"><Mic size={14}/>العربية</span>
     <div className="voice-orbit">
      <div className="voice-orbit-ring"/><div className="voice-orbit-ring second"/>
      <button disabled={busy} aria-label={listening?'إيقاف الاستماع':'بدء الاستماع'} onClick={()=>listening?recognition.current?.stop():start()} className="voice-mic">{listening?<Square size={28}/>:<Mic size={36}/>}</button>
     </div>
     <h3>{listening?'أستمع إليك…':busy?'أراجع طلبك…':'ماذا تريد أن تنجز؟'}</h3>
     <p>{listening?'تحدث بوضوح، ثم انتظر ظهور النص أدناه.':'اضغط الميكروفون واطلب، أو اكتب أمرك مباشرة.'}</p>
     <div className="voice-wave" aria-hidden="true">{[12,22,36,18,44,28,52,28,44,18,36,22,12].map((height,i)=><span key={i} style={{height,animationDelay:i*0.08+'s'}}/>)}</div>
     <span className="voice-stage-note">{listening?'اضغط مرة أخرى لإيقاف الاستماع':'الميكروفون متوقف حتى تبدأ الاستماع'}</span>
    </div>
    <div className="voice-composer">
     <div className="voice-composer-label"><label htmlFor="voice-command">نص الأمر</label><span>راجع النص أو عدّله قبل المتابعة</span></div>
     <textarea id="voice-command" value={text} disabled={listening} onChange={e=>{request.current++;setText(e.target.value);setIntent(null);setMessage('');setTasks([]);setBusy(false);}} placeholder="مثال: اعرض المخرجات التي تحتاج مراجعتي…" rows={3}/>
     <div className="voice-composer-footer"><span>{Speech?'الصوت والكتابة متاحان':'استخدم الكتابة — الصوت غير متاح في هذا المتصفح'}</span><button className="voice-submit" disabled={busy||listening||!text.trim()} onClick={()=>void interpret(text)}>{busy?'جارٍ المعالجة':'متابعة الطلب'}<Send size={15}/></button></div>
     {error&&<p role="alert" className="voice-error">{error}</p>}
    </div>
   </section>
   <aside className="voice-shortcuts">
    <div className="voice-shortcuts-heading"><span className="voice-eyebrow">ابدأ بطلب جاهز</span><h3>أوامر سريعة</h3><p>اختر أمرًا لتجربته مباشرة.</p></div>
    <div className="voice-example-list">{examples.map((example,i)=>{const Icon=icons[i];return <button key={example} disabled={busy||listening} onClick={()=>{setText(example);void interpret(example);}}><span className="voice-example-icon"><Icon size={19}/></span><span><strong>{labels[i]}</strong><small>{example}</small></span><ArrowLeft size={15} className="voice-example-arrow"/></button>;})}</div>
    <div className="voice-review-note"><ClipboardCheck size={18}/><p><strong>القرار يبقى لك</strong>التكليف يُجهّز للمراجعة، ولا يُنشأ إلا بعد تأكيده في النموذج.</p></div>
   </aside>
  </div>
  {(message||busy)&&<section className="voice-result" aria-label="نتيجة الطلب"><div className="voice-result-heading"><span><Sparkles size={17}/>{busy?'جارٍ قراءة بيانات المنصة':'نتيجة الطلب'}</span><small>{intent?.kind==='create'?'بانتظار مراجعتك':'من بيانات المنصة الحالية'}</small></div>{message&&<><p role="status" className="voice-result-text">{message}</p><div className="flex gap-2 flex-wrap">{intent?.kind==='create'&&<Button variant="gold" onClick={()=>onPrepare(intent.title,text)}>مراجعة التكليف قبل الإنشاء<ArrowLeft size={15}/></Button>}{'speechSynthesis' in window&&<><Button size="sm" variant="secondary" onClick={()=>{window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(message);speech.lang='ar-SA';window.speechSynthesis.speak(speech);}}><Volume2 size={15}/>قراءة النتيجة</Button><Button size="sm" variant="ghost" onClick={()=>window.speechSynthesis.cancel()}><VolumeX size={15}/>إيقاف القراءة</Button></>}</div><div className="voice-task-list">{tasks.map(task=><button key={task.id} onClick={()=>onNavigate('content',task.id)}><span>{task.title}</span><ArrowLeft size={15}/></button>)}</div></>}</section>}
  <details className="voice-details"><summary>عن الصوت والأوامر المدعومة</summary><p>قد يستخدم المتصفح خدمة خارجية لتحويل الصوت إلى نص. المنصة لا تحفظ تسجيلًا صوتيًا، ويتوقف الاستماع عند انتهاء الأمر أو مغادرة الصفحة. تدعم هذه النسخة الأوامر المحددة في الأمثلة؛ ويمكن كتابة الأمر عند تعذر استخدام الصوت.</p></details>
 </div>;
}
