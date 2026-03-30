import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProgramCard } from "@/components/programs/program-card";
import { Plus } from "lucide-react";

export default async function ProgramsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";

  // Coaches see their own programs; athletes see assigned ones
  let programs: { id: string; name: string; description: string | null; coach_id: string; created_at: string; updated_at: string; sessions?: { id: string }[] }[] = [];
  if (isCoach) {
    const { data } = await supabase
      .from("programs")
      .select("*, sessions(id)")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false });
    programs = data ?? [];
  } else {
    const { data } = await supabase
      .from("program_assignments")
      .select("status, programs(*, sessions(id))")
      .eq("athlete_id", user.id)
      .order("assigned_at", { ascending: false });
    programs = (data ?? []).map((a) => a.programs as unknown as typeof programs[0]);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Programs</h2>
        {isCoach && (
          <Button asChild>
            <Link href="/programs/new">
              <Plus className="h-4 w-4" />
              New Program
            </Link>
          </Button>
        )}
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-3">
          <p className="text-lg">
            {isCoach ? "No programs yet." : "No programs assigned yet."}
          </p>
          {isCoach && (
            <Button asChild>
              <Link href="/programs/new">Create your first program</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} isCoach={isCoach} />
          ))}
        </div>
      )}
    </div>
  );
}
