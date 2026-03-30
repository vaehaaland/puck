"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { UserPlus } from "lucide-react";

interface AssignProgramButtonProps {
  programId: string;
}

export function AssignProgramButton({ programId }: AssignProgramButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAssign = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // Find athlete by email
    const { data: athletes, error: findError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "athlete");

    if (findError) {
      setError("Failed to search for user");
      setLoading(false);
      return;
    }

    // We need to find by email — search via auth admin is not available client-side
    // Instead, find profile that matches via a custom approach
    // For now, we use the email to look up auth users via RPC or stored email
    // Workaround: store email in profiles or use a lookup approach
    // Here we'll use an email field in profiles (coaches search by athlete email)
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (!profileByEmail) {
      setError("Athlete not found with that email");
      setLoading(false);
      return;
    }

    // Create coach_athlete relationship
    await supabase
      .from("coach_athletes")
      .upsert({ coach_id: (await supabase.auth.getUser()).data.user!.id, athlete_id: profileByEmail.id });

    // Assign program
    const { error: assignError } = await supabase.from("program_assignments").upsert({
      program_id: programId,
      athlete_id: profileByEmail.id,
      status: "active",
    });

    if (assignError) {
      setError(assignError.message);
    } else {
      setSuccess(true);
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Assign
      </Button>

      <Dialog open={open} onClose={() => { setOpen(false); setError(null); setSuccess(false); }}>
        <DialogTitle>Assign Program to Athlete</DialogTitle>
        {success ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-600">Program assigned successfully!</p>
            <Button onClick={() => setOpen(false)} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="athlete-email">Athlete Email</Label>
              <Input
                id="athlete-email"
                type="email"
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button onClick={handleAssign} disabled={loading || !email} className="w-full">
              {loading ? "Assigning…" : "Assign Program"}
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
