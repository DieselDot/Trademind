"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  confident: "#22C55E",
  calm: "#3B82F6",
  fomo: "#F59E0B",
  revenge: "#EF4444",
  fearful: "#A855F7",
  frustrated: "#F97316",
};

const EMOTION_LABELS: Record<string, string> = {
  confident: "Confident",
  calm: "Calm",
  fomo: "FOMO",
  revenge: "Revenge",
  fearful: "Fearful",
  frustrated: "Frustrated",
};

interface EmotionWinRateData {
  emotion: string;
  winRate: number;
  total: number;
}

interface EmotionWinRateProps {
  data: EmotionWinRateData[];
}

export function EmotionWinRate({ data }: EmotionWinRateProps) {
  const chartData = data
    .filter((d) => d.total > 0)
    .map((d) => ({
      ...d,
      name: EMOTION_LABELS[d.emotion] || d.emotion,
      color: EMOTION_COLORS[d.emotion] || "#94A3B8",
    }))
    .sort((a, b) => b.winRate - a.winRate);

  if (chartData.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Win Rate by Emotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Log trades to see win rate by emotion
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Win Rate by Emotion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 260)" strokeOpacity={0.5} horizontal={false} />
              <XAxis
                type="number"
                stroke="oklch(0.65 0.025 255)"
                fontSize={11}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="oklch(0.65 0.025 255)"
                fontSize={11}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.032 265)",
                  border: "1px solid oklch(0.25 0.025 260)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "oklch(0.95 0.01 250)", fontWeight: 500 }}
                itemStyle={{ color: "oklch(0.95 0.01 250)" }}
                formatter={(value: number, _name: string, props: any) => [
                  `${value}% (${props.payload.total} trades)`,
                  "Win Rate",
                ]}
              />
              <Bar dataKey="winRate" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
