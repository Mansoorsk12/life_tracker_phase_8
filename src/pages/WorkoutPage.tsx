import { useEffect, useState, useCallback } from 'react';
import { Dumbbell, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal, FullPageLoader } from '@/components/ui';
import { getWorkouts, createWorkout, deleteWorkout } from '@/services/workoutService';
import { checkAchievements } from '@/services/achievementService';
import type { Workout, WorkoutExercise } from '@/types';

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    workout_type: 'strength',
    duration: 30,
    notes: '',
  });
  const [exercises, setExercises] = useState<WorkoutExercise[]>([{ name: '', sets: 3, reps: 10, weight: 0 }]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setWorkouts(await getWorkouts()); } catch { setError('Failed to load workouts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    try {
      const newWorkout = await createWorkout({
        date: form.date,
        workout_type: form.workout_type,
        exercises: exercises.filter((e) => e.name.trim()),
        duration: Number(form.duration),
        notes: form.notes || null,
      });
      setWorkouts((prev) => [newWorkout, ...prev]);
      setShowModal(false);
      setForm({ date: new Date().toISOString().slice(0, 10), workout_type: 'strength', duration: 30, notes: '' });
      setExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
      await checkAchievements({ workoutCount: workouts.length + 1 });
    } catch { setError('Failed to create workout'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch { setError('Failed to delete workout'); }
  };

  if (loading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workouts</h1>
          <p className="mt-1 text-sm text-slate-500">{workouts.length} sessions logged</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Log Workout</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {workouts.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Dumbbell className="h-8 w-8" />} title="No workouts yet" description="Log your first workout to start tracking your fitness journey." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Log Workout</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workouts.map((w) => (
            <Card key={w.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Dumbbell className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize text-slate-800">{w.workout_type}</p>
                    <p className="text-xs text-slate-400">{new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(w.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mb-3 flex gap-2">
                <Badge color="green">{w.duration} min</Badge>
                <Badge color="blue">{w.exercises.length} exercises</Badge>
              </div>
              {w.exercises.length > 0 && (
                <ul className="space-y-1.5">
                  {w.exercises.map((ex, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-slate-600">
                      <span className="truncate font-medium">{ex.name}</span>
                      <span className="text-xs text-slate-400">{ex.sets}×{ex.reps} @ {ex.weight}kg</span>
                    </li>
                  ))}
                </ul>
              )}
              {w.notes && <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">{w.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Workout">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select label="Type" value={form.workout_type} onChange={(e) => setForm({ ...form, workout_type: e.target.value })}>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="general">General</option>
            </Select>
          </div>
          <Input label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Exercises</label>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-4 gap-2">
                  <input className="col-span-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder="Exercise" value={ex.name} onChange={(e) => { const next = [...exercises]; next[i] = { ...ex, name: e.target.value }; setExercises(next); }} />
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" type="number" placeholder="Sets" value={ex.sets} onChange={(e) => { const next = [...exercises]; next[i] = { ...ex, sets: Number(e.target.value) }; setExercises(next); }} />
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" type="number" placeholder="Reps" value={ex.reps} onChange={(e) => { const next = [...exercises]; next[i] = { ...ex, reps: Number(e.target.value) }; setExercises(next); }} />
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" type="number" placeholder="Weight" value={ex.weight} onChange={(e) => { const next = [...exercises]; next[i] = { ...ex, weight: Number(e.target.value) }; setExercises(next); }} />
                </div>
              ))}
            </div>
            <button onClick={() => setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0 }])} className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900">+ Add exercise</button>
          </div>
          <Textarea label="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Log Workout</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
