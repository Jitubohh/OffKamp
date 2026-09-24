"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BookmarkResult = { ok: boolean; saved: boolean; needsAuth?: boolean };

export async function toggleBookmark(propertyId: string, next: boolean): Promise<BookmarkResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, saved: false, needsAuth: true };

  if (next) {
    const { error } = await supabase
      .from("bookmarks")
      .upsert({ student_id: user.id, property_id: propertyId }, { onConflict: "student_id,property_id" });
    if (error) return { ok: false, saved: false };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("student_id", user.id)
      .eq("property_id", propertyId);
    if (error) return { ok: false, saved: true };
  }

  revalidatePath("/saved");
  return { ok: true, saved: next };
}