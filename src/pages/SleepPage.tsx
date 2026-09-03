import { useEffect, useState, useCallback } from 'react';
import { Moon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal, FullPageLoader } from '@/components/ui';
import { getSleep, createSleep, deleteSleep, calculateDuration } from '@/services/sleepService';
import { checkAchievements } from '@/services/achievementService';
import type { SleepEntry } from '@/types';

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    sleep_time: '',
    wake_time: '',
    quality: 3,
    notes: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setEntries(await getSleep()); } catch { setError('Failed to load sleep data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    try {
      const duration = calculateDuration(form.sleep_time, form.wake_time);
      const newEntry = await createSleep({
        date: form.date,
        sleep_time: form.sleep_time || null,
        wake_time: form.wake_time || null,
        duration,
        quality: Number(form.quality),
        notes: form.notes || null,
      });
      setEntries((prev) => [newEntry, ...prev]);
      setShowModal(false);
      setForm({ date: new Date().toISOString().slice(0, 10), sleep_time: '', wake_time: '', quality: 3, notes: '' });
      await checkAchievements({ hasSleep: true });
    } catch { setError('Failed to log sleep'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSleep(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch { setError('Failed to delete entry'); }
  };

  if (loading) return <FullPageLoader />;

  const qualityLabels = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sleep</h1>
          <p className="mt-1 text-sm text-slate-500">{entries.length} nights logged</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Log Sleep</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {entries.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Moon className="h-8 w-8" />} title="No sleep records" description="Log your sleep to track your rest and recovery patterns." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Log Sleep</Button>} />
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Moon className="h-[18px] w-[18px]" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-400">
                      {entry.sleep_time ? new Date(entry.sleep_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'} → {entry.wake_time ? new Date(entry.wake_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="purple">{entry.duration}h</Badge>
                  <Badge color={entry.quality >= 4 ? 'green' : entry.quality >= 3 ? 'amber' : 'red'}>{qualityLabels[entry.quality]}</Badge>
                  <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {entry.notes && <p className="mt-2 border-t border-slate-100 pt-2 text-sm text-slate-500">{entry.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Sleep">
        <div className="space-y-4">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sleep Time" type="datetime-local" value={form.sleep_time} onChange={(e) => setForm({ ...form, sleep_time: e.target.value })} />
            <Input label="Wake Time" type="datetime-local" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} />
          </div>
          <Select label="Quality" value={String(form.quality)} onChange={(e) => setForm({ ...form, quality: Number(e.target.value) })}>
            <option value="1">Poor</option>
            <option value="2">Fair</option>
            <option value="3">OK</option>
            <option value="4">Good</option>
            <option value="5">Great</option>
          </Select>
          <Textarea label="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Log Sleep</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
