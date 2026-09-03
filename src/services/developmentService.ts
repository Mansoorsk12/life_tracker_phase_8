import { supabase } from '@/lib/supabase';
import type { DevelopmentEntry, LearningTopic, CodingProblem } from '@/types';

export async function getDevelopment(): Promise<DevelopmentEntry[]> {
  const { data, error } = await supabase
    .from('development')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as DevelopmentEntry[];
}

export async function createDevelopment(entry: Omit<DevelopmentEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DevelopmentEntry> {
  const { data, error } = await supabase
    .from('development')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as DevelopmentEntry;
}

export async function updateDevelopment(id: string, updates: Partial<DevelopmentEntry>): Promise<DevelopmentEntry> {
  const { data, error } = await supabase
    .from('development')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DevelopmentEntry;
}

export async function deleteDevelopment(id: string): Promise<void> {
  const { error } = await supabase.from('development').delete().eq('id', id);
  if (error) throw error;
}

export async function getLearning(): Promise<LearningTopic[]> {
  const { data, error } = await supabase
    .from('learning')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as LearningTopic[];
}

export async function createLearning(topic: Omit<LearningTopic, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LearningTopic> {
  const { data, error } = await supabase
    .from('learning')
    .insert(topic)
    .select()
    .single();
  if (error) throw error;
  return data as LearningTopic;
}

export async function updateLearning(id: string, updates: Partial<LearningTopic>): Promise<LearningTopic> {
  const { data, error } = await supabase
    .from('learning')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as LearningTopic;
}

export async function deleteLearning(id: string): Promise<void> {
  const { error } = await supabase.from('learning').delete().eq('id', id);
  if (error) throw error;
}

export async function getCoding(): Promise<CodingProblem[]> {
  const { data, error } = await supabase
    .from('coding')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as CodingProblem[];
}

export async function createCoding(problem: Omit<CodingProblem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CodingProblem> {
  const { data, error } = await supabase
    .from('coding')
    .insert(problem)
    .select()
    .single();
  if (error) throw error;
  return data as CodingProblem;
}

export async function updateCoding(id: string, updates: Partial<CodingProblem>): Promise<CodingProblem> {
  const { data, error } = await supabase
    .from('coding')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CodingProblem;
}

export async function deleteCoding(id: string): Promise<void> {
  const { error } = await supabase.from('coding').delete().eq('id', id);
  if (error) throw error;
}
