export type VoiceIntent = { kind: 'tasks'; filter: 'overdue' | 'review' | 'all' } | { kind: 'summary' } | { kind: 'create'; title: string } | { kind: 'navigate'; view: 'dashboard' | 'agents' | 'content' | 'friday' | 'topics' | 'social' | 'analytics' } | { kind: 'unsupported' };
export function parseVoiceCommand(text: string): VoiceIntent {
  const normalized = text.normalize('NFKC').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
  if (/^(احذف|حذف|انشر|نشر|اعتمد|الغ|الغاء)(\s|$)/.test(normalized)) return {kind:'unsupported'};
  if (/(كلف|كلّف|تكليف|انشئ|انشاء)/.test(normalized)) {
    const match = text.match(/(?:بموضوع|موضوع(?:ًا|ا)?|بعنوان|عنوان|عن)\s+(.+)/);
    return match?.[1]?.trim() ? {kind:'create', title:match[1].trim().replace(/^عن\s+/, '')} : {kind:'unsupported'};
  }
  if (/(متاخر|تجاوز.*موعد)/.test(normalized)) return {kind:'tasks',filter:'overdue'};
  if (/(مراجع|اعتمادي|تحتاج موافقتي)/.test(normalized)) return {kind:'tasks',filter:'review'};
  if (/(لخص|ملخص|مستجدات)/.test(normalized)) return {kind:'summary'};
  if (/(مهام|تكليفات)/.test(normalized)) return {kind:'tasks',filter:'all'};
  if (!/(افتح|اعرض|اذهب|انتقل|ودني)/.test(normalized)) return {kind:'unsupported'};
  const routes: [RegExp, Extract<VoiceIntent,{kind:'navigate'}>['view']][] = [[/اداء|تقارير|تحليلات/,'analytics'],[/سوشال|رصد/,'social'],[/غروب|جمعه/,'friday'],[/مقترح|موضوعات/,'topics'],[/وكلاء/,'agents'],[/محتوي/,'content'],[/رئيسيه|لوحه التحكم/,'dashboard']];
  const route = routes.find(([pattern]) => pattern.test(normalized));
  return route ? {kind:'navigate',view:route[1]} : {kind:'unsupported'};
}
