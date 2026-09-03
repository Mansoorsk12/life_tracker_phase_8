import { supabase } from '@/lib/supabase';
import type { StepEntry } from '@/types';

export async function getSteps(): Promise<StepEntry[]> {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as StepEntry[];
}

export async function getStepByDate(date: string): Promise<StepEntry | null> {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data as StepEntry | null;
}

export async function upsertStep(entry: Omit<StepEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<StepEntry> {
  if (entry.id) {
    const { id, ...updates } = entry;
    const { data, error } = await supabase
      .from('steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as StepEntry;
  }
  const { data, error } = await supabase
    .from('steps')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as StepEntry;
}

export async function deleteStep(id: string): Promise<void> {
  const { error } = await supabase.from('steps').delete().eq('id', id);
  if (error) throw error;
}
