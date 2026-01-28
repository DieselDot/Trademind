"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartDataPoint {
  date: string;
  score: number;
  fullDate: string;
}

interface ScoreChartProps {
  data: ChartDataPoint[];
  goalScore?: number;
}

export function ScoreChart({ data, goalScore = 80 }: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Discipline Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Complete a session to see your discipline score trend
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Discipline Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 255)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.65 0.2 255)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 260)" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="oklch(0.65 0.025 255)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.65 0.025 255)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.032 265)",
                  border: "1px solid oklch(0.25 0.025 260)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "oklch(0.95 0.01 250)", fontWeight: 500 }}
                itemStyle={{ color: "oklch(0.65 0.2 255)" }}
                formatter={(value: number) => [`${value}`, "Score"]}
              />
              <ReferenceLine
                y={goalScore}
                stroke="oklch(0.7 0.18 145)"
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: `Goal: ${goalScore}`,
                  position: "right",
                  fill: "oklch(0.7 0.18 145)",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="oklch(0.65 0.2 255)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.2 255)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "oklch(0.65 0.2 255)", stroke: "oklch(0.65 0.2 255 / 0.3)", strokeWidth: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
