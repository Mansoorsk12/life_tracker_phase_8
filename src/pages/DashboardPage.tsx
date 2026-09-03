import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Dumbbell, Apple, Footprints, Moon, Target, Repeat, Code2,
  TrendingUp, Flame, Trophy, ArrowRight, Plus,
} from 'lucide-react';
import { Card, ProgressBar, FullPageLoader, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getTasks } from '@/services/taskService';
import { getWorkouts } from '@/services/workoutService';
import { getNutrition } from '@/services/nutritionService';
import { getSteps } from '@/services/stepService';
import { getSleep } from '@/services/sleepService';
import { getHabits, getAllCompletions, calculateStreak } from '@/services/habitService';
import { getGoals } from '@/services/goalService';
import { getDevelopment } from '@/services/developmentService';
import { getAchievements } from '@/services/achievementService';
import type { Task, Workout, NutritionEntry, StepEntry, SleepEntry, Habit, HabitCompletion, Goal, DevelopmentEntry, Achievement } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

export default function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>([]);
  const [steps, setSteps] = useState<StepEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [devEntries, setDevEntries] = useState<DevelopmentEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [t, w, n, s, sl, h, c, g, d, a] = await Promise.all([
          getTasks(), getWorkouts(), getNutrition(), getSteps(), getSleep(),
          getHabits(), getAllCompletions(), getGoals(), getDevelopment(), getAchievements(),
        ]);
        setTasks(t); setWorkouts(w); setNutrition(n); setSteps(s); setSleep(sl);
        setHabits(h); setCompletions(c); setGoals(g); setDevEntries(d); setAchievements(a);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullPageLoader />;

  const todayStr = today();
  const todaysTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const todaysSteps = steps.find((s) => s.date === todayStr);
  const todaysNutrition = nutrition.filter((n) => n.date === todayStr);
  const todaysSleep = sleep.find((s) => s.date === todayStr);
  const activeGoals = goals.filter((g) => g.status === 'active');
  const todayCompletions = completions.filter((c) => c.date === todayStr);
  const bestHabitStreak = habits.length > 0
    ? Math.max(...habits.map((h) => calculateStreak(completions.filter((c) => c.habit_id === h.id)).current))
    : 0;

  const totalProtein = todaysNutrition.reduce((sum, n) => sum + Number(n.protein), 0);
  const totalCalories = todaysNutrition.reduce((sum, n) => sum + Number(n.calories), 0);
  const isEmpty = tasks.length === 0 && workouts.length === 0 && nutrition.length === 0 && steps.length === 0 && sleep.length === 0 && habits.length === 0 && goals.length === 0;

  const stats = [
    { label: 'Pending Tasks', value: todaysTasks.length, total: tasks.length, icon: CheckSquare, to: '/tasks', color: 'text-blue-600 bg-blue-50' },
    { label: 'Workouts', value: workouts.length, icon: Dumbbell, to: '/workout', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Protein Today', value: `${Math.round(totalProtein)}g`, total: profile?.protein_goal ?? 150, icon: Apple, to: '/nutrition', color: 'text-orange-600 bg-orange-50' },
    { label: 'Steps Today', value: todaysSteps?.steps?.toLocaleString() ?? '0', total: todaysSteps?.goal ?? profile?.step_goal ?? 10000, icon: Footprints, to: '/steps', color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Sleep Last', value: todaysSleep ? `${todaysSleep.duration}h` : '—', icon: Moon, to: '/sleep', color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Goals', value: activeGoals.length, icon: Target, to: '/goals', color: 'text-amber-600 bg-amber-50' },
    { label: 'Habits Today', value: `${todayCompletions.length}/${habits.length}`, icon: Repeat, to: '/habits', color: 'text-pink-600 bg-pink-50' },
    { label: 'Dev Entries', value: devEntries.length, icon: Code2, to: '/development', color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {isEmpty ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Welcome to LifeTrack</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Let's start tracking your progress. Pick any category below to create your first entry.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                { label: 'Create First Task', to: '/tasks', icon: CheckSquare },
                { label: 'Log Workout', to: '/workout', icon: Dumbbell },
                { label: 'Add Nutrition', to: '/nutrition', icon: Apple },
                { label: 'Add Steps', to: '/steps', icon: Footprints },
                { label: 'Log Sleep', to: '/sleep', icon: Moon },
                { label: 'Create Goal', to: '/goals', icon: Target },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to}>
                    <Button variant="secondary" size="sm">
                      <Icon className="mr-1.5 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} to={stat.to}>
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
                    {stat.total && (
                      <div className="mt-2">
                        <ProgressBar value={typeof stat.value === 'string' ? 0 : stat.value} max={stat.total} />
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's tasks */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Today's Tasks</h2>
                <Link to="/tasks"><Plus className="h-4 w-4 text-slate-400 hover:text-slate-600" /></Link>
              </div>
              {todaysTasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  {completedTasks.length > 0 ? 'All tasks completed!' : 'No tasks yet'}
                </p>
              ) : (
                <ul className="space-y-2">
                  {todaysTasks.slice(0, 5).map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      <span className="truncate text-slate-700">{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Active goals */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Active Goals</h2>
                <Link to="/goals"><Plus className="h-4 w-4 text-slate-400 hover:text-slate-600" /></Link>
              </div>
              {activeGoals.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No active goals</p>
              ) : (
                <ul className="space-y-3">
                  {activeGoals.slice(0, 4).map((goal) => (
                    <li key={goal.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="truncate font-medium text-slate-700">{goal.title}</span>
                        <span className="text-xs text-slate-400">{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <ProgressBar value={goal.current} max={goal.target} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Quick highlights */}
            <Card className="p-5">
              <h2 className="mb-4 font-semibold text-slate-900">Highlights</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Best Habit Streak</p>
                    <p className="text-xs text-slate-500">{bestHabitStreak} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Achievements</p>
                    <p className="text-xs text-slate-500">{achievements.length} unlocked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Tasks Completed</p>
                    <p className="text-xs text-slate-500">{completedTasks.length} total</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
