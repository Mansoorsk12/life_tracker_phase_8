# LifeTrack

A personal productivity, fitness, nutrition, sleep, habit, and developer-progress tracker.

## Features

- **Authentication** — User registration, login, JWT-based sessions, protected routes
- **Dashboard** — Overview of all tracked data with quick stats and highlights
- **Tasks** — Create, complete, prioritize, categorize, and set due dates
- **Workout Tracker** — Log workout sessions with exercises, sets, reps, weight, and duration
- **Nutrition Tracker** — Track food intake with protein, calories, and meal types
- **Steps Tracker** — Daily step count with goal tracking
- **Sleep Tracker** — Log sleep/wake times, duration, and quality rating
- **Goals** — Create goals with categories, deadlines, progress tracking, and priority
- **Habits** — Build habits with streak tracking, completion rates, and best streaks
- **Achievements** — Unlock milestones as you track your activities
- **Development Tracker** — Daily development log with learning topics and coding practice
- **Analytics** — Aggregated insights across all tracked categories with date range filtering
- **Settings** — Manage profile, goals, and change password

## Technology

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- Lucide React (icons)

### Backend
- Supabase (PostgreSQL)
- Supabase Auth (JWT-based)
- Row Level Security (user data isolation)

### Database
- PostgreSQL (via Supabase)
- 13 tables with RLS policies
- Auto-updating timestamps
- Unique constraints for data integrity

## Architecture

```
                 LifeTrack
                     │
          ┌──────────┴──────────┐
          │                     │
       Frontend              Backend
          │                     │
       React            Supabase (PostgREST)
          │                     │
    Service Layer         RLS Policies
          │                     │
       API Client              ──
          │                     │
          └──────────┬──────────┘
                     │
                PostgreSQL
                     │
        ┌────────────┼────────────┐
        │            │            │
      Tasks       Fitness      Development
                     │
          ┌──────────┼──────────┐
       Workout    Nutrition    Steps
                                  │
                               Sleep
```

## Setup

### Prerequisites
- Node.js 18+
- npm

### Environment Variables

The following are pre-configured in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install Dependencies

```bash
npm install
```

### Run Frontend (Development)

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Sidebar navigation + user area
│   ├── ProtectedRoute.tsx  # Auth guard for protected pages
│   └── ui.tsx              # Reusable UI components
├── context/
│   └── AuthContext.tsx     # Auth provider with login/register/logout
├── lib/
│   └── supabase.ts         # Supabase client singleton
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── TasksPage.tsx
│   ├── WorkoutPage.tsx
│   ├── NutritionPage.tsx
│   ├── StepsPage.tsx
│   ├── SleepPage.tsx
│   ├── GoalsPage.tsx
│   ├── HabitsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── DevelopmentPage.tsx
│   ├── AchievementsPage.tsx
│   └── SettingsPage.tsx
├── services/
│   ├── authService.ts
│   ├── taskService.ts
│   ├── workoutService.ts
│   ├── nutritionService.ts
│   ├── stepService.ts
│   ├── sleepService.ts
│   ├── goalService.ts
│   ├── habitService.ts
│   ├── developmentService.ts
│   └── achievementService.ts
├── types/
│   └── index.ts            # All TypeScript interfaces
├── App.tsx                 # Routes
└── main.tsx                # Entry point
```

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profile data (name, goals, theme) |
| tasks | Todo items with priority/category/due date |
| workouts | Workout sessions with exercises |
| nutrition | Food entries with protein/calories |
| steps | Daily step count |
| sleep | Sleep records with quality |
| goals | Goals with progress tracking |
| habits | Habit definitions |
| habit_completions | Individual habit completion records |
| achievements | Unlocked achievement records |
| development | Daily development log entries |
| learning | Learning topics with status |
| coding | Coding practice problems |

## Security

- Passwords hashed by Supabase Auth (bcrypt)
- JWT tokens for authentication
- Row Level Security on all tables
- User data isolation enforced at database level
- No password hashes returned in API responses
- CORS configured via Supabase

## API Documentation

See [API.md](./API.md) for full endpoint documentation.

## Project Phases

- Phase 1 — Todo + Dashboard
- Phase 2 — Workout & Gym Tracker
- Phase 3 — Nutrition & Protein Tracker
- Phase 4 — Steps & Sleep Tracker
- Phase 5 — Goals, Habits, Streaks & Achievements
- Phase 6 — Advanced Analytics & Insights
- Phase 7 — Backend, Database & Authentication
