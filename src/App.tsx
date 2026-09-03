import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TasksPage from '@/pages/TasksPage';
import WorkoutPage from '@/pages/WorkoutPage';
import NutritionPage from '@/pages/NutritionPage';
import StepsPage from '@/pages/StepsPage';
import SleepPage from '@/pages/SleepPage';
import GoalsPage from '@/pages/GoalsPage';
import HabitsPage from '@/pages/HabitsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import DevelopmentPage from '@/pages/DevelopmentPage';
import AchievementsPage from '@/pages/AchievementsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/workout" element={<WorkoutPage />} />
                    <Route path="/nutrition" element={<NutritionPage />} />
                    <Route path="/steps" element={<StepsPage />} />
                    <Route path="/sleep" element={<SleepPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/habits" element={<HabitsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/development" element={<DevelopmentPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
