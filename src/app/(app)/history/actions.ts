"use server";

import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/types/database";

export async function getSessionHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data: sessionsData, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  const sessions = sessionsData as Session[];

  // Get trade counts for each session
  const sessionIds = sessions?.map((s) => s.id) || [];

  if (sessionIds.length === 0) {
    return { error: null, data: [] };
  }

  const { data: trades } = await supabase
    .from("trades")
    .select("session_id, result, pnl, rules_followed")
    .in("session_id", sessionIds) as { data: { session_id: string; result: string; pnl: number | null; rules_followed: boolean }[] | null };

  // Aggregate trade data per session
  const tradeStats = trades?.reduce((acc, trade) => {
    if (!acc[trade.session_id]) {
      acc[trade.session_id] = {
        count: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        rulesFollowed: 0,
      };
    }
    acc[trade.session_id].count++;
    if (trade.result === "win") acc[trade.session_id].wins++;
    if (trade.result === "loss") acc[trade.session_id].losses++;
    acc[trade.session_id].pnl += trade.pnl || 0;
    if (trade.rules_followed) acc[trade.session_id].rulesFollowed++;
    return acc;
  }, {} as Record<string, { count: number; wins: number; losses: number; pnl: number; rulesFollowed: number }>);

  const sessionsWithStats = sessions?.map((session) => ({
    ...session,
    tradeStats: tradeStats?.[session.id] || {
      count: 0,
      wins: 0,
      losses: 0,
      pnl: 0,
      rulesFollowed: 0,
    },
  }));

  return { error: null, data: sessionsWithStats };
}
