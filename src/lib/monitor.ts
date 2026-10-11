import { supabase } from './supabase';
import { localRead, localCreate, localUpdate, localSignalToProposal } from './demo';
import type { MonitorSignal } from '@/types/monitor';
function requireDemo(){if(supabase)throw new Error('يلزم إعداد خدمة الرصد المتصلة قبل استخدامها');}
export async function fetchSignals(){requireDemo();return localRead('signals','created_at',false);}
export async function createSignal(input:Partial<MonitorSignal>){requireDemo();return localCreate('signals',input);}
export async function updateSignal(id:string,input:Partial<MonitorSignal>){requireDemo();return localUpdate('signals',id,input);}
export async function convertSignal(id:string,title:string,goal:string,audience:string,reason:string){requireDemo();return localSignalToProposal(id,title,goal,audience,reason);}
export function safeSourceUrl(input:string):string|null {
 if(!input.trim())return null;
 let url:URL;try{url=new URL(input);}catch{throw new Error('أدخل رابط مصدر صحيحًا');}
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('استخدم رابط مصدر يبدأ بـ https أو http');
 return url.href;
}
