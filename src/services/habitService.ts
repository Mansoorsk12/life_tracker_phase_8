import { supabase } from '@/lib/supabase';
import type { Habit, HabitCompletion } from '@/types';

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Habit[];
}

export async function createHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();
  if (error) throw error;
  return data as Habit;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function getCompletions(habitId: string): Promise<HabitCompletion[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HabitCompletion[];
}

export async function getAllCompletions(): Promise<HabitCompletion[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as HabitCompletion[];
}

export async function toggleCompletion(habitId: string, date: string): Promise<void> {
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('habit_completions').delete().eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('habit_completions')
      .insert({ habit_id: habitId, date });
    if (error) throw error;
  }
}

export function calculateStreak(completions: HabitCompletion[]): { current: number; best: number; rate: number } {
  if (completions.length === 0) return { current: 0, best: 0, rate: 0 };
  const dates = new Set(completions.map((c) => c.date));
  const sortedDates = Array.from(dates).sort();
  const firstDate = new Date(sortedDates[0] + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let current = 0;
  let best = 0;
  let temp = 0;
  const cursor = new Date(firstDate);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (dates.has(dateStr)) {
      temp++;
      best = Math.max(best, temp);
    } else {
      temp = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const todayStr = today.toISOString().slice(0, 10);
  if (dates.has(todayStr)) {
    current = temp;
  } else {
    current = 0;
  }
  const rate = totalDays > 0 ? Math.round((dates.size / totalDays) * 100) : 0;
  return { current, best, rate };
}
