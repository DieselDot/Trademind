import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionHistory } from "./actions";
import type { PreSessionData } from "@/types/database";

export default async function HistoryPage() {
  const { data: sessions, error } = await getSessionHistory();

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-destructive">Error loading history</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  // Group sessions by month
  const groupedSessions = sessions?.reduce((acc, session) => {
    const date = new Date(session.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, sessions: [] };
    }
    acc[monthKey].sessions.push(session);
    return acc;
  }, {} as Record<string, { label: string; sessions: typeof sessions }>) || {};

  const sortedMonths = Object.keys(groupedSessions).sort().reverse();

  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-muted-foreground mt-1">
            Review your past trading sessions
          </p>
        </div>
        <Link href="/session/new">
          <Button className="transition-all duration-200 hover:scale-105">New Session</Button>
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">No sessions yet</h3>
            <p className="text-muted-foreground mt-2">
              Complete your first trading session to see it here.
            </p>
            <Link href="/session/new">
              <Button className="mt-4">Start First Session</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((monthKey) => {
            const { label, sessions: monthSessions } = groupedSessions[monthKey];

            // Calculate month stats
            const completedSessions = monthSessions.filter((s) => s.status === "completed");
            const avgScore =
              completedSessions.length > 0
                ? Math.round(
                    completedSessions.reduce((sum, s) => sum + (s.discipline_score || 0), 0) /
                      completedSessions.length
                  )
                : null;
            const totalPnl = monthSessions.reduce((sum, s) => sum + (s.tradeStats?.pnl || 0), 0);

            return (
              <div key={monthKey}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{label}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{monthSessions.length} sessions</span>
                    {avgScore !== null && <span>Avg Score: {avgScore}</span>}
                    <span
                      className={`stat-number ${
                        totalPnl > 0
                          ? "text-success"
                          : totalPnl < 0
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {monthSessions.map((session) => {
                    const preSession = session.pre_session as PreSessionData;
                    const stats = session.tradeStats;
                    const isActive = session.status === "active";

                    return (
                      <Link
                        key={session.id}
                        href={
                          isActive
                            ? `/session/${session.id}`
                            : `/session/${session.id}/review`
                        }
                      >
                        <Card className="card-hover cursor-pointer">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                {/* Score */}
                                <div
                                  className={`stat-number text-3xl font-bold w-16 text-center ${
                                    isActive
                                      ? "text-warning"
                                      : (session.discipline_score || 0) >= 80
                                      ? "text-success"
                                      : (session.discipline_score || 0) >= 60
                                      ? "text-warning"
                                      : "text-destructive"
                                  }`}
                                >
                                  {isActive ? "..." : session.discipline_score ?? "--"}
                                </div>

                                {/* Date & Time */}
                                <div>
                                  <p className="font-medium">
                                    {new Date(session.date).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.started_at &&
                                      new Date(session.started_at).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                    {session.ended_at &&
                                      ` - ${new Date(session.ended_at).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        }
                                      )}`}
                                  </p>
                                </div>

                                {/* Status Badge */}
                                {isActive && (
                                  <Badge className="badge-smooth bg-warning/10 text-warning border-warning/20">
                                    In Progress
                                  </Badge>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-8 text-sm">
                                {/* Trades */}
                                <div className="text-center">
                                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Trades</p>
                                  <p className="font-medium stat-number">
                                    {stats?.count || 0}
                                    {preSession?.maxTrades && (
                                      <span className="text-muted-foreground">
                                        /{preSession.maxTrades}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                {/* Win/Loss */}
                                <div className="text-center">
                                  <p className="text-muted-foreground text-xs uppercase tracking-wide">W/L</p>
                                  <p className="font-medium stat-number">
                                    <span className="text-success">{stats?.wins || 0}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-destructive">{stats?.losses || 0}</span>
                                  </p>
                                </div>

                                {/* P&L */}
                                <div className="text-center min-w-[80px]">
                                  <p className="text-muted-foreground text-xs uppercase tracking-wide">P&L</p>
                                  <p
                                    className={`font-medium stat-number ${
                                      (stats?.pnl || 0) > 0
                                        ? "text-success"
                                        : (stats?.pnl || 0) < 0
                                        ? "text-destructive"
                                        : ""
                                    }`}
                                  >
                                    {(stats?.pnl || 0) >= 0 ? "+" : ""}$
                                    {(stats?.pnl || 0).toFixed(2)}
                                  </p>
                                </div>

                                {/* Rules */}
                                <div className="text-center">
                                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Rules</p>
                                  <p className="font-medium stat-number">
                                    {stats && stats.count > 0
                                      ? `${Math.round(
                                          (stats.rulesFollowed / stats.count) * 100
                                        )}%`
                                      : "100%"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
