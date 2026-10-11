/*
# منصة البوصلة - وكيل الذكاء الاصطناعي

إنشاء قاعدة بيانات كاملة لمنصة البوصلة للمستشار الدكتور علي العتيبي.
تتضمن الجداول: الوكلاء، المهام، المحتوى، مواضيع الجمعة، السوشال ميديا، المواضيع المبتكرة، التحليلات، والقالب.

## الجداول الجديدة:

1. agents - جدول الوكلاء (المستكتب، الناشر، المتابع، السوشال ميديا، المبتكر)
   - id, name, role, description, status, avatar_color, current_task, performance_score, tasks_completed, created_at

2. tasks - جدول المهام
   - id, agent_id, title, description, status, priority, due_date, content_id, created_at, completed_at

3. content - جدول المحتوى (المقالات والمنشورات)
   - id, title, body, type, status, author_agent_id, platform, tags, scheduled_at, published_at, engagement_metrics, created_at

4. friday_posts - جدول بوستات الجمعة
   - id, title, content, template, status, verse, hadith, wisdom, main_topic, agent_id, scheduled_date, created_at

5. topics - جدول المواضيع المبتكرة
   - id, title, description, category, status, source_agent_id, inspiration, priority, created_at

6. social_posts - جدول منشورات السوشال ميديا
   - id, platform, content, media_url, status, agent_id, scheduled_at, published_at, likes, comments, shares, created_at

7. analytics - جدول التحليلات
   - id, metric_name, metric_value, platform, date, agent_id, created_at

8. templates - جدول القوالب
   - id, name, type, structure, description, is_active, created_at

## الأمان:
- تفعيل RLS على جميع الجداول
- صلاحيات anon + authenticated (لا يوجد تسجيل دخول - منصة إدارية)
- جميع البيانات مشتركة/عامة

## ملاحظات:
- المنصة بدون تسجيل دخول (single-tenant)
- جميع الجداول تسمح بالقراءة والكتابة للجميع
- البيانات الأولية تُدرج عبر migration منفصل
*/

-- ============ agents table ============
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'idle',
  avatar_color text NOT NULL DEFAULT '#0ea5e9',
  current_task text,
  performance_score integer NOT NULL DEFAULT 0,
  tasks_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_agents" ON agents;
CREATE POLICY "anon_select_agents" ON agents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_agents" ON agents;
CREATE POLICY "anon_insert_agents" ON agents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_agents" ON agents;
CREATE POLICY "anon_update_agents" ON agents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_agents" ON agents;
CREATE POLICY "anon_delete_agents" ON agents FOR DELETE TO anon, authenticated USING (true);

-- ============ tasks table ============
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  content_id uuid,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

-- ============ content table ============
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'article',
  status text NOT NULL DEFAULT 'draft',
  author_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  platform text,
  tags text[],
  scheduled_at timestamptz,
  published_at timestamptz,
  engagement_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_content" ON content;
CREATE POLICY "anon_select_content" ON content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_content" ON content;
CREATE POLICY "anon_insert_content" ON content FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_content" ON content;
CREATE POLICY "anon_update_content" ON content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_content" ON content;
CREATE POLICY "anon_delete_content" ON content FOR DELETE TO anon, authenticated USING (true);

-- ============ friday_posts table ============
CREATE TABLE IF NOT EXISTS friday_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  template text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'draft',
  verse text,
  hadith text,
  wisdom text,
  main_topic text,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  scheduled_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE friday_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_friday_posts" ON friday_posts;
CREATE POLICY "anon_select_friday_posts" ON friday_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_friday_posts" ON friday_posts;
CREATE POLICY "anon_insert_friday_posts" ON friday_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_friday_posts" ON friday_posts;
CREATE POLICY "anon_update_friday_posts" ON friday_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_friday_posts" ON friday_posts;
CREATE POLICY "anon_delete_friday_posts" ON friday_posts FOR DELETE TO anon, authenticated USING (true);

-- ============ topics table ============
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'idea',
  source_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  inspiration text,
  priority integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_topics" ON topics;
CREATE POLICY "anon_select_topics" ON topics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_topics" ON topics;
CREATE POLICY "anon_insert_topics" ON topics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_topics" ON topics;
CREATE POLICY "anon_update_topics" ON topics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_topics" ON topics;
CREATE POLICY "anon_delete_topics" ON topics FOR DELETE TO anon, authenticated USING (true);

-- ============ social_posts table ============
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  content text,
  media_url text,
  status text NOT NULL DEFAULT 'draft',
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  published_at timestamptz,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_social_posts" ON social_posts;
CREATE POLICY "anon_select_social_posts" ON social_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_social_posts" ON social_posts;
CREATE POLICY "anon_insert_social_posts" ON social_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_social_posts" ON social_posts;
CREATE POLICY "anon_update_social_posts" ON social_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_social_posts" ON social_posts;
CREATE POLICY "anon_delete_social_posts" ON social_posts FOR DELETE TO anon, authenticated USING (true);

-- ============ analytics table ============
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  platform text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_analytics" ON analytics;
CREATE POLICY "anon_select_analytics" ON analytics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_analytics" ON analytics;
CREATE POLICY "anon_insert_analytics" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_analytics" ON analytics;
CREATE POLICY "anon_update_analytics" ON analytics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_analytics" ON analytics;
CREATE POLICY "anon_delete_analytics" ON analytics FOR DELETE TO anon, authenticated USING (true);

-- ============ templates table ============
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  structure jsonb NOT NULL DEFAULT '{}',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_templates" ON templates;
CREATE POLICY "anon_select_templates" ON templates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_templates" ON templates;
CREATE POLICY "anon_insert_templates" ON templates FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_templates" ON templates;
CREATE POLICY "anon_update_templates" ON templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_templates" ON templates;
CREATE POLICY "anon_delete_templates" ON templates FOR DELETE TO anon, authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_friday_posts_status ON friday_posts(status);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
