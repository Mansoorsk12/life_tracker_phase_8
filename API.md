# LifeTrack API Documentation

## Authentication

LifeTrack uses Supabase Auth with JWT-based authentication. All protected endpoints require a valid JWT token in the `Authorization` header.

### Authentication Flow

1. **Register**: `POST /auth/v1/signup` — creates a new user account
2. **Login**: `POST /auth/v1/token?grant_type=password` — authenticates and returns JWT
3. **Protected requests**: Include `Authorization: Bearer <token>` header

### Auth Endpoints

#### POST /auth/v1/signup

```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "data": { "name": "User Name" }
}

Response:
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "eyJ...", "refresh_token": "..." }
}
```

#### POST /auth/v1/token?grant_type=password

```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

---

## Data Endpoints

All data endpoints are accessed via the Supabase REST API (PostgREST). The base URL is `{SUPABASE_URL}/rest/v1`.

### Headers (required for all data requests)

```
Authorization: Bearer <token>
apikey: <anon_key>
Content-Type: application/json
```

---

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/tasks?order=created_at.desc` | List user's tasks |
| GET | `/rest/v1/tasks?id=eq.{id}` | Get single task |
| POST | `/rest/v1/tasks` | Create task |
| PATCH | `/rest/v1/tasks?id=eq.{id}` | Update task |
| DELETE | `/rest/v1/tasks?id=eq.{id}` | Delete task |

**Create Task:**
```json
POST /rest/v1/tasks
{
  "title": "Practice JavaScript",
  "description": "Complete exercises on arrays",
  "priority": "high",
  "category": "learning",
  "due_date": "2026-09-05",
  "completed": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Practice JavaScript",
  "priority": "high",
  "completed": false,
  "created_at": "2026-09-03T..."
}
```

### Workouts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/workouts?order=date.desc` | List workouts |
| POST | `/rest/v1/workouts` | Create workout |
| PATCH | `/rest/v1/workouts?id=eq.{id}` | Update workout |
| DELETE | `/rest/v1/workouts?id=eq.{id}` | Delete workout |

**Create Workout:**
```json
{
  "date": "2026-09-03",
  "workout_type": "strength",
  "exercises": [
    { "name": "Bench Press", "sets": 3, "reps": 10, "weight": 60 }
  ],
  "duration": 45,
  "notes": "Felt strong today"
}
```

### Nutrition

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/nutrition?order=date.desc` | List entries |
| POST | `/rest/v1/nutrition` | Create entry |
| PATCH | `/rest/v1/nutrition?id=eq.{id}` | Update entry |
| DELETE | `/rest/v1/nutrition?id=eq.{id}` | Delete entry |

### Steps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/steps?order=date.desc` | List step records |
| POST | `/rest/v1/steps` | Create record |
| PATCH | `/rest/v1/steps?id=eq.{id}` | Update record |
| DELETE | `/rest/v1/steps?id=eq.{id}` | Delete record |

One record per user/date (unique index enforced).

### Sleep

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/sleep?order=date.desc` | List sleep records |
| POST | `/rest/v1/sleep` | Create record |
| PATCH | `/rest/v1/sleep?id=eq.{id}` | Update record |
| DELETE | `/rest/v1/sleep?id=eq.{id}` | Delete record |

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/goals?order=created_at.desc` | List goals |
| POST | `/rest/v1/goals` | Create goal |
| PATCH | `/rest/v1/goals?id=eq.{id}` | Update goal |
| DELETE | `/rest/v1/goals?id=eq.{id}` | Delete goal |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/habits?order=created_at.desc` | List habits |
| POST | `/rest/v1/habits` | Create habit |
| PATCH | `/rest/v1/habits?id=eq.{id}` | Update habit |
| DELETE | `/rest/v1/habits?id=eq.{id}` | Delete habit |

### Habit Completions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/habit_completions?habit_id=eq.{id}` | List completions |
| POST | `/rest/v1/habit_completions` | Create completion |
| DELETE | `/rest/v1/habit_completions?id=eq.{id}` | Delete completion |

Duplicate completions (same habit + date) are prevented by unique index.

### Development

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/development?order=date.desc` | List entries |
| POST | `/rest/v1/development` | Create entry |
| PATCH | `/rest/v1/development?id=eq.{id}` | Update entry |
| DELETE | `/rest/v1/development?id=eq.{id}` | Delete entry |

### Learning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/learning` | List topics |
| POST | `/rest/v1/learning` | Create topic |
| PATCH | `/rest/v1/learning?id=eq.{id}` | Update topic |
| DELETE | `/rest/v1/learning?id=eq.{id}` | Delete topic |

### Coding Practice

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/coding?order=date.desc` | List problems |
| POST | `/rest/v1/coding` | Create problem |
| PATCH | `/rest/v1/coding?id=eq.{id}` | Update problem |
| DELETE | `/rest/v1/coding?id=eq.{id}` | Delete problem |

### Achievements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/achievements?order=unlocked_at.desc` | List unlocked |
| POST | `/rest/v1/achievements` | Unlock achievement |

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/profiles?id=eq.{userId}` | Get profile |
| PATCH | `/rest/v1/profiles?id=eq.{userId}` | Update profile |

### Health Check

```
GET /rest/v1/ — returns API info if database is connected
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "message": "Task not found",
  "code": "PGRST116"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — invalid data |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — access denied (RLS policy) |
| 404 | Not Found |
| 409 | Conflict — duplicate data |
| 500 | Server Error |

---

## User Data Isolation

All data is scoped to the authenticated user via Row Level Security (RLS) policies. The `user_id` column on every table defaults to `auth.uid()`, and policies enforce:

- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `WITH CHECK (auth.uid() = user_id)`
- **UPDATE**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- **DELETE**: `USING (auth.uid() = user_id)`

Users can never access another user's data, regardless of what IDs they send in requests.
