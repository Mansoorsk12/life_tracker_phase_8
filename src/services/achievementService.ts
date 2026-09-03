import { supabase } from '@/lib/supabase';
import type { Achievement } from '@/types';

export const ACHIEVEMENT_DEFINITIONS = [
  { key: 'first_task', title: 'First Task', description: 'Complete your first task', icon: 'check-circle' },
  { key: 'first_workout', title: 'First Workout', description: 'Log your first workout', icon: 'dumbbell' },
  { key: 'first_nutrition', title: 'First Meal', description: 'Log your first nutrition entry', icon: 'apple' },
  { key: 'first_step', title: 'First Steps', description: 'Log your first step count', icon: 'footprints' },
  { key: 'first_sleep', title: 'First Sleep', description: 'Log your first sleep record', icon: 'moon' },
  { key: 'first_goal', title: 'First Goal', description: 'Create your first goal', icon: 'target' },
  { key: 'first_habit', title: 'First Habit', description: 'Create your first habit', icon: 'repeat' },
  { key: 'first_dev', title: 'First Entry', description: 'Log your first development entry', icon: 'code' },
  { key: 'step_goal_7', title: 'Step Streak', description: 'Reach step goal 7 days in a row', icon: 'trophy' },
  { key: 'habit_streak_7', title: 'Habit Master', description: '7-day habit streak', icon: 'flame' },
  { key: 'workout_10', title: 'Fitness Dedication', description: 'Complete 10 workouts', icon: 'medal' },
  { key: 'task_50', title: 'Task Master', description: 'Complete 50 tasks', icon: 'list-checks' },
] as const;

export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('unlocked_at', { ascending: false });
  if (error) throw error;
  return data as Achievement[];
}

export async function unlockAchievement(achievementKey: string): Promise<void> {
  const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === achievementKey);
  if (!def) return;
  const { data: existing } = await supabase
    .from('achievements')
    .select('id')
    .eq('achievement_key', achievementKey)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from('achievements').insert({
    achievement_key: def.key,
    title: def.title,
    description: def.description,
    icon: def.icon,
  });
  if (error) throw error;
}

export async function checkAchievements(context: {
  taskCount?: number;
  workoutCount?: number;
  stepStreak?: number;
  habitStreak?: number;
  hasNutrition?: boolean;
  hasSleep?: boolean;
  hasGoal?: boolean;
  hasHabit?: boolean;
  hasDev?: boolean;
  hasStep?: boolean;
}) {
  const promises: Promise<void>[] = [];
  if (context.taskCount && context.taskCount >= 1) promises.push(unlockAchievement('first_task'));
  if (context.taskCount && context.taskCount >= 50) promises.push(unlockAchievement('task_50'));
  if (context.workoutCount && context.workoutCount >= 1) promises.push(unlockAchievement('first_workout'));
  if (context.workoutCount && context.workoutCount >= 10) promises.push(unlockAchievement('workout_10'));
  if (context.hasNutrition) promises.push(unlockAchievement('first_nutrition'));
  if (context.hasStep) promises.push(unlockAchievement('first_step'));
  if (context.stepStreak && context.stepStreak >= 7) promises.push(unlockAchievement('step_goal_7'));
  if (context.hasSleep) promises.push(unlockAchievement('first_sleep'));
  if (context.hasGoal) promises.push(unlockAchievement('first_goal'));
  if (context.hasHabit) promises.push(unlockAchievement('first_habit'));
  if (context.habitStreak && context.habitStreak >= 7) promises.push(unlockAchievement('habit_streak_7'));
  if (context.hasDev) promises.push(unlockAchievement('first_dev'));
  await Promise.all(promises);
}
