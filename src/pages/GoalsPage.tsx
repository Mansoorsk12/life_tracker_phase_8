import { useEffect, useState, useCallback } from 'react';
import { Target, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal, FullPageLoader, ProgressBar } from '@/components/ui';
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/services/goalService';
import { checkAchievements } from '@/services/achievementService';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'general', target: 1, current: 0, unit: 'count',
    deadline: '', priority: 'medium' as Goal['priority'], tracking_source: 'manual' as Goal['tracking_source'],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setGoals(await getGoals()); } catch { setError('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const newGoal = await createGoal({
        title: form.title,
        description: form.description || null,
        category: form.category,
        target: Number(form.target),
        current: Number(form.current),
        unit: form.unit,
        deadline: form.deadline || null,
        priority: form.priority,
        status: 'active',
        tracking_source: form.tracking_source,
        source_type: null,
      });
      setGoals((prev) => [newGoal, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', category: 'general', target: 1, current: 0, unit: 'count', deadline: '', priority: 'medium', tracking_source: 'manual' });
      await checkAchievements({ hasGoal: true });
    } catch { setError('Failed to create goal'); }
  };

  const handleUpdateProgress = async (goal: Goal, delta: number) => {
    const newCurrent = Math.max(0, goal.current + delta);
    const updates: Partial<Goal> = { current: newCurrent };
    if (newCurrent >= goal.target) updates.status = 'completed';
    try {
      const updated = await updateGoal(goal.id, updates);
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
    } catch { setError('Failed to update goal'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch { setError('Failed to delete goal'); }
  };

  if (loading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="mt-1 text-sm text-slate-500">{goals.filter((g) => g.status === 'active').length} active, {goals.filter((g) => g.status === 'completed').length} completed</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />New Goal</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {goals.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Target className="h-8 w-8" />} title="No goals yet" description="Set your first goal to start working towards something meaningful." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Create Goal</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{goal.title}</p>
                  {goal.description && <p className="mt-0.5 text-xs text-slate-500">{goal.description}</p>}
                </div>
                <button onClick={() => handleDelete(goal.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge color="blue">{goal.category}</Badge>
                <Badge color={goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'amber' : 'slate'}>{goal.priority}</Badge>
                <Badge color={goal.status === 'completed' ? 'green' : goal.status === 'active' ? 'blue' : 'slate'}>{goal.status}</Badge>
                {goal.deadline && <Badge color="slate">Due: {goal.deadline}</Badge>}
              </div>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{goal.current} / {goal.target} {goal.unit}</span>
                  <span className="text-xs text-slate-400">{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <ProgressBar value={goal.current} max={goal.target} />
              </div>
              {goal.status === 'active' && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleUpdateProgress(goal, -1)}>-1</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleUpdateProgress(goal, 1)}>+1</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleUpdateProgress(goal, 5)}>+5</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Goal">
        <div className="space-y-4">
          <Input label="Title" placeholder="What do you want to achieve?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} />
            <Input label="Unit" placeholder="count, hours, kg..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Goal['priority'] })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <Input label="Category" placeholder="general, fitness, learning..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Goal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
