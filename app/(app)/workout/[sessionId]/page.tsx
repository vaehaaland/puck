import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WorkoutSession } from "@/components/workout/workout-session";

export default async function LiveWorkoutPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: session } = await supabase
    .from("sessions")
    .select("*, session_exercises(*), programs(id)")
    .eq("id", params.sessionId)
    .single();

  if (!session) notFound();

  // Get PRs for all exercises in this session
  const exerciseNames = (session.session_exercises as { exercise_name: string }[]).map(
    (e) => e.exercise_name
  );
  const { data: existingPRs } = await supabase
    .from("personal_records")
    .select("exercise_name, one_rep_max, weight_kg, reps")
    .eq("athlete_id", user.id)
    .in("exercise_name", exerciseNames);

  return (
    <WorkoutSession
      session={session}
      athleteId={user.id}
      existingPRs={existingPRs ?? []}
    />
  );
}
