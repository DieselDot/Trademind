"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TradeInsert, PostSessionData } from "@/types/database";

export async function getSessionWithTrades(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError) {
    return { error: sessionError.message, data: null };
  }

  const { data: trades, error: tradesError } = await supabase
    .from("trades")
    .select("*")
    .eq("session_id", sessionId)
    .order("trade_number", { ascending: true });

  if (tradesError) {
    return { error: tradesError.message, data: null };
  }

  return { error: null, data: { session, trades } };
}

export async function addTrade(
  sessionId: string,
  trade: Omit<TradeInsert, "session_id" | "user_id" | "trade_number">
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get the current trade count for this session
  const { count } = await supabase
    .from("trades")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const tradeNumber = (count || 0) + 1;

  const { data, error } = await supabase
    .from("trades")
    .insert({
      ...trade,
      session_id: sessionId,
      user_id: user.id,
      trade_number: tradeNumber,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath(`/session/${sessionId}`);
  return { error: null, data };
}

export async function deleteTrade(tradeId: string, sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath(`/session/${sessionId}`);
  return { error: null, data: true };
}

export async function endSession(
  sessionId: string,
  postSession: PostSessionData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get the session and trades to calculate discipline score
  const { data: session } = await supabase
    .from("sessions")
    .select("pre_session")
    .eq("id", sessionId)
    .single();

  const { data: trades } = await supabase
    .from("trades")
    .select("rules_followed")
    .eq("session_id", sessionId);

  // Calculate discipline score
  const disciplineScore = calculateDisciplineScore(
    session?.pre_session,
    postSession,
    trades || []
  );

  const { data, error } = await supabase
    .from("sessions")
    .update({
      post_session: postSession,
      discipline_score: disciplineScore,
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath(`/session/${sessionId}`);
  return { error: null, data };
}

function calculateDisciplineScore(
  preSession: any,
  postSession: PostSessionData,
  trades: { rules_followed: boolean }[]
): number {
  const weights = {
    rulesFollowed: 0.4,
    preSessionComplete: 0.2,
    postSessionComplete: 0.2,
    emotionalControl: 0.2,
  };

  // Rules followed (0-100)
  const totalTrades = trades.length;
  const rulesFollowedCount = trades.filter((t) => t.rules_followed).length;
  const rulesScore =
    totalTrades > 0 ? (rulesFollowedCount / totalTrades) * 100 : 100;

  // Pre-session complete (0 or 100)
  const preSessionScore = preSession?.rulesConfirmed ? 100 : 0;

  // Post-session complete (0 or 100)
  const postSessionScore = postSession?.planFollowedRating ? 100 : 0;

  // Emotional control (from post-session, 1-5 → 0-100)
  const emotionalScore = postSession?.emotionalControlRating
    ? (postSession.emotionalControlRating / 5) * 100
    : 50;

  // Weighted total
  const finalScore =
    rulesScore * weights.rulesFollowed +
    preSessionScore * weights.preSessionComplete +
    postSessionScore * weights.postSessionComplete +
    emotionalScore * weights.emotionalControl;

  return Math.round(finalScore);
}

export async function getUserRulesForSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("rules")
    .select("id, name, category")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("category", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}
