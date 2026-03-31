import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface PR {
  id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  one_rep_max: number;
  achieved_at: string;
}

interface PRListProps {
  prs: PR[];
}

export function PRList({ prs }: PRListProps) {
  // Group by exercise, keep only the best
  const byExercise: Record<string, PR> = {};
  prs.forEach((pr) => {
    if (!byExercise[pr.exercise_name] || pr.one_rep_max > byExercise[pr.exercise_name].one_rep_max) {
      byExercise[pr.exercise_name] = pr;
    }
  });
  const best = Object.values(byExercise).sort((a, b) => b.one_rep_max - a.one_rep_max);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {best.map((pr) => (
            <div key={pr.id} className="flex items-center gap-3 px-4 py-3">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{pr.exercise_name}</p>
                <p className="text-xs text-muted-foreground">
                  {pr.weight_kg}kg × {pr.reps} reps ·{" "}
                  {new Date(pr.achieved_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant="warning" className="shrink-0">
                {pr.one_rep_max.toFixed(1)}kg 1RM
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
