"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface DataPoint {
  date: string;
  oneRepMax: number;
}

interface StrengthChartProps {
  exerciseMap: Record<string, DataPoint[]>;
  exerciseNames: string[];
}

export function StrengthChart({ exerciseMap, exerciseNames }: StrengthChartProps) {
  const [selected, setSelected] = useState(exerciseNames[0] ?? "");
  const data = exerciseMap[selected] ?? [];

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <Select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full sm:w-64"
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>

        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                }
              />
              <YAxis tick={{ fontSize: 11 }} unit="kg" />
              <Tooltip
                formatter={(value) => [`${value}kg`, "Est. 1RM"]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                }
              />
              <Line
                type="monotone"
                dataKey="oneRepMax"
                stroke="hsl(221.2 83.2% 53.3%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Log more sets to see progress chart
          </p>
        )}
      </CardContent>
    </Card>
  );
}
