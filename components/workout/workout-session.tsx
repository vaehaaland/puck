"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseTracker } from "./exercise-tracker";
import { AddExerciseModal } from "./add-exercise-modal";
import { brzycki } from "@/lib/utils/one-rep-max";
import { CheckCircle, Plus, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";

interface SessionExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  target_weight_kg: number | null;
  rest_seconds: number | null;
  rpe_target: number | null;
  notes: string | null;
  order_index: number;
}

interface Session {
  id: string;
  name: string;
  programs: { id: string } | null;
  session_exercises: SessionExercise[];
}

interface ExistingPR {
  exercise_name: string;
  one_rep_max: number;
  weight_kg: number;
  reps: number;
}

interface LoggedSet {
  exercise_name: string;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  rpe: number | null;
  is_pr: boolean;
}

// TODO [FREE-WORKOUT]: Make `session` optional (or introduce a FreeWorkoutSession
// variant) so WorkoutSession can be mounted without a predefined session. When
// session is null/undefined: start with an empty exercise list, show "Add Exercise"
// as the primary CTA, and pass session_id = null when inserting workout_logs.
// The rest of the logging flow (handleLogSet, PR detection, handleFinish) can stay
// unchanged since it already operates on the loggedSets state array.
interface WorkoutSessionProps {
  session: Session;
  athleteId: string;
  existingPRs: ExistingPR[];
}

export function WorkoutSession({ session, athleteId, existingPRs }: WorkoutSessionProps) {
  const router = useRouter();
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [prs, setPrs] = useState<Record<string, number>>(
    Object.fromEntries(existingPRs.map((p) => [p.exercise_name, p.one_rep_max]))
  );
  const [newPRs, setNewPRs] = useState<string[]>([]);
  const [exercises, setExercises] = useState<SessionExercise[]>(
    [...session.session_exercises].sort((a, b) => a.order_index - b.order_index)
  );
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Start workout log on mount
  useEffect(() => {
    const start = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("workout_logs")
        .insert({
          athlete_id: athleteId,
          session_id: session.id,
          program_id: (session.programs as { id: string } | null)?.id ?? null,
        })
        .select()
        .single();
      if (data) setWorkoutLogId(data.id);
    };
    start();
  }, [athleteId, session]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleLogSet = async (
    exerciseName: string,
    setNumber: number,
    weight: number,
    reps: number,
    rpe: number | null
  ) => {
    if (!workoutLogId) return;

    const supabase = createClient();
    const oneRepMax = brzycki(weight, reps);
    const currentPR = prs[exerciseName] ?? 0;
    const isPR = oneRepMax > currentPR;

    // Insert exercise log
    await supabase.from("exercise_logs").insert({
      workout_log_id: workoutLogId,
      exercise_name: exerciseName,
      set_number: setNumber,
      reps_completed: reps,
      weight_kg: weight,
      rpe,
      is_pr: isPR,
    });

    const newSet: LoggedSet = { exercise_name: exerciseName, set_number: setNumber, reps_completed: reps, weight_kg: weight, rpe, is_pr: isPR };
    setLoggedSets((prev) => [...prev, newSet]);

    // Handle new PR
    if (isPR) {
      // Upsert personal record
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from("personal_records").upsert(
          {
            athlete_id: user.user.id,
            exercise_name: exerciseName,
            weight_kg: weight,
            reps,
            one_rep_max: oneRepMax,
            achieved_at: new Date().toISOString(),
            workout_log_id: workoutLogId,
          },
          { onConflict: "athlete_id,exercise_name" }
        );
        setPrs((prev) => ({ ...prev, [exerciseName]: oneRepMax }));
        setNewPRs((prev) => [...prev.filter((n) => n !== exerciseName), exerciseName]);
        setTimeout(() => setNewPRs((prev) => prev.filter((n) => n !== exerciseName)), 4000);
      }
    }
  };

  const handleAddExercise = (exerciseName: string) => {
    const newEx: SessionExercise = {
      id: crypto.randomUUID(),
      exercise_name: exerciseName,
      sets: 3,
      reps: "8-10",
      target_weight_kg: null,
      rest_seconds: 90,
      rpe_target: null,
      notes: null,
      order_index: exercises.length,
    };
    setExercises((prev) => [...prev, newEx]);
    setAddExerciseOpen(false);
  };

  const handleFinish = async () => {
    if (!workoutLogId) return;
    setFinishing(true);
    const supabase = createClient();
    await supabase
      .from("workout_logs")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", workoutLogId);
    router.push("/workout");
    router.refresh();
  };

  const totalSets = loggedSets.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/workout">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="font-semibold text-sm">{session.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatElapsed(elapsed)}
              {totalSets > 0 && <span>· {totalSets} sets logged</span>}
            </div>
          </div>
        </div>
        <Button
          onClick={handleFinish}
          disabled={finishing}
          size="sm"
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4" />
          Finish
        </Button>
      </div>

      {/* PR Toast */}
      {newPRs.length > 0 && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-amber-600 text-lg">🏆</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">New PR!</p>
            <p className="text-xs text-amber-700">{newPRs.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="flex-1 p-4 space-y-4 pb-32">
        {exercises.map((exercise) => {
          const setsForExercise = loggedSets.filter(
            (s) => s.exercise_name === exercise.exercise_name
          );
          const currentPR = prs[exercise.exercise_name];
          return (
            <ExerciseTracker
              key={exercise.id}
              exercise={exercise}
              loggedSets={setsForExercise}
              currentPR={currentPR}
              onLogSet={handleLogSet}
            />
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setAddExerciseOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
        <Button
          onClick={handleFinish}
          disabled={finishing}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4" />
          Finish Workout
        </Button>
      </div>

      <AddExerciseModal
        open={addExerciseOpen}
        onClose={() => setAddExerciseOpen(false)}
        onAdd={handleAddExercise}
      />
    </div>
  );
}
