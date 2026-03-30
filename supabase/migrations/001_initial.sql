-- Enable UUID extension (no longer needed for gen_random_uuid, kept for compat)
-- create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null check (role in ('coach', 'athlete')) default 'athlete',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── COACH ↔ ATHLETE RELATIONSHIPS ───────────────────────────────────────────
create table public.coach_athletes (
  coach_id    uuid not null references public.profiles(id) on delete cascade,
  athlete_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (coach_id, athlete_id)
);

alter table public.coach_athletes enable row level security;

-- ─── PROGRAMS ────────────────────────────────────────────────────────────────
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  coach_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.programs enable row level security;

-- ─── PROGRAM ASSIGNMENTS ─────────────────────────────────────────────────────
create table public.program_assignments (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  athlete_id  uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  status      text not null check (status in ('active', 'paused', 'completed')) default 'active',
  unique (program_id, athlete_id)
);

alter table public.program_assignments enable row level security;

-- ─── SESSIONS ────────────────────────────────────────────────────────────────
create table public.sessions (
  id                      uuid primary key default gen_random_uuid(),
  program_id              uuid not null references public.programs(id) on delete cascade,
  name                    text not null,
  order_index             int not null default 0,
  description             text,
  estimated_duration_min  int
);

alter table public.sessions enable row level security;

-- ─── SESSION EXERCISES ───────────────────────────────────────────────────────
create table public.session_exercises (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions(id) on delete cascade,
  exercise_name    text not null,
  order_index      int not null default 0,
  sets             int not null default 3,
  reps             text not null default '8-10',
  target_weight_kg numeric(6,2),
  rest_seconds     int,
  rpe_target       int check (rpe_target between 1 and 10),
  notes            text
);

alter table public.session_exercises enable row level security;

-- ─── WORKOUT LOGS ────────────────────────────────────────────────────────────
create table public.workout_logs (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.profiles(id) on delete cascade,
  session_id   uuid references public.sessions(id) on delete set null,
  program_id   uuid references public.programs(id) on delete set null,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  notes        text
);

alter table public.workout_logs enable row level security;

-- ─── EXERCISE LOGS ───────────────────────────────────────────────────────────
create table public.exercise_logs (
  id              uuid primary key default gen_random_uuid(),
  workout_log_id  uuid not null references public.workout_logs(id) on delete cascade,
  exercise_name   text not null,
  set_number      int not null,
  reps_completed  int not null,
  weight_kg       numeric(6,2) not null,
  rpe             int check (rpe between 1 and 10),
  is_pr           boolean not null default false,
  notes           text,
  logged_at       timestamptz not null default now()
);

alter table public.exercise_logs enable row level security;

-- ─── RUNS ────────────────────────────────────────────────────────────────────
create table public.runs (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references public.profiles(id) on delete cascade,
  date             date not null,
  distance_km      numeric(6,2) not null,
  duration_seconds int not null,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.runs enable row level security;

-- ─── PERSONAL RECORDS ────────────────────────────────────────────────────────
create table public.personal_records (
  id              uuid primary key default gen_random_uuid(),
  athlete_id      uuid not null references public.profiles(id) on delete cascade,
  exercise_name   text not null,
  weight_kg       numeric(6,2) not null,
  reps            int not null,
  one_rep_max     numeric(6,2) not null,
  achieved_at     timestamptz not null default now(),
  workout_log_id  uuid references public.workout_logs(id) on delete set null
);

alter table public.personal_records enable row level security;

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ════════════════════════════════════════════════════════════════════════════

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Coaches can view their athletes' profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.coach_athletes
      where coach_id = auth.uid() and athlete_id = profiles.id
    )
  );

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- COACH_ATHLETES
create policy "Coaches manage their athletes"
  on public.coach_athletes for all using (coach_id = auth.uid());

create policy "Athletes view their coaches"
  on public.coach_athletes for select using (athlete_id = auth.uid());

-- PROGRAMS
create policy "Coaches CRUD own programs"
  on public.programs for all using (coach_id = auth.uid());

create policy "Athletes view assigned programs"
  on public.programs for select using (
    exists (
      select 1 from public.program_assignments
      where program_id = programs.id and athlete_id = auth.uid()
    )
  );

-- PROGRAM_ASSIGNMENTS
create policy "Coaches manage assignments"
  on public.program_assignments for all using (
    exists (
      select 1 from public.programs
      where id = program_assignments.program_id and coach_id = auth.uid()
    )
  );

create policy "Athletes view own assignments"
  on public.program_assignments for select using (athlete_id = auth.uid());

-- SESSIONS
create policy "Coaches CRUD sessions via their programs"
  on public.sessions for all using (
    exists (
      select 1 from public.programs
      where id = sessions.program_id and coach_id = auth.uid()
    )
  );

create policy "Athletes view sessions of assigned programs"
  on public.sessions for select using (
    exists (
      select 1 from public.program_assignments pa
      join public.programs p on p.id = pa.program_id
      where p.id = sessions.program_id and pa.athlete_id = auth.uid()
    )
  );

-- SESSION_EXERCISES
create policy "Coaches CRUD session exercises via their programs"
  on public.session_exercises for all using (
    exists (
      select 1 from public.sessions s
      join public.programs p on p.id = s.program_id
      where s.id = session_exercises.session_id and p.coach_id = auth.uid()
    )
  );

create policy "Athletes view session exercises of assigned programs"
  on public.session_exercises for select using (
    exists (
      select 1 from public.sessions s
      join public.program_assignments pa on pa.program_id = s.program_id
      where s.id = session_exercises.session_id and pa.athlete_id = auth.uid()
    )
  );

-- WORKOUT_LOGS
create policy "Athletes CRUD own workout logs"
  on public.workout_logs for all using (athlete_id = auth.uid());

create policy "Coaches view their athletes' workout logs"
  on public.workout_logs for select using (
    exists (
      select 1 from public.coach_athletes
      where coach_id = auth.uid() and athlete_id = workout_logs.athlete_id
    )
  );

-- EXERCISE_LOGS
create policy "Athletes CRUD own exercise logs"
  on public.exercise_logs for all using (
    exists (
      select 1 from public.workout_logs
      where id = exercise_logs.workout_log_id and athlete_id = auth.uid()
    )
  );

create policy "Coaches view athletes' exercise logs"
  on public.exercise_logs for select using (
    exists (
      select 1 from public.workout_logs wl
      join public.coach_athletes ca on ca.athlete_id = wl.athlete_id
      where wl.id = exercise_logs.workout_log_id and ca.coach_id = auth.uid()
    )
  );

-- RUNS
create policy "Athletes CRUD own runs"
  on public.runs for all using (athlete_id = auth.uid());

create policy "Coaches view athletes' runs"
  on public.runs for select using (
    exists (
      select 1 from public.coach_athletes
      where coach_id = auth.uid() and athlete_id = runs.athlete_id
    )
  );

-- PERSONAL_RECORDS
create policy "Athletes CRUD own PRs"
  on public.personal_records for all using (athlete_id = auth.uid());

create policy "Coaches view athletes' PRs"
  on public.personal_records for select using (
    exists (
      select 1 from public.coach_athletes
      where coach_id = auth.uid() and athlete_id = personal_records.athlete_id
    )
  );
