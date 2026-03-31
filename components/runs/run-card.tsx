import { Card, CardContent } from "@/components/ui/card";
import { calcPaceSeconds, formatPace, formatDuration } from "@/lib/utils/pace";
import { Route, Clock } from "lucide-react";

interface Run {
  id: string;
  date: string;
  distance_km: number;
  duration_seconds: number;
  notes: string | null;
}

interface RunCardProps {
  run: Run;
}

export function RunCard({ run }: RunCardProps) {
  const pace = calcPaceSeconds(run.distance_km, run.duration_seconds);

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Route className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{run.distance_km} km</span>
            <span className="text-sm text-muted-foreground">{formatPace(pace)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>
              {new Date(run.date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(run.duration_seconds)}
            </span>
          </div>
          {run.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{run.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
