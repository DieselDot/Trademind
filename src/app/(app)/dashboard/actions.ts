"use server";

import { createClient } from "@/lib/supabase/server";
import type { Session, Trade } from "@/types/database";

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get all completed sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("date", { ascending: false });

  if (sessionsError) {
    return { error: sessionsError.message, data: null };
  }

  const sessions = sessionsData as Session[];

  // Get all trades for this user
  const { data: tradesData, error: tradesError } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id);

  if (tradesError) {
    return { error: tradesError.message, data: null };
  }

  const trades = tradesData as Trade[];

  // Get active rules count
  const { count: rulesCount } = await supabase
    .from("rules")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Get active session if any
  const { data: activeSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single() as { data: { id: string } | null };

  // Calculate stats
  const totalSessions = sessions?.length || 0;
  const totalTrades = trades?.length || 0;
  const wins = trades?.filter((t) => t.result === "win").length || 0;
  const losses = trades?.filter((t) => t.result === "loss").length || 0;
  const totalPnl = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
  const rulesFollowed = trades?.filter((t) => t.rules_followed).length || 0;
  const rulesFollowedPercentage = totalTrades > 0 ? Math.round((rulesFollowed / totalTrades) * 100) : 100;

  // Calculate average discipline score
  const scoresWithValues = sessions?.filter((s) => s.discipline_score !== null) || [];
  const avgDisciplineScore = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((sum, s) => sum + (s.discipline_score || 0), 0) / scoresWithValues.length)
    : null;

  // Get latest discipline score
  const latestScore = sessions?.[0]?.discipline_score || null;

  // Calculate streak (consecutive days with sessions)
  let streak = 0;
  if (sessions && sessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = [...new Set(sessions.map((s) => s.date))].sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      const sessionDate = new Date(sortedDates[i]);
      sessionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow for yesterday if no session today yet
        streak++;
      } else {
        break;
      }
    }
  }

  // Prepare chart data (last 14 sessions)
  const chartData = sessions?.slice(0, 14).reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: s.discipline_score || 0,
    fullDate: s.date,
  })) || [];

  // P&L by day (aggregated by session date)
  const pnlByDay: Record<string, number> = {};
  if (sessions && trades) {
    // Create a map of session_id to date
    const sessionDateMap = new Map(sessions.map(s => [s.id, s.date]));

    // Aggregate P&L by date
    trades.forEach(t => {
      const sessionDate = sessionDateMap.get(t.session_id);
      if (sessionDate) {
        pnlByDay[sessionDate] = (pnlByDay[sessionDate] || 0) + (t.pnl || 0);
      }
    });
  }

  // Convert to sorted array for chart
  const pnlChartData = Object.entries(pnlByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({
      date,
      pnl,
      displayDate: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  // Calculate cumulative P&L for trend
  let cumulativePnl = 0;
  const pnlTrendData = pnlChartData.map(item => {
    cumulativePnl += item.pnl;
    return {
      ...item,
      cumulativePnl,
    };
  });

  // Emotion distribution across all trades
  const emotionDistribution = trades?.reduce((acc, t) => {
    acc[t.emotion_tag] = (acc[t.emotion_tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Win rate by emotion
  const emotionWinRate = Object.keys(emotionDistribution).map((emotion) => {
    const emotionTrades = trades?.filter((t) => t.emotion_tag === emotion) || [];
    const emotionWins = emotionTrades.filter((t) => t.result === "win").length;
    return {
      emotion,
      winRate: emotionTrades.length > 0 ? Math.round((emotionWins / emotionTrades.length) * 100) : 0,
      total: emotionTrades.length,
    };
  });

  return {
    error: null,
    data: {
      totalSessions,
      totalTrades,
      wins,
      losses,
      totalPnl,
      rulesFollowedPercentage,
      avgDisciplineScore,
      latestScore,
      streak,
      rulesCount: rulesCount || 0,
      activeSessionId: activeSession?.id || null,
      chartData,
      emotionDistribution,
      emotionWinRate,
      pnlTrendData,
      recentSessions: sessions?.slice(0, 5) || [],
    },
  };
}
