"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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

interface EmotionChartProps {
  data: Record<string, number>;
}

export function EmotionChart({ data }: EmotionChartProps) {
  const chartData = Object.entries(data).map(([emotion, count]) => ({
    name: EMOTION_LABELS[emotion] || emotion,
    value: count,
    color: EMOTION_COLORS[emotion] || "#94A3B8",
  }));

  if (chartData.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Log trades to see your emotion distribution
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Emotion Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.032 265)",
                  border: "1px solid oklch(0.25 0.025 260)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "oklch(0.95 0.01 250)", fontWeight: 500 }}
                itemStyle={{ color: "oklch(0.95 0.01 250)" }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "oklch(0.95 0.01 250)", fontSize: "12px", fontWeight: 400 }}>{value}</span>
                )}
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
