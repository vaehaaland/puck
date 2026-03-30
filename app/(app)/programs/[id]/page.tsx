import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlayCircle, Clock, Dumbbell } from "lucide-react";
import { AssignProgramButton } from "@/components/programs/assign-program-button";

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: program }, { data: profile }] = await Promise.all([
    supabase
      .from("programs")
      .select("*, sessions(*, session_exercises(*))")
      .eq("id", params.id)
      .single(),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  if (!program) notFound();

  const isCoach = profile?.role === "coach" && program.coach_id === user.id;
  const sessions = (program.sessions as typeof program.sessions ?? []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{program.name}</h2>
          {program.description && (
            <p className="text-muted-foreground mt-1">{program.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isCoach && (
          <div className="flex gap-2 shrink-0">
            <AssignProgramButton programId={program.id} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/programs/${program.id}/edit`}>Edit</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session: { id: string; name: string; description: string | null; estimated_duration_min: number | null; session_exercises: { id: string; exercise_name: string; sets: number; reps: string; target_weight_kg: number | null; rest_seconds: number | null }[] }) => (
          <Card key={session.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{session.name}</h3>
                    {session.estimated_duration_min && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.estimated_duration_min} min
                      </Badge>
                    )}
                  </div>
                  {session.description && (
                    <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                  )}

                  {session.session_exercises?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {(session.session_exercises as typeof session.session_exercises).sort((a, b) => 0).map((ex) => (
                        <div key={ex.id} className="flex items-center gap-2 text-sm">
                          <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{ex.exercise_name}</span>
                          <span className="text-muted-foreground">
                            {ex.sets} × {ex.reps}
                            {ex.target_weight_kg ? ` @ ${ex.target_weight_kg}kg` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link href={`/workout/${session.id}`}>
                    <PlayCircle className="h-4 w-4" />
                    Start
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
