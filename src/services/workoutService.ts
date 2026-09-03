import { supabase } from '@/lib/supabase';
import type { Workout } from '@/types';

export async function getWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Workout[];
}

export async function createWorkout(workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();
  if (error) throw error;
  return data as Workout;
}

export async function updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Workout;
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) throw error;
}
