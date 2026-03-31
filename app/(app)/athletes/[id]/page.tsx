import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Route, Dumbbell } from "lucide-react";
import { calcPaceSeconds, formatPace } from "@/lib/utils/pace";

export default async function AthleteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "coach") redirect("/dashboard");

  const [{ data: athlete }, { data: prs }, { data: runs }, { data: workouts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase
      .from("personal_records")
      .select("*")
      .eq("athlete_id", params.id)
      .order("achieved_at", { ascending: false })
      .limit(10),
    supabase
      .from("runs")
      .select("*")
      .eq("athlete_id", params.id)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("workout_logs")
      .select("*, sessions(name)")
      .eq("athlete_id", params.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
  ]);

  if (!athlete) notFound();

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">{athlete.full_name}</h2>
        <p className="text-muted-foreground text-sm">Athlete overview</p>
      </div>

      {/* PRs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {prs && prs.length > 0 ? (
            prs.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{pr.exercise_name}</p>
                  <p className="text-xs text-muted-foreground">{pr.weight_kg}kg × {pr.reps}</p>
                </div>
                <Badge variant="warning">{pr.one_rep_max.toFixed(1)}kg 1RM</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No PRs yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent runs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="h-4 w-4 text-emerald-500" /> Recent Runs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {runs && runs.length > 0 ? (
            runs.map((run) => {
              const pace = calcPaceSeconds(run.distance_km, run.duration_seconds);
              return (
                <div key={run.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{run.distance_km} km</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(run.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatPace(pace)}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No runs logged.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent workouts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-blue-500" /> Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {workouts && workouts.length > 0 ? (
            workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-1">
                <p className="text-sm font-medium">
                  {(w.sessions as { name: string } | null)?.name ?? "Free workout"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(w.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No workouts logged.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
