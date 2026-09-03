import { useEffect, useState, useCallback } from 'react';
import { CheckSquare, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, EmptyState, Modal, FullPageLoader } from '@/components/ui';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskComplete } from '@/services/taskService';
import { checkAchievements } from '@/services/achievementService';
import type { Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as Task['priority'], category: 'general', due_date: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await getTasks()); } catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const newTask = await createTask({
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        category: form.category,
        due_date: form.due_date || null,
        completed: false,
      });
      setTasks((prev) => [newTask, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'medium', category: 'general', due_date: '' });
      await checkAchievements({ taskCount: tasks.length + 1 });
    } catch { setError('Failed to create task'); }
  };

  const handleToggle = async (task: Task) => {
    try {
      const updated = await toggleTaskComplete(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch { setError('Failed to update task'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { setError('Failed to delete task'); }
  };

  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed
  );

  if (loading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">{tasks.filter((t) => !t.completed).length} pending, {tasks.filter((t) => t.completed).length} completed</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />New Task</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<CheckSquare className="h-8 w-8" />} title="No tasks yet" description="Create your first task to start tracking what you need to do." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Create Task</Button>} />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start gap-3">
                <button onClick={() => handleToggle(task)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${task.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-slate-400'}`}>
                  {task.completed && <Check className="h-3 w-3" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</p>
                  {task.description && <p className="mt-0.5 text-xs text-slate-500">{task.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'slate'}>{task.priority}</Badge>
                    <Badge color="blue">{task.category}</Badge>
                    {task.due_date && <Badge color="slate">Due: {task.due_date}</Badge>}
                  </div>
                </div>
                <button onClick={() => handleDelete(task.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Task">
        <div className="space-y-4">
          <Input label="Title" placeholder="What do you need to do?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description (optional)" placeholder="Add details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input label="Category" placeholder="general" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
