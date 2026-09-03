import { useEffect, useState, useCallback } from 'react';
import { Apple, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, EmptyState, Modal, FullPageLoader, ProgressBar } from '@/components/ui';
import { getNutrition, createNutrition, deleteNutrition } from '@/services/nutritionService';
import { checkAchievements } from '@/services/achievementService';
import { useAuth } from '@/context/AuthContext';
import type { NutritionEntry } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

export default function NutritionPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: today(), food: '', quantity: '', protein: 0, calories: 0, meal_type: 'snack' as NutritionEntry['meal_type'],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setEntries(await getNutrition()); } catch { setError('Failed to load nutrition'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.food.trim()) return;
    try {
      const newEntry = await createNutrition({
        date: form.date,
        food: form.food,
        quantity: form.quantity || null,
        protein: Number(form.protein),
        calories: Number(form.calories),
        meal_type: form.meal_type,
      });
      setEntries((prev) => [newEntry, ...prev]);
      setShowModal(false);
      setForm({ date: today(), food: '', quantity: '', protein: 0, calories: 0, meal_type: 'snack' });
      await checkAchievements({ hasNutrition: true });
    } catch { setError('Failed to add nutrition entry'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNutrition(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch { setError('Failed to delete entry'); }
  };

  if (loading) return <FullPageLoader />;

  const todayStr = today();
  const todaysEntries = entries.filter((e) => e.date === todayStr);
  const totalProtein = todaysEntries.reduce((sum, e) => sum + Number(e.protein), 0);
  const totalCalories = todaysEntries.reduce((sum, e) => sum + Number(e.calories), 0);
  const proteinGoal = profile?.protein_goal ?? 150;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nutrition</h1>
          <p className="mt-1 text-sm text-slate-500">{entries.length} entries logged</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Add Food</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {/* Today's summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Protein Today</p>
            <span className="text-sm font-bold text-slate-900">{Math.round(totalProtein)}g / {proteinGoal}g</span>
          </div>
          <ProgressBar value={totalProtein} max={proteinGoal} />
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Calories Today</p>
            <span className="text-sm font-bold text-slate-900">{Math.round(totalCalories)} kcal</span>
          </div>
          <ProgressBar value={totalCalories} max={2500} className="bg-orange-100" />
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Apple className="h-8 w-8" />} title="No nutrition entries" description="Track your food intake to monitor your protein and calorie consumption." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Add Food</Button>} />
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Apple className="h-[18px] w-[18px]" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.food}</p>
                    <p className="text-xs text-slate-400">{entry.date}{entry.quantity ? ` · ${entry.quantity}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="amber">{Math.round(Number(entry.protein))}g protein</Badge>
                  <Badge color="slate">{Math.round(Number(entry.calories))} kcal</Badge>
                  <Badge color="blue" >{entry.meal_type}</Badge>
                  <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Food">
        <div className="space-y-4">
          <Input label="Food" placeholder="e.g. Chicken breast" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" placeholder="e.g. 200g" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Select label="Meal" value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value as NutritionEntry['meal_type'] })}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Protein (g)" type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} />
            <Input label="Calories" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} />
          </div>
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Food</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
