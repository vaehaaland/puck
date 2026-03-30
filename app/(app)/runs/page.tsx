import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RunCard } from "@/components/runs/run-card";
import { Plus, Route } from "lucide-react";
import { calcPaceSeconds } from "@/lib/utils/pace";

export default async function RunsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: runs } = await supabase
    .from("runs")
    .select("*")
    .eq("athlete_id", user.id)
    .order("date", { ascending: false });

  const totalKm = runs?.reduce((a, r) => a + r.distance_km, 0) ?? 0;
  const avgPace = runs && runs.length > 0
    ? Math.round(runs.reduce((a, r) => a + calcPaceSeconds(r.distance_km, r.duration_seconds), 0) / runs.length)
    : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Runs</h2>
        <Button asChild>
          <Link href="/runs/new">
            <Plus className="h-4 w-4" />
            Log Run
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {runs && runs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{runs.length}</p>
            <p className="text-xs text-muted-foreground">Total runs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalKm.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total km</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {avgPace
                ? `${Math.floor(avgPace / 60)}:${String(avgPace % 60).padStart(2, "0")}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Avg pace /km</p>
          </div>
        </div>
      )}

      {runs && runs.length > 0 ? (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground space-y-3">
          <Route className="h-12 w-12 mx-auto opacity-30" />
          <p>No runs logged yet.</p>
          <Button asChild>
            <Link href="/runs/new">Log your first run</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
