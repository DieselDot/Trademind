"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsCardsProps {
  latestScore: number | null;
  avgScore: number | null;
  totalSessions: number;
  totalTrades: number;
  wins: number;
  losses: number;
  totalPnl: number;
  rulesFollowedPercentage: number;
  streak: number;
  rulesCount: number;
}

export function StatsCards({
  latestScore,
  avgScore,
  totalSessions,
  totalTrades,
  wins,
  losses,
  totalPnl,
  rulesFollowedPercentage,
  streak,
  rulesCount,
}: StatsCardsProps) {
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      {/* Discipline Score */}
      <Card className="card-hover border-primary/30 glow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Discipline Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-number text-4xl font-bold text-primary">
            {latestScore ?? "--"}
          </div>
          <Progress value={latestScore || 0} className="mt-3 h-1.5 progress-smooth" />
          {avgScore !== null && (
            <p className="text-xs text-muted-foreground mt-2">
              Average: <span className="stat-number">{avgScore}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="stat-number text-4xl font-bold">{streak}</span>
            <span className="text-base text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="stat-number">{totalSessions}</span> total sessions
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-0.5">
            <span className="stat-number text-4xl font-bold">{winRate}</span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-success"><span className="stat-number">{wins}</span> wins</span>
            <span className="text-destructive"><span className="stat-number">{losses}</span> losses</span>
          </div>
        </CardContent>
      </Card>

      {/* P&L */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Total P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`stat-number text-4xl font-bold ${
              totalPnl > 0 ? "text-success" : totalPnl < 0 ? "text-destructive" : ""
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="stat-number">{totalTrades}</span> total trades
          </p>
        </CardContent>
      </Card>

      {/* Rules Followed */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Rules Followed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-0.5">
            <span className="stat-number text-4xl font-bold">{rulesFollowedPercentage}</span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <Progress value={rulesFollowedPercentage} className="mt-3 h-1.5 progress-smooth" />
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Active Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-number text-4xl font-bold">{rulesCount}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Trading rules defined
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
