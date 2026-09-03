import { useEffect, useState, useCallback } from 'react';
import { BarChart3, AlertCircle, TrendingUp, Activity, Dumbbell, Apple, Footprints, Moon, Target, Repeat } from 'lucide-react';
import { Card, Select, FullPageLoader, ProgressBar, EmptyState, Badge } from '@/components/ui';
import { getTasks } from '@/services/taskService';
import { getWorkouts } from '@/services/workoutService';
import { getNutrition } from '@/services/nutritionService';
import { getSteps } from '@/services/stepService';
import { getSleep } from '@/services/sleepService';
import { getHabits, getAllCompletions, calculateStreak } from '@/services/habitService';
import { getGoals } from '@/services/goalService';
import { getDevelopment } from '@/services/developmentService';
import { useAuth } from '@/context/AuthContext';
import type { Task, Workout, NutritionEntry, StepEntry, SleepEntry, Habit, HabitCompletion, Goal, DevelopmentEntry } from '@/types';

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(30);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>([]);
  const [steps, setSteps] = useState<StepEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [devEntries, setDevEntries] = useState<DevelopmentEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, w, n, s, sl, h, c, g, d] = await Promise.all([
        getTasks(), getWorkouts(), getNutrition(), getSteps(), getSleep(),
        getHabits(), getAllCompletions(), getGoals(), getDevelopment(),
      ]);
      setTasks(t); setWorkouts(w); setNutrition(n); setSteps(s); setSleep(sl);
      setHabits(h); setCompletions(c); setGoals(g); setDevEntries(d);
    } catch { setError('Failed to load analytics'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <FullPageLoader />;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const inRange = (date: string) => date >= cutoffStr;

  const rangeTasks = tasks.filter((t) => inRange(t.created_at.slice(0, 10)));
  const rangeWorkouts = workouts.filter((w) => inRange(w.date));
  const rangeNutrition = nutrition.filter((n) => inRange(n.date));
  const rangeSteps = steps.filter((s) => inRange(s.date));
  const rangeSleep = sleep.filter((s) => inRange(s.date));
  const rangeDev = devEntries.filter((d) => inRange(d.date));

  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const totalSteps = rangeSteps.reduce((sum, s) => sum + s.steps, 0);
  const avgSteps = rangeSteps.length > 0 ? Math.round(totalSteps / rangeSteps.length) : 0;
  const stepGoalDays = rangeSteps.filter((s) => s.steps >= s.goal).length;
  const avgSleep = rangeSleep.length > 0 ? (rangeSleep.reduce((sum, s) => sum + Number(s.duration), 0) / rangeSleep.length).toFixed(1) : '0';
  const avgSleepQuality = rangeSleep.length > 0 ? (rangeSleep.reduce((sum, s) => sum + s.quality, 0) / rangeSleep.length).toFixed(1) : '0';
  const totalProtein = rangeNutrition.reduce((sum, n) => sum + Number(n.protein), 0);
  const totalCalories = rangeNutrition.reduce((sum, n) => sum + Number(n.calories), 0);
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const bestHabitStreak = habits.length > 0 ? Math.max(...habits.map((h) => calculateStreak(completions.filter((c) => c.habit_id === h.id)).best)) : 0;

  // Simple bar chart data for steps
  const last7Steps = rangeSteps.slice(0, 7).reverse();
  const maxStep = Math.max(...last7Steps.map((s) => s.steps), 1);

  const hasData = tasks.length > 0 || workouts.length > 0 || nutrition.length > 0 || steps.length > 0 || sleep.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Insights from your tracked data</p>
        </div>
        <Select value={String(range)} onChange={(e) => setRange(Number(e.target.value))}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {!hasData ? (
        <Card className="p-6"><EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No data to analyze" description="Start tracking your activities to see analytics and insights here." /></Card>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><TrendingUp className="h-4 w-4" /><span className="text-xs font-medium">Task Completion</span></div>
              <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
              <p className="mt-1 text-xs text-slate-400">{completedTasks.length}/{tasks.length} total</p>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><Dumbbell className="h-4 w-4" /><span className="text-xs font-medium">Workouts</span></div>
              <p className="text-2xl font-bold text-slate-900">{rangeWorkouts.length}</p>
              <p className="mt-1 text-xs text-slate-400">in {range} days</p>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><Footprints className="h-4 w-4" /><span className="text-xs font-medium">Avg Steps</span></div>
              <p className="text-2xl font-bold text-slate-900">{avgSteps.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400">{stepGoalDays} goal days</p>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><Moon className="h-4 w-4" /><span className="text-xs font-medium">Avg Sleep</span></div>
              <p className="text-2xl font-bold text-slate-900">{avgSleep}h</p>
              <p className="mt-1 text-xs text-slate-400">Quality: {avgSleepQuality}/5</p>
            </Card>
          </div>

          {/* Steps chart */}
          {last7Steps.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-4 font-semibold text-slate-900">Steps (Last 7 Days)</h2>
              <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
                {last7Steps.map((s) => (
                  <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-slate-500">{Number(s.steps).toLocaleString()}</span>
                    <div className="w-full rounded-t-lg bg-cyan-500 transition-all" style={{ height: `${(s.steps / maxStep) * 100}px` }} />
                    <span className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed stats */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2"><Apple className="h-5 w-5 text-orange-500" /><h2 className="font-semibold text-slate-900">Nutrition</h2></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Total Protein</span><span className="font-bold text-slate-900">{Math.round(totalProtein)}g</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Total Calories</span><span className="font-bold text-slate-900">{Math.round(totalCalories)} kcal</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Entries Logged</span><span className="font-bold text-slate-900">{rangeNutrition.length}</span></div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-slate-900">Goals</h2></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Active</span><Badge color="blue">{activeGoals}</Badge></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Completed</span><Badge color="green">{completedGoals}</Badge></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Total Created</span><span className="font-bold text-slate-900">{goals.length}</span></div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2"><Repeat className="h-5 w-5 text-pink-500" /><h2 className="font-semibold text-slate-900">Habits</h2></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Tracked Habits</span><span className="font-bold text-slate-900">{habits.length}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Best Streak</span><Badge color="amber">{bestHabitStreak} days</Badge></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Completions ({range}d)</span><span className="font-bold text-slate-900">{completions.filter((c) => inRange(c.date)).length}</span></div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-slate-500" /><h2 className="font-semibold text-slate-900">Development</h2></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Entries ({range}d)</span><span className="font-bold text-slate-900">{rangeDev.length}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Total Entries</span><span className="font-bold text-slate-900">{devEntries.length}</span></div>
                {devEntries.length > 0 && (
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Avg Confidence</span><span className="font-bold text-slate-900">{(devEntries.reduce((sum, d) => sum + d.confidence, 0) / devEntries.length).toFixed(1)}/5</span></div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
