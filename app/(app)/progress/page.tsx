import { createClient } from "@/lib/supabase/server";
import { StrengthChart } from "@/components/progress/strength-chart";
import { RunChart } from "@/components/progress/run-chart";
import { PRList } from "@/components/progress/pr-list";
import { calcPaceSeconds } from "@/lib/utils/pace";

export default async function ProgressPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: prs }, { data: exerciseLogs }, { data: runs }] = await Promise.all([
    supabase
      .from("personal_records")
      .select("*")
      .eq("athlete_id", user.id)
      .order("achieved_at", { ascending: false }),
    supabase
      .from("exercise_logs")
      .select("exercise_name, weight_kg, reps_completed, is_pr, logged_at")
      .eq("workout_logs.athlete_id", user.id)
      .order("logged_at", { ascending: true })
      .limit(500),
    supabase
      .from("runs")
      .select("date, distance_km, duration_seconds")
      .eq("athlete_id", user.id)
      .order("date", { ascending: true }),
  ]);

  // Build run chart data
  const runChartData = (runs ?? []).map((r) => ({
    date: r.date,
    distance: r.distance_km,
    pace: calcPaceSeconds(r.distance_km, r.duration_seconds) / 60, // min/km as decimal
  }));

  // Build strength chart data per exercise
  const exerciseMap: Record<string, { date: string; oneRepMax: number }[]> = {};
  (exerciseLogs ?? []).forEach((log) => {
    const orm = log.weight_kg * (36 / (37 - Math.min(log.reps_completed, 36)));
    if (!exerciseMap[log.exercise_name]) exerciseMap[log.exercise_name] = [];
    exerciseMap[log.exercise_name].push({
      date: log.logged_at.split("T")[0],
      oneRepMax: Math.round(orm * 10) / 10,
    });
  });

  // Get unique exercise names for selector
  const exerciseNames = Object.keys(exerciseMap);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Progress</h2>

      {/* Strength progress */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Strength Progress</h3>
        {exerciseNames.length > 0 ? (
          <StrengthChart exerciseMap={exerciseMap} exerciseNames={exerciseNames} />
        ) : (
          <p className="text-muted-foreground text-sm">No workout data yet.</p>
        )}
      </div>

      {/* Run progress */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Running Progress</h3>
        {runChartData.length > 0 ? (
          <RunChart data={runChartData} />
        ) : (
          <p className="text-muted-foreground text-sm">No runs logged yet.</p>
        )}
      </div>

      {/* PR list */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Personal Records</h3>
        {prs && prs.length > 0 ? (
          <PRList prs={prs} />
        ) : (
          <p className="text-muted-foreground text-sm">No PRs yet. Start logging workouts!</p>
        )}
      </div>
    </div>
  );
}
