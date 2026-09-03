import { useEffect, useState, useCallback } from 'react';
import { Code2, Plus, Trash2, AlertCircle, BookOpen, Terminal } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, Modal, FullPageLoader, ProgressBar } from '@/components/ui';
import {
  getDevelopment, createDevelopment, updateDevelopment, deleteDevelopment,
  getLearning, createLearning, updateLearning, deleteLearning,
  getCoding, createCoding, updateCoding, deleteCoding,
} from '@/services/developmentService';
import { checkAchievements } from '@/services/achievementService';
import type { DevelopmentEntry, LearningTopic, CodingProblem } from '@/types';

type Tab = 'dev' | 'learning' | 'coding';

export default function DevelopmentPage() {
  const [tab, setTab] = useState<Tab>('dev');
  const [devEntries, setDevEntries] = useState<DevelopmentEntry[]>([]);
  const [learning, setLearning] = useState<LearningTopic[]>([]);
  const [coding, setCoding] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [devForm, setDevForm] = useState({
    date: new Date().toISOString().slice(0, 10), phase: 'Phase 7', day: 1,
    what_i_built: '', what_i_learned: '', problem: '', solution: '', time_spent: '', tomorrow: '', confidence: 3,
  });
  const [learnForm, setLearnForm] = useState({ topic: '', status: 'not_started' as LearningTopic['status'] });
  const [codeForm, setCodeForm] = useState({
    problem: '', topic: 'general', difficulty: 'medium' as CodingProblem['difficulty'],
    status: 'not_started' as CodingProblem['status'], notes: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, l, c] = await Promise.all([getDevelopment(), getLearning(), getCoding()]);
      setDevEntries(d); setLearning(l); setCoding(c);
    } catch { setError('Failed to load development data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Dev handlers
  const handleCreateDev = async () => {
    try {
      const entry = await createDevelopment({
        date: devForm.date, phase: devForm.phase, day: Number(devForm.day),
        what_i_built: devForm.what_i_built || null, what_i_learned: devForm.what_i_learned || null,
        problem: devForm.problem || null, solution: devForm.solution || null,
        time_spent: devForm.time_spent || null, tomorrow: devForm.tomorrow || null,
        confidence: Number(devForm.confidence),
      });
      setDevEntries((prev) => [entry, ...prev]);
      setShowModal(false);
      await checkAchievements({ hasDev: true });
    } catch { setError('Failed to create entry'); }
  };

  const handleDeleteDev = async (id: string) => {
    try { await deleteDevelopment(id); setDevEntries((prev) => prev.filter((e) => e.id !== id)); }
    catch { setError('Failed to delete entry'); }
  };

  // Learning handlers
  const handleCreateLearn = async () => {
    if (!learnForm.topic.trim()) return;
    try {
      const entry = await createLearning({ topic: learnForm.topic, status: learnForm.status, notes: null });
      setLearning((prev) => [entry, ...prev]);
      setShowModal(false);
      setLearnForm({ topic: '', status: 'not_started' });
    } catch { setError('Failed to add topic'); }
  };

  const handleUpdateLearn = async (id: string, status: LearningTopic['status']) => {
    try { const updated = await updateLearning(id, { status }); setLearning((prev) => prev.map((l) => (l.id === id ? updated : l))); }
    catch { setError('Failed to update topic'); }
  };

  const handleDeleteLearn = async (id: string) => {
    try { await deleteLearning(id); setLearning((prev) => prev.filter((l) => l.id !== id)); }
    catch { setError('Failed to delete topic'); }
  };

  // Coding handlers
  const handleCreateCode = async () => {
    if (!codeForm.problem.trim()) return;
    try {
      const entry = await createCoding({
        problem: codeForm.problem, topic: codeForm.topic, difficulty: codeForm.difficulty,
        status: codeForm.status, date: new Date().toISOString().slice(0, 10), notes: codeForm.notes || null,
      });
      setCoding((prev) => [entry, ...prev]);
      setShowModal(false);
      setCodeForm({ problem: '', topic: 'general', difficulty: 'medium', status: 'not_started', notes: '' });
    } catch { setError('Failed to add problem'); }
  };

  const handleUpdateCode = async (id: string, status: CodingProblem['status']) => {
    try { const updated = await updateCoding(id, { status }); setCoding((prev) => prev.map((c) => (c.id === id ? updated : c))); }
    catch { setError('Failed to update problem'); }
  };

  const handleDeleteCode = async (id: string) => {
    try { await deleteCoding(id); setCoding((prev) => prev.filter((c) => c.id !== id)); }
    catch { setError('Failed to delete problem'); }
  };

  if (loading) return <FullPageLoader />;

  const tabs: { key: Tab; label: string; icon: typeof Code2 }[] = [
    { key: 'dev', label: 'Daily Tracker', icon: Code2 },
    { key: 'learning', label: 'Learning', icon: BookOpen },
    { key: 'coding', label: 'Coding Practice', icon: Terminal },
  ];

  const statusColors: Record<string, 'slate' | 'blue' | 'amber' | 'green'> = {
    not_started: 'slate', learning: 'blue', practiced: 'amber', confident: 'green', in_progress: 'amber', completed: 'green',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Development</h1>
          <p className="mt-1 text-sm text-slate-500">Track your daily progress, learning, and coding practice</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />{tab === 'dev' ? 'New Entry' : tab === 'learning' ? 'Add Topic' : 'Add Problem'}</Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <Icon className="h-4 w-4" />{t.label}
            </button>
          );
        })}
      </div>

      {/* Dev tab */}
      {tab === 'dev' && (
        devEntries.length === 0 ? (
          <Card className="p-6"><EmptyState icon={<Code2 className="h-8 w-8" />} title="No development entries" description="Log your first development day to start tracking your progress." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />New Entry</Button>} /></Card>
        ) : (
          <div className="space-y-3">
            {devEntries.map((entry) => (
              <Card key={entry.id} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge color="blue">{entry.phase}</Badge>
                    <Badge color="slate">Day {entry.day}</Badge>
                    <span className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={entry.confidence >= 4 ? 'green' : entry.confidence >= 3 ? 'amber' : 'red'}>Confidence: {entry.confidence}/5</Badge>
                    <button onClick={() => handleDeleteDev(entry.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {entry.what_i_built && <div><p className="text-xs font-semibold uppercase text-slate-400">Built</p><p className="text-sm text-slate-700">{entry.what_i_built}</p></div>}
                  {entry.what_i_learned && <div><p className="text-xs font-semibold uppercase text-slate-400">Learned</p><p className="text-sm text-slate-700">{entry.what_i_learned}</p></div>}
                  {entry.problem && <div><p className="text-xs font-semibold uppercase text-slate-400">Problem</p><p className="text-sm text-slate-700">{entry.problem}</p></div>}
                  {entry.solution && <div><p className="text-xs font-semibold uppercase text-slate-400">Solution</p><p className="text-sm text-slate-700">{entry.solution}</p></div>}
                  {entry.time_spent && <div><p className="text-xs font-semibold uppercase text-slate-400">Time</p><p className="text-sm text-slate-700">{entry.time_spent}</p></div>}
                  {entry.tomorrow && <div><p className="text-xs font-semibold uppercase text-slate-400">Tomorrow</p><p className="text-sm text-slate-700">{entry.tomorrow}</p></div>}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Learning tab */}
      {tab === 'learning' && (
        learning.length === 0 ? (
          <Card className="p-6"><EmptyState icon={<BookOpen className="h-8 w-8" />} title="No learning topics" description="Add topics you're learning to track your knowledge growth." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Add Topic</Button>} /></Card>
        ) : (
          <div className="space-y-2">
            {learning.map((topic) => (
              <Card key={topic.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{topic.topic}</p>
                  <div className="flex items-center gap-2">
                    <select value={topic.status} onChange={(e) => handleUpdateLearn(topic.id, e.target.value as LearningTopic['status'])} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-400">
                      <option value="not_started">Not Started</option>
                      <option value="learning">Learning</option>
                      <option value="practiced">Practiced</option>
                      <option value="confident">Confident</option>
                    </select>
                    <Badge color={statusColors[topic.status]}>{topic.status.replace('_', ' ')}</Badge>
                    <button onClick={() => handleDeleteLearn(topic.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Coding tab */}
      {tab === 'coding' && (
        coding.length === 0 ? (
          <Card className="p-6"><EmptyState icon={<Terminal className="h-8 w-8" />} title="No coding problems" description="Add coding problems to track your practice." action={<Button onClick={() => setShowModal(true)}><Plus className="mr-1.5 h-4 w-4" />Add Problem</Button>} /></Card>
        ) : (
          <div className="space-y-2">
            {coding.map((problem) => (
              <Card key={problem.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{problem.problem}</p>
                    <p className="text-xs text-slate-400">{problem.topic} · {problem.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={problem.difficulty === 'hard' ? 'red' : problem.difficulty === 'medium' ? 'amber' : 'green'}>{problem.difficulty}</Badge>
                    <select value={problem.status} onChange={(e) => handleUpdateCode(problem.id, e.target.value as CodingProblem['status'])} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-400">
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button onClick={() => handleDeleteCode(problem.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                {problem.notes && <p className="mt-2 border-t border-slate-100 pt-2 text-sm text-slate-500">{problem.notes}</p>}
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <Modal open={showModal && tab === 'dev'} onClose={() => setShowModal(false)} title="New Development Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={devForm.date} onChange={(e) => setDevForm({ ...devForm, date: e.target.value })} />
            <Input label="Day" type="number" value={devForm.day} onChange={(e) => setDevForm({ ...devForm, day: Number(e.target.value) })} />
          </div>
          <Input label="Phase" value={devForm.phase} onChange={(e) => setDevForm({ ...devForm, phase: e.target.value })} />
          <Textarea label="What I Built" rows={2} value={devForm.what_i_built} onChange={(e) => setDevForm({ ...devForm, what_i_built: e.target.value })} />
          <Textarea label="What I Learned" rows={2} value={devForm.what_i_learned} onChange={(e) => setDevForm({ ...devForm, what_i_learned: e.target.value })} />
          <Textarea label="Problem" rows={2} value={devForm.problem} onChange={(e) => setDevForm({ ...devForm, problem: e.target.value })} />
          <Textarea label="Solution" rows={2} value={devForm.solution} onChange={(e) => setDevForm({ ...devForm, solution: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Time Spent" placeholder="3 hours" value={devForm.time_spent} onChange={(e) => setDevForm({ ...devForm, time_spent: e.target.value })} />
            <Select label="Confidence" value={String(devForm.confidence)} onChange={(e) => setDevForm({ ...devForm, confidence: Number(e.target.value) })}>
              <option value="1">1 / 5</option>
              <option value="2">2 / 5</option>
              <option value="3">3 / 5</option>
              <option value="4">4 / 5</option>
              <option value="5">5 / 5</option>
            </Select>
          </div>
          <Textarea label="Tomorrow" rows={2} value={devForm.tomorrow} onChange={(e) => setDevForm({ ...devForm, tomorrow: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDev}>Create Entry</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showModal && tab === 'learning'} onClose={() => setShowModal(false)} title="Add Learning Topic">
        <div className="space-y-4">
          <Input label="Topic" placeholder="e.g. Node.js" value={learnForm.topic} onChange={(e) => setLearnForm({ ...learnForm, topic: e.target.value })} />
          <Select label="Status" value={learnForm.status} onChange={(e) => setLearnForm({ ...learnForm, status: e.target.value as LearningTopic['status'] })}>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="practiced">Practiced</option>
            <option value="confident">Confident</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateLearn}>Add Topic</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showModal && tab === 'coding'} onClose={() => setShowModal(false)} title="Add Coding Problem">
        <div className="space-y-4">
          <Input label="Problem" placeholder="e.g. Two Sum" value={codeForm.problem} onChange={(e) => setCodeForm({ ...codeForm, problem: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Topic" placeholder="arrays" value={codeForm.topic} onChange={(e) => setCodeForm({ ...codeForm, topic: e.target.value })} />
            <Select label="Difficulty" value={codeForm.difficulty} onChange={(e) => setCodeForm({ ...codeForm, difficulty: e.target.value as CodingProblem['difficulty'] })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          <Select label="Status" value={codeForm.status} onChange={(e) => setCodeForm({ ...codeForm, status: e.target.value as CodingProblem['status'] })}>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          <Textarea label="Notes (optional)" rows={2} value={codeForm.notes} onChange={(e) => setCodeForm({ ...codeForm, notes: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCode}>Add Problem</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
