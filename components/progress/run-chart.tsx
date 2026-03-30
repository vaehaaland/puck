"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface RunDataPoint {
  date: string;
  distance: number;
  pace: number; // min/km decimal
}

interface RunChartProps {
  data: RunDataPoint[];
}

export function RunChart({ data }: RunChartProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              }
            />
            <YAxis yAxisId="dist" tick={{ fontSize: 11 }} unit="km" />
            <YAxis
              yAxisId="pace"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => {
                const m = Math.floor(v);
                const s = Math.round((v - m) * 60);
                return `${m}:${String(s).padStart(2, "0")}`;
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = typeof value === "number" ? value : 0;
                if (name === "distance") return [`${v} km`, "Distance"];
                const m = Math.floor(v);
                const s = Math.round((v - m) * 60);
                return [`${m}:${String(s).padStart(2, "0")} /km`, "Pace"];
              }}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              }
            />
            <Legend />
            <Bar yAxisId="dist" dataKey="distance" fill="hsl(142 70% 45%)" opacity={0.8} name="distance" />
            <Line
              yAxisId="pace"
              type="monotone"
              dataKey="pace"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              dot={false}
              name="pace"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
