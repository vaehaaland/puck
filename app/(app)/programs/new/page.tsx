import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgramBuilder } from "@/components/programs/program-builder";

export default async function NewProgramPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/programs");
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Program</h2>
      <ProgramBuilder coachId={user.id} />
    </div>
  );
}
