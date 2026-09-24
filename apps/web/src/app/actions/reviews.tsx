"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean };

export async function saveReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to leave a review." };

  const propertyId = String(formData.get("property_id") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!propertyId) return { error: "Something went wrong." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { error: "Pick a star rating." };
  if (comment.length > 1000) return { error: "Keep it under 1000 characters." };

  const { error } = await supabase
    .from("reviews")
    .upsert(
      { property_id: propertyId, student_id: user.id, rating, comment: comment || null },
      { onConflict: "property_id,student_id" }
    );

  if (error) {
    // the RLS insert policy blocks listers reviewing their own place
    return { error: error.message.includes("row-level security")
      ? "You can't review your own property."
      : error.message };
  }

  revalidatePath(`/property/${propertyId}`);
  return { ok: true };
}

export async function deleteReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const propertyId = String(formData.get("property_id") ?? "");

  await supabase.from("reviews").delete().eq("property_id", propertyId).eq("student_id", user.id);
  revalidatePath(`/property/${propertyId}`);
}