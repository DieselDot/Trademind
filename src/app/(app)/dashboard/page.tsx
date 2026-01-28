import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "./actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { EmotionChart } from "@/components/dashboard/emotion-chart";
import { EmotionWinRate } from "@/components/dashboard/emotion-winrate";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { RecentSessions } from "@/components/dashboard/recent-sessions";

export default async function DashboardPage() {
  const { data, error } = await getDashboardStats();

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-destructive">Error loading dashboard</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  const {
    totalSessions,
    totalTrades,
    wins,
    losses,
    totalPnl,
    rulesFollowedPercentage,
    avgDisciplineScore,
    latestScore,
    streak,
    rulesCount,
    activeSessionId,
    chartData,
    emotionDistribution,
    emotionWinRate,
    pnlTrendData,
    recentSessions,
  } = data;

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your discipline, improve your trading.
          </p>
        </div>
        {activeSessionId ? (
          <Link href={`/session/${activeSessionId}`}>
            <Button className="glow-primary">Continue Session</Button>
          </Link>
        ) : (
          <Link href="/session/new">
            <Button className="transition-all duration-200 hover:scale-105">Start Session</Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <StatsCards
        latestScore={latestScore}
        avgScore={avgDisciplineScore}
        totalSessions={totalSessions}
        totalTrades={totalTrades}
        wins={wins}
        losses={losses}
        totalPnl={totalPnl}
        rulesFollowedPercentage={rulesFollowedPercentage}
        streak={streak}
        rulesCount={rulesCount}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 stagger-children">
        <ScoreChart data={chartData} />
        <RecentSessions sessions={recentSessions} />
      </div>

      {/* P&L Chart */}
      {totalTrades > 0 && (
        <PnlChart data={pnlTrendData} />
      )}

      {/* Emotion Charts */}
      {totalTrades > 0 && (
        <div className="grid gap-6 lg:grid-cols-2 stagger-children">
          <EmotionChart data={emotionDistribution} />
          <EmotionWinRate data={emotionWinRate} />
        </div>
      )}

      {/* Empty State for New Users */}
      {totalSessions === 0 && (
        <div className="text-center py-8 px-4 rounded-lg border border-dashed">
          <h3 className="text-lg font-semibold">Welcome to TradeMind!</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Start by creating your trading rules, then begin your first session to track your discipline.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/rules">
              <Button variant="outline">Set Up Rules</Button>
            </Link>
            <Link href="/session/new">
              <Button>Start First Session</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
