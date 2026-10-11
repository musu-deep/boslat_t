export type AgentStatus = 'idle' | 'working' | 'paused' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string | null;
  status: string;
  avatar_color: string;
  current_task: string | null;
  performance_score: number;
  tasks_completed: number;
  created_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  agent_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  content_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export type ContentType = 'article' | 'post' | 'friday_post' | 'social_post';
export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface Content {
  id: string;
  title: string;
  body: string | null;
  type: string;
  status: string;
  author_agent_id: string | null;
  platform: string | null;
  tags: string[] | null;
  scheduled_at: string | null;
  published_at: string | null;
  engagement_metrics: Record<string, number>;
  created_at: string;
}

export interface FridayPost {
  id: string;
  title: string;
  content: string | null;
  template: string;
  status: string;
  verse: string | null;
  hadith: string | null;
  wisdom: string | null;
  main_topic: string | null;
  agent_id: string | null;
  scheduled_date: string | null;
  created_at: string;
}

export type TopicStatus = 'idea' | 'approved' | 'in_progress' | 'completed';

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  source_agent_id: string | null;
  inspiration: string | null;
  priority: number;
  created_at: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string | null;
  media_url: string | null;
  status: string;
  agent_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
}

export interface Analytics {
  id: string;
  metric_name: string;
  metric_value: number;
  platform: string | null;
  date: string;
  agent_id: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  type: string;
  structure: Record<string, unknown>;
  description: string | null;
  is_active: boolean;
  created_at: string;
}
