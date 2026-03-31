import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

export default async function AthletesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") redirect("/dashboard");

  const { data: relationships } = await supabase
    .from("coach_athletes")
    .select("athlete_id, profiles!coach_athletes_athlete_id_fkey(id, full_name, created_at)")
    .eq("coach_id", user.id);

  const athletes = (relationships ?? []).map((r) => r.profiles as unknown as { id: string; full_name: string; created_at: string });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Athletes</h2>
        <Badge variant="secondary">{athletes.length} athletes</Badge>
      </div>

      {athletes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Users className="h-12 w-12 mx-auto opacity-30" />
          <p>No athletes yet.</p>
          <p className="text-sm">Assign a program to an athlete to add them here.</p>
          <Button asChild className="mt-2">
            <Link href="/programs">Go to Programs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {athletes.map((athlete) => (
            <Card key={athlete.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{athlete.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Since {new Date(athlete.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/athletes/${athlete.id}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
