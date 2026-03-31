import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: program } = await supabase
    .from("programs")
    .select("id, coach_id, name")
    .eq("id", params.id)
    .single();

  if (!program || program.coach_id !== user.id) notFound();

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/programs/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Edit: {program.name}</h2>
      </div>
      <p className="text-muted-foreground">
        Full edit functionality — add/remove sessions and exercises directly from the program view.
        Full edit UI coming in next iteration.
      </p>
    </div>
  );
}
