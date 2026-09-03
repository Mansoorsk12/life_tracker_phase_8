import { supabase } from '@/lib/supabase';
import type { SleepEntry } from '@/types';

export async function getSleep(): Promise<SleepEntry[]> {
  const { data, error } = await supabase
    .from('sleep')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as SleepEntry[];
}

export async function createSleep(entry: Omit<SleepEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SleepEntry> {
  const { data, error } = await supabase
    .from('sleep')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as SleepEntry;
}

export async function updateSleep(id: string, updates: Partial<SleepEntry>): Promise<SleepEntry> {
  const { data, error } = await supabase
    .from('sleep')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as SleepEntry;
}

export async function deleteSleep(id: string): Promise<void> {
  const { error } = await supabase.from('sleep').delete().eq('id', id);
  if (error) throw error;
}

export function calculateDuration(sleepTime: string, wakeTime: string): number {
  if (!sleepTime || !wakeTime) return 0;
  const sleep = new Date(sleepTime);
  const wake = new Date(wakeTime);
  let diff = (wake.getTime() - sleep.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return Math.round(diff * 100) / 100;
}
