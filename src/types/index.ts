export interface Profile {
  id: string;
  name: string;
  step_goal: number;
  sleep_goal: number;
  protein_goal: number;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  exercises: WorkoutExercise[];
  duration: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionEntry {
  id: string;
  user_id: string;
  date: string;
  food: string;
  quantity: string | null;
  protein: number;
  calories: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
  updated_at: string;
}

export interface StepEntry {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  goal: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepEntry {
  id: string;
  user_id: string;
  date: string;
  sleep_time: string | null;
  wake_time: string | null;
  duration: number;
  quality: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'failed';
  tracking_source: 'manual' | 'auto';
  source_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  frequency: 'daily' | 'weekly';
  target_per_week: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_key: string;
  title: string;
  description: string | null;
  icon: string;
  unlocked_at: string;
}

export interface DevelopmentEntry {
  id: string;
  user_id: string;
  date: string;
  phase: string;
  day: number;
  what_i_built: string | null;
  what_i_learned: string | null;
  problem: string | null;
  solution: string | null;
  time_spent: string | null;
  tomorrow: string | null;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface LearningTopic {
  id: string;
  user_id: string;
  topic: string;
  status: 'not_started' | 'learning' | 'practiced' | 'confident';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CodingProblem {
  id: string;
  user_id: string;
  problem: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not_started' | 'in_progress' | 'completed';
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AuthUser = {
  id: string;
  email: string;
};
