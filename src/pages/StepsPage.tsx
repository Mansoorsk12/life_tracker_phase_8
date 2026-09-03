import { useEffect, useState, useCallback } from 'react';
import { Footprints, AlertCircle, Plus } from 'lucide-react';
import { Card, Button, Input, Textarea, FullPageLoader, ProgressBar, EmptyState } from '@/components/ui';
import { getSteps, upsertStep, deleteStep } from '@/services/stepService';
import { checkAchievements } from '@/services/achievementService';
import { useAuth } from '@/context/AuthContext';
import type { StepEntry } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

export default function StepsPage() {
  const { profile } = useAuth();
  const [steps, setSteps] = useState<StepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todaySteps, setTodaySteps] = useState<StepEntry | null>(null);
  const [stepInput, setStepInput] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getSteps();
      setSteps(all);
      const todayEntry = all.find((s) => s.date === today()) ?? null;
      setTodaySteps(todayEntry);
      setStepInput(todayEntry ? String(todayEntry.steps) : '');
      setNotes(todayEntry?.notes ?? '');
    } catch { setError('Failed to load steps'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const count = Number(stepInput);
    if (!count && count !== 0) return;
    try {
      const goal = todaySteps?.goal ?? profile?.step_goal ?? 10000;
      const saved = await upsertStep({
        id: todaySteps?.id,
        date: today(),
        steps: count,
        goal,
        notes: notes || null,
      });
      setTodaySteps(saved);
      setSteps((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
      await checkAchievements({ hasStep: true });
    } catch { setError('Failed to save steps'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStep(id);
      setSteps((prev) => prev.filter((s) => s.id !== id));
      if (todaySteps?.id === id) { setTodaySteps(null); setStepInput(''); setNotes(''); }
    } catch { setError('Failed to delete entry'); }
  };

  if (loading) return <FullPageLoader />;

  const goal = todaySteps?.goal ?? profile?.step_goal ?? 10000;
  const pct = goal > 0 ? Math.min(100, (Number(todaySteps?.steps ?? 0) / goal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Steps</h1>
        <p className="mt-1 text-sm text-slate-500">Track your daily step count</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {/* Today's step input */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Footprints className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold text-slate-800">Today's Steps</p>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">{Number(todaySteps?.steps ?? 0).toLocaleString()}</span>
            <span className="text-sm text-slate-400">/ {goal.toLocaleString()} steps</span>
          </div>
          <ProgressBar value={Number(todaySteps?.steps ?? 0)} max={goal} />
          {pct >= 100 && <p className="mt-2 text-sm font-medium text-emerald-600">Goal reached!</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Steps" type="number" placeholder="0" value={stepInput} onChange={(e) => setStepInput(e.target.value)} />
          <div className="sm:col-span-1">
            <Textarea label="Notes" rows={1} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSave} className="w-full">Save Steps</Button>
          </div>
        </div>
      </Card>

      {/* History */}
      {steps.length === 0 ? (
        <Card className="p-6"><EmptyState icon={<Footprints className="h-8 w-8" />} title="No step history" description="Start logging your daily steps above." /></Card>
      ) : (
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-900">History</h2>
          <div className="space-y-2">
            {steps.slice(0, 14).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  {s.notes && <p className="text-xs text-slate-400">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{Number(s.steps).toLocaleString()}</span>
                  {s.steps >= s.goal && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Goal</span>}
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-slate-400 hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
