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
import { calcPaceSeconds, formatPace, formatDuration } from "@/lib/utils/pace";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  distance_km: z.string().min(1, "Distance is required"),
  hours: z.string().min(0),
  minutes: z.string().min(1, "Minutes are required"),
  seconds: z.string().min(0),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function RunForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, hours: "0", seconds: "0" },
  });

  const watchedValues = watch(["distance_km", "hours", "minutes", "seconds"]);
  const [distStr, hoursStr, minutesStr, secondsStr] = watchedValues;
  const dist = parseFloat(distStr ?? "0");
  const totalSecs = (parseInt(hoursStr ?? "0") * 3600) + (parseInt(minutesStr ?? "0") * 60) + parseInt(secondsStr ?? "0");
  const paceSeconds = dist > 0 && totalSecs > 0 ? calcPaceSeconds(dist, totalSecs) : null;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const durationSecs = (parseInt(data.hours || "0") * 3600) + (parseInt(data.minutes) * 60) + parseInt(data.seconds || "0");

    const { error } = await supabase.from("runs").insert({
      athlete_id: user.user.id,
      date: data.date,
      distance_km: parseFloat(data.distance_km),
      duration_seconds: durationSecs,
      notes: data.notes || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/runs");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="5.0"
              {...register("distance_km")}
            />
            {errors.distance_km && <p className="text-destructive text-xs">{errors.distance_km.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  min={0}
                  {...register("hours")}
                />
                <p className="text-xs text-muted-foreground text-center mt-0.5">h</p>
              </div>
              <span className="text-muted-foreground text-lg pb-5">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="00"
                  min={0}
                  max={59}
                  {...register("minutes")}
                />
                <p className="text-xs text-muted-foreground text-center mt-0.5">min</p>
              </div>
              <span className="text-muted-foreground text-lg pb-5">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="00"
                  min={0}
                  max={59}
                  {...register("seconds")}
                />
                <p className="text-xs text-muted-foreground text-center mt-0.5">sec</p>
              </div>
            </div>
            {errors.minutes && <p className="text-destructive text-xs">{errors.minutes.message}</p>}
          </div>

          {/* Live pace preview */}
          {paceSeconds && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800 flex items-center justify-between">
              <span>Pace</span>
              <span className="font-semibold">{formatPace(paceSeconds)}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="How did it feel?" {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Save Run"}
      </Button>
    </form>
  );
}
