"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Rule, RuleInsert, RuleUpdate } from "@/types/database";

export async function getRules() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Rule[] };
}

export async function createRule(rule: Omit<RuleInsert, "user_id">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const insertData: RuleInsert = {
    ...rule,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("rules")
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/rules");
  return { error: null, data: data as Rule };
}

export async function updateRule(id: string, rule: RuleUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("rules")
    .update(rule as any)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/rules");
  return { error: null, data: data as Rule };
}

export async function deleteRule(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { error } = await supabase
    .from("rules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/rules");
  return { error: null, data: true };
}

export async function toggleRuleActive(id: string, isActive: boolean) {
  return updateRule(id, { is_active: isActive });
}
