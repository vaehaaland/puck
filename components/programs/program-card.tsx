import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight } from "lucide-react";

interface Program {
  id: string;
  name: string;
  description: string | null;
  sessions?: { id: string }[];
}

interface ProgramCardProps {
  program: Program;
  isCoach?: boolean;
}

export function ProgramCard({ program, isCoach }: ProgramCardProps) {
  const sessionCount = program.sessions?.length ?? 0;

  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex-1">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Dumbbell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{program.name}</h3>
              {isCoach && (
                <Badge variant="secondary" className="text-xs">
                  Coach
                </Badge>
              )}
            </div>
            {program.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {program.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {sessionCount} session{sessionCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/programs/${program.id}`}>
            View Program <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
