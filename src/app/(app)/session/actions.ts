"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SessionInsert, SessionUpdate, PreSessionData } from "@/types/database";

export async function createSession(preSession: PreSessionData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      pre_session: preSession,
      status: "active",
    } as SessionInsert)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { error: null, data };
}

export async function getActiveSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

export async function getSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

export async function updateSession(id: string, updates: SessionUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath(`/session/${id}`);
  return { error: null, data };
}

export async function getUserRules() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("category", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}
