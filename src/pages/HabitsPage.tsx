import { useEffect, useState, useCallback } from 'react';
import { Repeat, Plus, Trash2, AlertCircle, Flame, Check } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal, FullPageLoader } from '@/components/ui';
import { getHabits, createHabit, deleteHabit, getAllCompletions, toggleCompletion, calculateStreak } from '@/services/habitService';
import { checkAchievements } from '@/services/achievementService';
import type { Habit, HabitCompletion } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', frequency: 'daily' as Habit['frequency'], target_per_week: 7 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, c] = await Promise.all([getHabits(), getAllCompletions()]);
      setHabits(h); setCompletions(c);
    } catch { setError('Failed to load habits'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const newHabit = await createHabit({
        name: form.name,
        description: form.description || null,
        color: form.color,
        frequency: form.frequency,
        target_per_week: Number(form.target_per_week),
      });
      setHabits((prev) => [newHabit, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#3b82f6', frequency: 'daily', target_per_week: 7 });
      await checkAchievements({ hasHabit: true });
    } catch { setError('Failed to create habit'); }
  };

  const handleToggle = async (habitId: string) => {
    try {
      await toggleCompletion(habitId, today());
      const updated = await getAllCompletions();
      setCompletions(updated);
      const maxStreak = Math.max(...habits.map((h) => calculateStreak(updated.filter((c) => c.habit_id === h.id)).current));
      await checkAchievements({ habitStreak: maxStreak });
    } catch { setError('Failed to toggle habit'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCompletions((prev) => prev.filter((c) => c.habit_id !== id));
    } catch { setError('Failed to delete habit'); }
  };

  if (loading) return <FullPageLoader />;

  const todayStr = today();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
          <p className="mt-1 text-sm text-slate-500">{habits.length} habits tracked</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />New Habit</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {habits.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Repeat className="h-8 w-8" />} title="No habits yet" description="Create your first habit to start building consistency." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Create Habit</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
            const { current, best, rate } = calculateStreak(habitCompletions);
            const completedToday = habitCompletions.some((c) => c.date === todayStr);
            return (
              <Card key={habit.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: habit.color }}>
                      <Repeat className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{habit.name}</p>
                      {habit.description && <p className="text-xs text-slate-500">{habit.description}</p>}
                      <div className="mt-1.5 flex gap-2">
                        <Badge color="slate">{habit.frequency}</Badge>
                        <Badge color="amber"><Flame className="mr-1 h-3 w-3" />{current} day streak</Badge>
                        <Badge color="green">Best: {best}</Badge>
                        <Badge color="blue">{rate}% rate</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-colors ${completedToday ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-300 hover:border-slate-400'}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(habit.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Habit">
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Drink water" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as Habit['frequency'] })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
            <Input label="Target per week" type="number" value={form.target_per_week} onChange={(e) => setForm({ ...form, target_per_week: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Habit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
