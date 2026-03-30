"use client";

import { useState } from "react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const COMMON_EXERCISES = [
  "Back Squat", "Front Squat", "Romanian Deadlift", "Deadlift", "Bench Press",
  "Overhead Press", "Pull-ups", "Barbell Row", "Hip Thrust", "Leg Press",
  "Bulgarian Split Squat", "Nordic Curl", "Dumbbell Row", "Incline Press",
  "Face Pull", "Lateral Raise", "Bicep Curl", "Tricep Dip", "Calf Raise",
];

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exerciseName: string) => void;
}

export function AddExerciseModal({ open, onClose, onAdd }: AddExerciseModalProps) {
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState("");

  const filtered = COMMON_EXERCISES.filter((e) =>
    e.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (name: string) => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setSearch("");
    setCustom("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Exercise</DialogTitle>
      <div className="space-y-4">
        <Input
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-48 overflow-y-auto space-y-1">
          {filtered.slice(0, 8).map((name) => (
            <button
              key={name}
              onClick={() => handleAdd(name)}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              {name}
            </button>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-sm text-muted-foreground px-3 py-2">
              No results — add as custom below
            </p>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <Label>Custom exercise name</Label>
          <div className="flex gap-2">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Cable Fly"
              onKeyDown={(e) => e.key === "Enter" && handleAdd(custom)}
            />
            <Button onClick={() => handleAdd(custom)} disabled={!custom.trim()}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
