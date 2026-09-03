import { useState, type FormEvent } from 'react';
import { Settings as SettingsIcon, AlertCircle, Check, Lock } from 'lucide-react';
import { Card, Button, Input, FullPageLoader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword } from '@/services/authService';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [stepGoal, setStepGoal] = useState(profile?.step_goal ?? 10000);
  const [sleepGoal, setSleepGoal] = useState(profile?.sleep_goal ?? 8);
  const [proteinGoal, setProteinGoal] = useState(profile?.protein_goal ?? 150);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!profile) return <FullPageLoader />;

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    setProfileSaved(false);
    try {
      await updateProfile(user!.id, {
        name, step_goal: Number(stepGoal), sleep_goal: Number(sleepGoal), protein_goal: Number(proteinGoal),
      });
      await refreshProfile();
      setProfileSaved(true);
    } catch { setProfileError('Failed to save settings'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile and account</p>
      </div>

      {/* Profile settings */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Profile</h2>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {profileError && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{profileError}</div>}
          {profileSaved && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600"><Check className="h-4 w-4" />Settings saved successfully</div>}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email ?? ''} disabled className="bg-slate-50" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Step Goal" type="number" value={stepGoal} onChange={(e) => setStepGoal(Number(e.target.value))} />
            <Input label="Sleep Goal (hours)" type="number" step="0.5" value={sleepGoal} onChange={(e) => setSleepGoal(Number(e.target.value))} />
            <Input label="Protein Goal (g)" type="number" value={proteinGoal} onChange={(e) => setProteinGoal(Number(e.target.value))} />
          </div>
          <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
        </form>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{passwordError}</div>}
          {passwordSaved && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600"><Check className="h-4 w-4" />Password changed successfully</div>}
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Changing...' : 'Change Password'}</Button>
        </form>
      </Card>
    </div>
  );
}
