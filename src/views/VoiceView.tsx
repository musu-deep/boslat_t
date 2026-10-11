import { useEffect, useRef, useState } from 'react';
import { Mic, Square, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
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
 return <div className="space-y-6">
  <div><h2 className="text-2xl font-bold font-display text-navy-800">وكيل الأوامر الصوتية</h2><p className="text-sm text-slate-500 mt-2">استعلم عن المهام، انتقل بين الأقسام، وجهّز تكليفًا بصوتك.</p></div>
  <Card className="p-6 space-y-5">
   <div className="flex items-center gap-4"><button disabled={busy} aria-label={listening?'إيقاف الاستماع':'بدء الاستماع'} onClick={()=>listening?recognition.current?.stop():start()} className={'w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-white shadow-lg '+(listening?'bg-red-600 animate-pulse':'bg-navy-800 hover:bg-navy-700')}>{listening?<Square size={24}/>:<Mic size={28}/>}</button><div><h3 className="font-bold text-navy-800">{listening?'أستمع إليك…':'اضغط وتحدث بالعربية'}</h3><p className="text-xs text-slate-500 mt-1">الاستماع يبدأ بطلبك ويتوقف بانتهاء الأمر أو عند مغادرة الصفحة.</p></div></div>
   <p className="text-xs text-slate-500">قد يستخدم المتصفح خدمة خارجية لتحويل الصوت إلى نص. المنصة لا تحفظ تسجيلًا صوتيًا. {Speech?'':'يمكنك استخدام الأوامر المكتوبة في هذا المتصفح.'}</p>
   <Input label="الأمر الملتقط — يمكنك تعديله أو كتابته" value={text} onChange={value=>{request.current++;setText(value);setIntent(null);setMessage('');setTasks([]);setBusy(false);}} type="textarea" rows={3}/>
   <Button disabled={busy||listening||!text.trim()} onClick={()=>void interpret(text)} variant="gold">{busy?'جارٍ قراءة البيانات…':'تنفيذ الاستعلام أو تجهيز الإجراء'}</Button>
   {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
  </Card>
  {message&&<Card className="p-5 space-y-4"><p role="status" className="text-navy-800 leading-relaxed">{message}</p><div className="flex gap-2 flex-wrap">{intent?.kind==='create'&&<Button variant="gold" onClick={()=>onPrepare(intent.title,text)}>مراجعة التكليف قبل الإنشاء<ArrowLeft size={15}/></Button>}{'speechSynthesis' in window&&<><Button size="sm" variant="secondary" onClick={()=>{window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(message);speech.lang='ar-SA';window.speechSynthesis.speak(speech);}}><Volume2 size={15}/>قراءة النتيجة</Button><Button size="sm" variant="ghost" onClick={()=>window.speechSynthesis.cancel()}><VolumeX size={15}/>إيقاف القراءة</Button></>}</div>{tasks.map(task=><button key={task.id} onClick={()=>onNavigate('content',task.id)} className="flex items-center justify-between gap-3 w-full text-right rounded-xl border border-slate-200 p-4 text-sm text-navy-700 hover:bg-slate-50"><span>{task.title}</span><ArrowLeft size={15}/></button>)}</Card>}
  <Card className="p-5"><h3 className="font-bold text-navy-800 mb-3">أوامر يمكنك تجربتها</h3><div className="flex flex-wrap gap-2">{examples.map(example=><button key={example} disabled={busy||listening} onClick={()=>{setText(example);void interpret(example);}} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-navy-700 hover:border-gold-400">{example}</button>)}</div><p className="text-xs text-slate-400 mt-4">هذه النسخة تدعم الأوامر المحددة أعلاه. تجهيز التكليف لا ينشئه؛ يلزم مراجعته وتأكيده في النموذج.</p></Card>
 </div>;
}
