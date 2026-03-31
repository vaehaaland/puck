"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SessionEditor } from "./session-editor";
import { Plus, Trash2 } from "lucide-react";

const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
});
type ProgramFormData = z.infer<typeof programSchema>;

// TODO [PROGRAM-CYCLES]: Add a WeekDraft concept so sessions are grouped by week,
// and each week has a type: "normal" | "deload". The program builder should let
// coaches configure a cycle length (e.g. 4 weeks) and mark which weeks are deload.
// On deload weeks, target weights/RPE for all exercises in that week's sessions
// should be automatically scaled down (e.g. 60-70% of the working weight from the
// previous week). The DB will need a `week_number` and `week_type` column on sessions,
// or a separate `program_weeks` table. The program save flow in `onSubmit` needs
// to persist week metadata alongside sessions.
interface SessionDraft {
  id: string;
  name: string;
  description: string;
  estimated_duration_min: number | null;
  exercises: ExerciseDraft[];
}

export interface ExerciseDraft {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  target_weight_kg: string;
  rest_seconds: number | null;
  rpe_target: number | null;
  notes: string;
}

interface ProgramBuilderProps {
  coachId: string;
}

export function ProgramBuilder({ coachId }: ProgramBuilderProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionDraft[]>([
    {
      id: crypto.randomUUID(),
      name: "Session 1",
      description: "",
      estimated_duration_min: 60,
      exercises: [],
    },
  ]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Session ${prev.length + 1}`,
        description: "",
        estimated_duration_min: 60,
        exercises: [],
      },
    ]);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSession = (id: string, updates: Partial<SessionDraft>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const onSubmit = async (data: ProgramFormData) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    // 1. Create program
    const { data: program, error: pError } = await supabase
      .from("programs")
      .insert({ name: data.name, description: data.description ?? null, coach_id: coachId })
      .select()
      .single();

    if (pError || !program) {
      setError(pError?.message ?? "Failed to create program");
      setSaving(false);
      return;
    }

    // 2. Create sessions + exercises
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const { data: session, error: sError } = await supabase
        .from("sessions")
        .insert({
          program_id: program.id,
          name: s.name,
          description: s.description || null,
          order_index: i,
          estimated_duration_min: s.estimated_duration_min,
        })
        .select()
        .single();

      if (sError || !session) continue;

      if (s.exercises.length > 0) {
        await supabase.from("session_exercises").insert(
          s.exercises.map((ex, j) => ({
            session_id: session.id,
            exercise_name: ex.exercise_name,
            order_index: j,
            sets: ex.sets,
            reps: ex.reps,
            target_weight_kg: ex.target_weight_kg ? parseFloat(ex.target_weight_kg) : null,
            rest_seconds: ex.rest_seconds,
            rpe_target: ex.rpe_target,
            notes: ex.notes || null,
          }))
        );
      }
    }

    router.push(`/programs/${program.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Program Name</Label>
            <Input id="name" placeholder="e.g. 8-Week Strength Block" {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this program about?"
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      {/* TODO [PROGRAM-CYCLES]: Render a week selector here so coaches can switch between
          weeks before adding/editing sessions. Add a "Add Week" button and a toggle per
          week to mark it as a deload week. Sessions below should be scoped to the
          currently selected week. */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sessions</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSession}>
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>

        {sessions.map((session, idx) => (
          <SessionEditor
            key={session.id}
            session={session}
            index={idx}
            onChange={(updates) => updateSession(session.id, updates)}
            onRemove={() => removeSession(session.id)}
            canRemove={sessions.length > 1}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving…" : "Save Program"}
      </Button>
    </form>
  );
}
