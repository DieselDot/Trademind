"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry, JournalEntryInsert, JournalEntryUpdate } from "@/types/database";

export async function getJournalEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as JournalEntry[] };
}

export async function getJournalEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as JournalEntry };
}

export async function createJournalEntry(entry: Omit<JournalEntryInsert, "user_id">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const insertData: JournalEntryInsert = {
    ...entry,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/journal");
  return { error: null, data: data as JournalEntry };
}

export async function updateJournalEntry(id: string, entry: JournalEntryUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .update(entry as any)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/journal");
  return { error: null, data: data as JournalEntry };
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get the entry first to delete associated image
  const { data: entry } = await supabase
    .from("journal_entries")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // Delete the image from storage if exists
  if (entry?.image_url) {
    const imagePath = entry.image_url.split("/").slice(-2).join("/");
    await supabase.storage.from("journal-images").remove([imagePath]);
  }

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/journal");
  return { error: null, data: true };
}

export async function uploadJournalImage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", url: null };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", url: null };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("journal-images")
    .upload(fileName, file);

  if (error) {
    return { error: error.message, url: null };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("journal-images")
    .getPublicUrl(fileName);

  return { error: null, url: publicUrl };
}
