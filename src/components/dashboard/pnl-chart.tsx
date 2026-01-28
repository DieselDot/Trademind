"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PnlDataPoint {
  date: string;
  pnl: number;
  displayDate: string;
  cumulativePnl: number;
}

interface PnlChartProps {
  data: PnlDataPoint[];
}

type TimePeriod = "7d" | "30d" | "90d" | "1y" | "all";

const periodLabels: Record<TimePeriod, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
  "all": "All",
};

const periodDays: Record<TimePeriod, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
  "all": null,
};

export function PnlChart({ data }: PnlChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("30d");

  const filteredData = useMemo(() => {
    const days = periodDays[period];
    if (!days) return data;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    return data.filter((d) => d.date >= cutoffStr);
  }, [data, period]);

  // Calculate period stats
  const periodStats = useMemo(() => {
    if (filteredData.length === 0) return { total: 0, change: 0 };

    const totalPnl = filteredData.reduce((sum, d) => sum + d.pnl, 0);
    const firstCumulative = filteredData[0]?.cumulativePnl - filteredData[0]?.pnl || 0;
    const lastCumulative = filteredData[filteredData.length - 1]?.cumulativePnl || 0;
    const change = lastCumulative - firstCumulative;

    return { total: totalPnl, change };
  }, [filteredData]);

  if (data.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>P&L Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Log trades to see your P&L trend
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
    return value < 0 ? `-${formatted}` : formatted;
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>P&L Trend</CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-xs text-muted-foreground">Period P&L</p>
              <p className={`text-lg font-bold stat-number ${periodStats.total >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(periodStats.total)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cumulative</p>
              <p className={`text-lg font-bold stat-number ${filteredData[filteredData.length - 1]?.cumulativePnl >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(filteredData[filteredData.length - 1]?.cumulativePnl || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={`h-7 px-2 text-xs ${period === p ? "" : "text-muted-foreground hover:text-foreground"}`}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGradientPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pnlGradientNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.025 260)" strokeOpacity={0.5} />
              <XAxis
                dataKey="displayDate"
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
                tickFormatter={(v) => `$${v}`}
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
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === "cumulativePnl" ? "Cumulative P&L" : "Daily P&L",
                ]}
              />
              <ReferenceLine y={0} stroke="oklch(0.5 0.025 260)" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke={filteredData[filteredData.length - 1]?.cumulativePnl >= 0 ? "#22C55E" : "#EF4444"}
                strokeWidth={2}
                fill={filteredData[filteredData.length - 1]?.cumulativePnl >= 0 ? "url(#pnlGradientPositive)" : "url(#pnlGradientNegative)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
