/*
# بيانات أولية لمنصة البوصلة

إدراج الوكلاء الأساسيين والقالب الافتراضي وبوستات الجمعة الأولية والمواضيع المبتكرة.

## الوكلاء الخمسة:
1. المستكتب - كتابة المحتوى
2. الناشر - نشر المحتوى عبر المنصات
3. المتابع - متابعة الأداء والتفاعل
4. السوشال ميديا - إدارة حسابات التواصل
5. المبتكر - ابتكار المواضيع والأفكار

## القالب الافتراضي:
- قالب بوست الجمعة القياسي

## مواضيع مبتكرة أولية
*/

-- Insert agents (only if table is empty)
INSERT INTO agents (name, role, description, status, avatar_color, current_task, performance_score, tasks_completed)
SELECT * FROM (VALUES
  ('المستكتب', 'كاتب', 'وكيل متخصص في استكتاب المحتوى والمقالات وبوستات الجمعة', 'idle', '#0ea5e9', NULL, 92, 148),
  ('الناشر', 'ناشر', 'وكيل متخصص في نشر المحتوى عبر جميع المنصات', 'idle', '#10b981', NULL, 88, 132),
  ('المتابع', 'متابع', 'وكيل متخصص في متابعة الأداء والتفاعل والتحليلات', 'idle', '#f59e0b', NULL, 95, 201),
  ('السوشال ميديا', 'سوشال', 'وكيل متخصص في إدارة حسابات التواصل الاجتماعي', 'idle', '#ec4899', NULL, 90, 175),
  ('المبتكر', 'مبتكر', 'وكيل متخصص في ابتكار المواضيع وتوليد الأفكار الجديدة', 'idle', '#8b5cf6', NULL, 87, 98)
) AS v(name, role, description, status, avatar_color, current_task, performance_score, tasks_completed)
WHERE NOT EXISTS (SELECT 1 FROM agents);

-- Insert default template
INSERT INTO templates (name, type, structure, description, is_active)
SELECT 'قالب الجمعة القياسي', 'friday_post',
  '{"sections": ["افتتاحية", "آية كريمة", "حديث شريف", "موعظة", "حكمة", "خاتمة"], "style": "تأملي", "tone": "روحاني", "length": "متوسط"}',
  'القالب القياسي لبوست الجمعة: يبدأ بالافتتاحية ثم آية وحديث وموعظة وحكمة وخاتمة',
  true
WHERE NOT EXISTS (SELECT 1 FROM templates);

-- Insert initial topics
INSERT INTO topics (title, description, category, status, inspiration, priority)
SELECT * FROM (VALUES
  ('الصبر في ظل المصائب', 'موضوع عن الصبر وكيفية التعامل مع المصائب بثبات وإيمان', 'تأملات', 'idea', 'من تجارب الحياة اليومية', 8),
  ('أهمية الوقت في حياة المسلم', 'موضوع عن قيمة الوقت وكيفية استثماره في الخير', 'نصائح', 'idea', 'ملاحظة هدر الوقت في المجتمع', 7),
  ('بر الوالدين في الإسلام', 'موضوع عن فضل بر الوالدين وأثره على الفرد والمجتمع', 'أخلاق', 'idea', 'قصص مؤثرة عن بر الوالدين', 9),
  ('الشكر وتأثيره على النفس', 'موضوع عن ممارسة الشكر وأثرها النفسي والروحي', 'تأملات', 'idea', 'دراسات نفسية حديثة', 6),
  ('التعامل مع القلق والتوتر', 'موضوع إرشادي للتعامل مع القلق من منظور إسلامي', 'نصائح', 'idea', 'كثرة الاستفسارات حول القلق', 8)
) AS v(title, description, category, status, inspiration, priority)
WHERE NOT EXISTS (SELECT 1 FROM topics);
