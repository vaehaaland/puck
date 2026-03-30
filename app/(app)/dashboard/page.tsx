import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dumbbell, Trophy, Route, PlayCircle } from "lucide-react";
import { formatPace, calcPaceSeconds } from "@/lib/utils/pace";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: recentWorkouts }, { data: recentPRs }, { data: recentRuns }, { data: assignments }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("workout_logs")
        .select("*, sessions(name)")
        .eq("athlete_id", user.id)
        .order("started_at", { ascending: false })
        .limit(3),
      supabase
        .from("personal_records")
        .select("*")
        .eq("athlete_id", user.id)
        .order("achieved_at", { ascending: false })
        .limit(5),
      supabase
        .from("runs")
        .select("*")
        .eq("athlete_id", user.id)
        .order("date", { ascending: false })
        .limit(3),
      supabase
        .from("program_assignments")
        .select("*, programs(name, sessions(id, name, order_index))")
        .eq("athlete_id", user.id)
        .eq("status", "active")
        .limit(1),
    ]);

  const totalWorkouts = recentWorkouts?.length ?? 0;
  const activeProgram = assignments?.[0]?.programs as { name: string; sessions: { id: string; name: string; order_index: number }[] } | undefined;
  const nextSession = activeProgram?.sessions?.sort((a, b) => a.order_index - b.order_index)[0];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">
          Hey, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Quick action */}
      {nextSession ? (
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80">Next session</p>
              <p className="font-semibold text-lg mt-0.5">{nextSession.name}</p>
              <p className="text-sm opacity-80 mt-0.5">{activeProgram?.name}</p>
            </div>
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href={`/workout/${nextSession.id}`}>
                <PlayCircle className="h-5 w-5" />
                Start
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-center space-y-3">
            <p className="text-muted-foreground">No active program</p>
            <Button asChild>
              <Link href="/programs">Browse Programs</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentPRs?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">PRs set</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Route className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(recentRuns?.reduce((a, r) => a + r.distance_km, 0) ?? 0).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">km this week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Route className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentRuns?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Runs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent PRs */}
      {recentPRs && recentPRs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Recent PRs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {recentPRs.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{pr.exercise_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pr.weight_kg}kg × {pr.reps} reps
                  </p>
                </div>
                <Badge variant="success">
                  {pr.one_rep_max.toFixed(1)}kg 1RM
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent runs */}
      {recentRuns && recentRuns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Route className="h-4 w-4 text-emerald-500" />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {recentRuns.map((run) => {
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
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
