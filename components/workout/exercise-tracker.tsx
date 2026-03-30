"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SetLogger } from "./set-logger";
import { Dumbbell, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { brzycki } from "@/lib/utils/one-rep-max";

interface SessionExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  target_weight_kg: number | null;
  rest_seconds: number | null;
  rpe_target: number | null;
  notes: string | null;
}

interface LoggedSet {
  exercise_name: string;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  rpe: number | null;
  is_pr: boolean;
}

interface ExerciseTrackerProps {
  exercise: SessionExercise;
  loggedSets: LoggedSet[];
  currentPR?: number;
  onLogSet: (
    exerciseName: string,
    setNumber: number,
    weight: number,
    reps: number,
    rpe: number | null
  ) => Promise<void>;
}

export function ExerciseTracker({
  exercise,
  loggedSets,
  currentPR,
  onLogSet,
}: ExerciseTrackerProps) {
  const completedCount = loggedSets.length;
  const totalSets = exercise.sets;
  const isComplete = completedCount >= totalSets;
  const nextSetNumber = completedCount + 1;
  const [expanded, setExpanded] = useState(true);

  // Suggest weight based on previous set or target
  const lastSet = loggedSets[loggedSets.length - 1];
  const suggestedWeight =
    lastSet?.weight_kg ?? exercise.target_weight_kg ?? undefined;

  const handleLog = async (weight: number, reps: number, rpe: number | null) => {
    await onLogSet(exercise.exercise_name, nextSetNumber, weight, reps, rpe);
  };

  return (
    <Card className={isComplete ? "opacity-70" : ""}>
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Dumbbell className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{exercise.exercise_name}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.sets} × {exercise.reps}
                {exercise.target_weight_kg ? ` @ ${exercise.target_weight_kg}kg` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isComplete && <Badge variant="success">Done</Badge>}
            {!isComplete && (
              <Badge variant="secondary">
                {completedCount}/{totalSets}
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* PR info */}
            {currentPR && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <Trophy className="h-3.5 w-3.5" />
                Current PR: {currentPR.toFixed(1)}kg 1RM
              </div>
            )}

            {/* Notes */}
            {exercise.notes && (
              <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1.5">
                {exercise.notes}
              </p>
            )}

            {/* Previous sets */}
            {loggedSets.length > 0 && (
              <div className="space-y-1">
                {loggedSets.map((s) => {
                  const orm = brzycki(s.weight_kg, s.reps_completed);
                  return (
                    <div
                      key={s.set_number}
                      className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1.5"
                    >
                      <span className="text-muted-foreground w-12">
                        Set {s.set_number}
                      </span>
                      <span className="font-medium">
                        {s.weight_kg}kg × {s.reps_completed}
                      </span>
                      {s.rpe && (
                        <span className="text-muted-foreground">RPE {s.rpe}</span>
                      )}
                      <span className="ml-auto text-muted-foreground">
                        {orm.toFixed(1)}kg 1RM
                      </span>
                      {s.is_pr && (
                        <span className="text-amber-500 font-semibold">PR!</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Log next set */}
            {!isComplete && (
              <SetLogger
                setNumber={nextSetNumber}
                suggestedWeight={suggestedWeight}
                suggestedReps={exercise.reps}
                restSeconds={exercise.rest_seconds}
                onSave={handleLog}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
