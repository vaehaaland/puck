"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Timer } from "lucide-react";

interface SetLoggerProps {
  setNumber: number;
  suggestedWeight?: number;
  suggestedReps?: string;
  restSeconds: number | null;
  onSave: (weight: number, reps: number, rpe: number | null) => Promise<void>;
}

export function SetLogger({
  setNumber,
  suggestedWeight,
  suggestedReps,
  restSeconds,
  onSave,
}: SetLoggerProps) {
  const defaultReps = suggestedReps
    ? parseInt(suggestedReps.split("-")[0]) || 8
    : 8;

  const [weight, setWeight] = useState(suggestedWeight?.toString() ?? "");
  const [reps, setReps] = useState(defaultReps.toString());
  const [rpe, setRpe] = useState("");
  const [saving, setSaving] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restElapsed, setRestElapsed] = useState(0);

  useEffect(() => {
    if (restTimer === null) return;
    if (restElapsed >= restTimer) return;
    const interval = setInterval(() => {
      setRestElapsed((prev) => {
        if (prev + 1 >= restTimer) {
          clearInterval(interval);
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer, restElapsed]);

  const handleSave = async () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r) return;
    setSaving(true);
    await onSave(w, r, rpe ? parseInt(rpe) : null);
    setSaving(false);
    // Start rest timer
    if (restSeconds) {
      setRestTimer(restSeconds);
      setRestElapsed(0);
    }
  };

  const restRemaining = restTimer !== null ? Math.max(0, restTimer - restElapsed) : null;

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-accent/30">
      <p className="text-xs font-semibold text-muted-foreground">Set {setNumber}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            className="h-12 text-lg font-semibold text-center"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
          <Input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="reps"
            className="h-12 text-lg font-semibold text-center"
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-muted-foreground mb-1 block">RPE</label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder="1–10"
            className="h-12 text-lg font-semibold text-center"
          />
        </div>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || !weight || !reps}
        className="w-full h-12 text-base"
      >
        <Check className="h-5 w-5" />
        Log Set {setNumber}
      </Button>

      {/* Rest timer */}
      {restRemaining !== null && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          {restRemaining > 0
            ? `Rest: ${restRemaining}s remaining`
            : "Rest complete — ready for next set!"}
        </div>
      )}
    </div>
  );
}
