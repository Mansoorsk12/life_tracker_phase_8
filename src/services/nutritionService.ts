import { supabase } from '@/lib/supabase';
import type { NutritionEntry } from '@/types';

export async function getNutrition(): Promise<NutritionEntry[]> {
  const { data, error } = await supabase
    .from('nutrition')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as NutritionEntry[];
}

export async function createNutrition(entry: Omit<NutritionEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<NutritionEntry> {
  const { data, error } = await supabase
    .from('nutrition')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as NutritionEntry;
}

export async function updateNutrition(id: string, updates: Partial<NutritionEntry>): Promise<NutritionEntry> {
  const { data, error } = await supabase
    .from('nutrition')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as NutritionEntry;
}

export async function deleteNutrition(id: string): Promise<void> {
  const { error } = await supabase.from('nutrition').delete().eq('id', id);
  if (error) throw error;
}
