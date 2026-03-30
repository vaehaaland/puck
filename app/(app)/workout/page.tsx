import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlayCircle, Clock, Dumbbell } from "lucide-react";

export default async function WorkoutPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get all active program assignments with their sessions
  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("*, programs(id, name, sessions(id, name, order_index, estimated_duration_min, session_exercises(id)))")
    .eq("athlete_id", user.id)
    .eq("status", "active");

  // Get recent workouts
  const { data: recentLogs } = await supabase
    .from("workout_logs")
    .select("*, sessions(name)")
    .eq("athlete_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Workout</h2>

      {/* Program sessions */}
      {assignments && assignments.length > 0 ? (
        assignments.map((assignment) => {
          const program = assignment.programs as {
            id: string;
            name: string;
            sessions: { id: string; name: string; order_index: number; estimated_duration_min: number | null; session_exercises: { id: string }[] }[];
          };
          const sessions = program.sessions.sort((a, b) => a.order_index - b.order_index);

          return (
            <div key={assignment.id} className="space-y-3">
              <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                {program.name}
              </h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {session.estimated_duration_min && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.estimated_duration_min} min
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {session.session_exercises.length} exercises
                          </span>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/workout/${session.id}`}>
                          <PlayCircle className="h-4 w-4" />
                          Start
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No programs assigned. Ask your coach to assign one!</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/programs">Browse Programs</Link>
          </Button>
        </div>
      )}

      {/* Recent workouts */}
      {recentLogs && recentLogs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Recent Workouts
          </h3>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const duration = log.completed_at && log.started_at
                ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 60000)
                : null;
              return (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {(log.sessions as { name: string } | null)?.name ?? "Free workout"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.started_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short"
                      })}
                      {duration ? ` · ${duration} min` : ""}
                    </p>
                  </div>
                  <Badge variant="secondary">Done</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
