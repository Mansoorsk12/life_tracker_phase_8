import { useEffect, useState, useCallback } from 'react';
import { Award, AlertCircle, Lock } from 'lucide-react';
import { Card, FullPageLoader, EmptyState, Badge } from '@/components/ui';
import { getAchievements, ACHIEVEMENT_DEFINITIONS } from '@/services/achievementService';
import type { Achievement } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setAchievements(await getAchievements()); } catch { setError('Failed to load achievements'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <FullPageLoader />;

  const unlockedKeys = new Set(achievements.map((a) => a.achievement_key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
        <p className="mt-1 text-sm text-slate-500">{achievements.length} of {ACHIEVEMENT_DEFINITIONS.length} unlocked</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}

      {achievements.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Award className="h-8 w-8" />} title="No achievements yet" description="Start tracking your activities to unlock achievements. Each milestone you reach will appear here." />
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENT_DEFINITIONS.map((def) => {
          const unlocked = unlockedKeys.has(def.key);
          const achievement = achievements.find((a) => a.achievement_key === def.key);
          return (
            <Card key={def.key} className={`p-5 transition-all ${unlocked ? 'border-amber-200 bg-amber-50/30' : 'opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                  {unlocked ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{def.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{def.description}</p>
                  {unlocked && achievement && (
                    <Badge color="amber">Unlocked {new Date(achievement.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
