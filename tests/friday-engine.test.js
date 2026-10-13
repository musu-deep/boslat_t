import {test} from 'node:test';import assert from 'node:assert/strict';
import {validate,render,inspect,run} from '../shared/friday-engine.js';
const draft={title:'العطاء',report:'إنه تحويل الممكن إلى أثر.',expansion:'تتسع قيمته بقدرة الآخرين.',duality:'بين سد الحاجة وفتح الفرصة،',movement:'ينتقل الفعل نحو تمكين المستقبل.',impact:'يبقى الأثر بقدرة من تلقاه.'};
test('round trip and exact constants',()=>assert.deepEqual(inspect(draft.title,render(draft,'العطاء'),'العطاء'),[]));
test('reject malformed fields',()=>assert.ok(validate({...draft,report:'غير مطابق'}).length));
test('repair and score selection',async()=>{let i=0;const r=await run('العطاء',async()=>++i===1?{...draft,report:'خطأ'}:draft,async()=>({coherent:true,score:i/4,issues:[]}));assert.equal(r.status,'accepted');assert.equal(r.score,.75);assert.equal(r.audit.length,3);});
test('semantic fail closed',async()=>{const r=await run('العطاء',async()=>draft,async()=>({coherent:false,score:1,issues:['غير مترابط']}));assert.equal(r.status,'rejected');assert.equal(r.content,undefined);});
test('reject non finite score',async()=>assert.equal((await run('العطاء',async()=>draft,async()=>({coherent:true,score:NaN,issues:[]}))).status,'rejected'));
