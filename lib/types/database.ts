export type Role = "coach" | "athlete";
export type ProgramStatus = "active" | "paused" | "completed";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface CoachAthlete {
  coach_id: string;
  athlete_id: string;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  coach_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramAssignment {
  id: string;
  program_id: string;
  athlete_id: string;
  assigned_at: string;
  status: ProgramStatus;
}

export interface Session {
  id: string;
  program_id: string;
  name: string;
  order_index: number;
  description: string | null;
  estimated_duration_min: number | null;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_name: string;
  order_index: number;
  sets: number;
  reps: string;
  target_weight_kg: number | null;
  rest_seconds: number | null;
  rpe_target: number | null;
  notes: string | null;
}

export interface WorkoutLog {
  id: string;
  athlete_id: string;
  session_id: string | null;
  program_id: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface ExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  rpe: number | null;
  is_pr: boolean;
  notes: string | null;
  logged_at: string;
}

export interface Run {
  id: string;
  athlete_id: string;
  date: string;
  distance_km: number;
  duration_seconds: number;
  notes: string | null;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  athlete_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  one_rep_max: number;
  achieved_at: string;
  workout_log_id: string | null;
}

// Extended types with joins
export interface ProgramWithSessions extends Program {
  sessions: SessionWithExercises[];
  coach?: Profile;
}

export interface SessionWithExercises extends Session {
  session_exercises: SessionExercise[];
}

export interface WorkoutLogWithExercises extends WorkoutLog {
  exercise_logs: ExerciseLog[];
  session?: Session;
}
