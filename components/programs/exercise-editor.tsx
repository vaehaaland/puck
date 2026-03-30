"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ExerciseDraft } from "./program-builder";

interface ExerciseEditorProps {
  exercise: ExerciseDraft;
  index: number;
  onChange: (updates: Partial<ExerciseDraft>) => void;
  onRemove: () => void;
}

export function ExerciseEditor({ exercise, index, onChange, onRemove }: ExerciseEditorProps) {
  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}.</span>
        <Input
          value={exercise.exercise_name}
          onChange={(e) => onChange({ exercise_name: e.target.value })}
          placeholder="Exercise name (e.g. Back Squat)"
          className="flex-1 text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive shrink-0 h-8 w-8"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="space-y-1">
          <label className="text-muted-foreground">Sets</label>
          <Input
            type="number"
            min={1}
            value={exercise.sets}
            onChange={(e) => onChange({ sets: parseInt(e.target.value) || 1 })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground">Reps</label>
          <Input
            value={exercise.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            placeholder="8-10"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground">Weight (kg)</label>
          <Input
            type="number"
            step="0.5"
            value={exercise.target_weight_kg}
            onChange={(e) => onChange({ target_weight_kg: e.target.value })}
            placeholder="optional"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground">Rest (sec)</label>
          <Input
            type="number"
            value={exercise.rest_seconds ?? ""}
            onChange={(e) => onChange({ rest_seconds: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="90"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
