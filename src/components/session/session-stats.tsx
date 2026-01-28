"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Trade, PreSessionData } from "@/types/database";

interface SessionStatsProps {
  trades: Trade[];
  preSession: PreSessionData;
  startedAt: string;
}

export function SessionStats({ trades, preSession, startedAt }: SessionStatsProps) {
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const breakeven = trades.filter((t) => t.result === "breakeven").length;
  const rulesFollowed = trades.filter((t) => t.rules_followed).length;
  const totalTrades = trades.length;

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const rulesPercentage = totalTrades > 0 ? (rulesFollowed / totalTrades) * 100 : 100;
  const tradesUsed = preSession.maxTrades ? (totalTrades / preSession.maxTrades) * 100 : 0;

  // Calculate session duration
  const startTime = new Date(startedAt);
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-number text-2xl font-bold">
            {totalTrades}
            {preSession.maxTrades && (
              <span className="text-muted-foreground text-lg">
                /{preSession.maxTrades}
              </span>
            )}
          </div>
          {preSession.maxTrades && (
            <Progress value={tradesUsed} className="mt-2 h-1.5 progress-smooth" />
          )}
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-success stat-number">{wins}W</span>
            <span className="text-destructive stat-number">{losses}L</span>
            <span className="text-muted-foreground stat-number">{breakeven}BE</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`stat-number text-2xl font-bold ${
              totalPnl > 0
                ? "text-success"
                : totalPnl < 0
                ? "text-destructive"
                : ""
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
          {preSession.maxLoss && preSession.maxLoss > 0 && (
            <>
              <Progress
                value={Math.min(Math.abs(Math.min(totalPnl, 0)) / preSession.maxLoss * 100, 100)}
                className="mt-2 h-1.5 progress-smooth"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max loss: <span className="stat-number">${preSession.maxLoss}</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Rules Followed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-number text-2xl font-bold">
            {rulesPercentage.toFixed(0)}%
          </div>
          <Progress value={rulesPercentage} className="mt-2 h-1.5 progress-smooth" />
          <p className="text-xs text-muted-foreground mt-1">
            <span className="stat-number">{rulesFollowed}</span> of <span className="stat-number">{totalTrades}</span> trades
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Session Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-number text-2xl font-bold">
            {hours}h {minutes}m
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Started {startTime.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
