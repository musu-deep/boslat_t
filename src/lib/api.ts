import { localRead, localCreate, localUpdate, localDelete } from './demo';
import { supabase } from '@/lib/supabase';
import type { Agent, Task, Content, FridayPost, Topic, SocialPost, Analytics, Template } from '@/types';

export async function fetchAgents(): Promise<Agent[]> {
  if (!supabase) return localRead('agents', 'created_at', true);
  const { data, error } = await supabase.from('agents').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return localRead('tasks', 'created_at', false);
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchContent(): Promise<Content[]> {
  if (!supabase) return localRead('content', 'created_at', false);
  const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFridayPosts(): Promise<FridayPost[]> {
  if (!supabase) return localRead('friday_posts', 'created_at', false);
  const { data, error } = await supabase.from('friday_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTopics(): Promise<Topic[]> {
  if (!supabase) return localRead('topics', 'priority', false);
  const { data, error } = await supabase.from('topics').select('*').order('priority', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSocialPosts(): Promise<SocialPost[]> {
  if (!supabase) return localRead('social_posts', 'created_at', false);
  const { data, error } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAnalytics(): Promise<Analytics[]> {
  if (!supabase) return localRead('analytics', 'date', false);
  const { data, error } = await supabase.from('analytics').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTemplates(): Promise<Template[]> {
  if (!supabase) return localRead('templates', 'created_at', true);
  const { data, error } = await supabase.from('templates').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

// ---- Mutations ----

export async function createTask(task: Partial<Task>): Promise<Task> {
  if (!supabase) return localCreate('tasks', task);
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  if (!supabase) return localUpdate('tasks', id, updates);
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) return localDelete('tasks', id);
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function createContent(content: Partial<Content>): Promise<Content> {
  if (!supabase) return localCreate('content', content);
  const { data, error } = await supabase.from('content').insert(content).select().single();
  if (error) throw error;
  return data;
}

export async function updateContent(id: string, updates: Partial<Content>): Promise<void> {
  if (!supabase) return localUpdate('content', id, updates);
  const { error } = await supabase.from('content').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteContent(id: string): Promise<void> {
  if (!supabase) return localDelete('content', id);
  const { error } = await supabase.from('content').delete().eq('id', id);
  if (error) throw error;
}

export async function createFridayPost(post: Partial<FridayPost>): Promise<FridayPost> {
  if (!supabase) return localCreate('friday_posts', post);
  const { data, error } = await supabase.from('friday_posts').insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function updateFridayPost(id: string, updates: Partial<FridayPost>): Promise<void> {
  if (!supabase) return localUpdate('friday_posts', id, updates);
  const { error } = await supabase.from('friday_posts').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteFridayPost(id: string): Promise<void> {
  if (!supabase) return localDelete('friday_posts', id);
  const { error } = await supabase.from('friday_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function createTopic(topic: Partial<Topic>): Promise<Topic> {
  if (!supabase) return localCreate('topics', topic);
  const { data, error } = await supabase.from('topics').insert(topic).select().single();
  if (error) throw error;
  return data;
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<void> {
  if (!supabase) return localUpdate('topics', id, updates);
  const { error } = await supabase.from('topics').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTopic(id: string): Promise<void> {
  if (!supabase) return localDelete('topics', id);
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}

export async function createSocialPost(post: Partial<SocialPost>): Promise<SocialPost> {
  if (!supabase) return localCreate('social_posts', post);
  const { data, error } = await supabase.from('social_posts').insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<void> {
  if (!supabase) return localUpdate('social_posts', id, updates);
  const { error } = await supabase.from('social_posts').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteSocialPost(id: string): Promise<void> {
  if (!supabase) return localDelete('social_posts', id);
  const { error } = await supabase.from('social_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<void> {
  if (!supabase) return localUpdate('agents', id, updates);
  const { error } = await supabase.from('agents').update(updates).eq('id', id);
  if (error) throw error;
}
