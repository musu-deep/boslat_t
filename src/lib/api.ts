import { supabase } from '@/lib/supabase';
import type { Agent, Task, Content, FridayPost, Topic, SocialPost, Analytics, Template } from '@/types';

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase.from('agents').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchContent(): Promise<Content[]> {
  const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFridayPosts(): Promise<FridayPost[]> {
  const { data, error } = await supabase.from('friday_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase.from('topics').select('*').order('priority', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSocialPosts(): Promise<SocialPost[]> {
  const { data, error } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAnalytics(): Promise<Analytics[]> {
  const { data, error } = await supabase.from('analytics').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase.from('templates').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

// ---- Mutations ----

export async function createTask(task: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function createContent(content: Partial<Content>): Promise<Content> {
  const { data, error } = await supabase.from('content').insert(content).select().single();
  if (error) throw error;
  return data;
}

export async function updateContent(id: string, updates: Partial<Content>): Promise<void> {
  const { error } = await supabase.from('content').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from('content').delete().eq('id', id);
  if (error) throw error;
}

export async function createFridayPost(post: Partial<FridayPost>): Promise<FridayPost> {
  const { data, error } = await supabase.from('friday_posts').insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function updateFridayPost(id: string, updates: Partial<FridayPost>): Promise<void> {
  const { error } = await supabase.from('friday_posts').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteFridayPost(id: string): Promise<void> {
  const { error } = await supabase.from('friday_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function createTopic(topic: Partial<Topic>): Promise<Topic> {
  const { data, error } = await supabase.from('topics').insert(topic).select().single();
  if (error) throw error;
  return data;
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<void> {
  const { error } = await supabase.from('topics').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}

export async function createSocialPost(post: Partial<SocialPost>): Promise<SocialPost> {
  const { data, error } = await supabase.from('social_posts').insert(post).select().single();
  if (error) throw error;
  return data;
}

export async function updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<void> {
  const { error } = await supabase.from('social_posts').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteSocialPost(id: string): Promise<void> {
  const { error } = await supabase.from('social_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<void> {
  const { error } = await supabase.from('agents').update(updates).eq('id', id);
  if (error) throw error;
}
