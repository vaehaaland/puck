"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExerciseEditor } from "./exercise-editor";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ExerciseDraft } from "./program-builder";

interface SessionDraft {
  id: string;
  name: string;
  description: string;
  estimated_duration_min: number | null;
  exercises: ExerciseDraft[];
}

interface SessionEditorProps {
  session: SessionDraft;
  index: number;
  onChange: (updates: Partial<SessionDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SessionEditor({ session, index, onChange, onRemove, canRemove }: SessionEditorProps) {
  const [expanded, setExpanded] = useState(true);

  const addExercise = () => {
    onChange({
      exercises: [
        ...session.exercises,
        {
          id: crypto.randomUUID(),
          exercise_name: "",
          sets: 3,
          reps: "8-10",
          target_weight_kg: "",
          rest_seconds: 90,
          rpe_target: null,
          notes: "",
        },
      ],
    });
  };

  const updateExercise = (id: string, updates: Partial<ExerciseDraft>) => {
    onChange({
      exercises: session.exercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex
      ),
    });
  };

  const removeExercise = (id: string) => {
    onChange({ exercises: session.exercises.filter((ex) => ex.id !== id) });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              #{index + 1}
            </span>
            <Input
              value={session.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Session name"
              className="font-medium"
            />
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {expanded && (
          <div className="space-y-4 pl-7">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Est. duration (min)</Label>
                <Input
                  type="number"
                  value={session.estimated_duration_min ?? ""}
                  onChange={(e) =>
                    onChange({ estimated_duration_min: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="60"
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-3">
              {session.exercises.map((exercise, i) => (
                <ExerciseEditor
                  key={exercise.id}
                  exercise={exercise}
                  index={i}
                  onChange={(updates) => updateExercise(exercise.id, updates)}
                  onRemove={() => removeExercise(exercise.id)}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExercise}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
