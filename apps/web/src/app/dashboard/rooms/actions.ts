"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AMENITIES, type Amenity, type AmenityMode } from "@/lib/pricing";
import type { Database } from "@/lib/database.types";

export type FormState = { error?: string };

const MODES: AmenityMode[] = ["not_offered", "included", "optional"];

/** "" -> null | positive integer | undefined when invalid */
function priceOrNull(raw: FormDataEntryValue | null): number | null | undefined {
  const s = String(raw ?? "").replace(/[,\s₦]/g, "").trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0 || n > 100_000_000) return undefined;
  return n;
}

/** Confirms this room belongs to the logged-in lister. Returns the property id. */
async function assertOwnership(roomId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." as const };

  const { data: property } = await supabase
    .from("properties").select("id").eq("owner_id", user.id).maybeSingle();
  if (!property) return { error: "Create your property first." as const };

  if (roomId) {
    const { data: room } = await supabase
      .from("room_types").select("id").eq("id", roomId).eq("property_id", property.id).maybeSingle();
    if (!room) return { error: "That room doesn't exist." as const };
  }

  return { supabase, propertyId: property.id };
}

export async function saveRoom(_prev: FormState, formData: FormData): Promise<FormState> {
  const roomId = String(formData.get("room_id") ?? "") || null;

  const ctx = await assertOwnership(roomId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase, propertyId } = ctx;

  const capacity = Number(formData.get("capacity"));
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 6)
    return { error: "Pick a room capacity." };

  const availability: Database["public"]["Enums"]["availability_status"] =
  formData.get("availability") === "full" ? "full" : "available";

  const semester = priceOrNull(formData.get("price_semester"));
  const session = priceOrNull(formData.get("price_session"));
  const tri = priceOrNull(formData.get("price_tri_semester"));

  if (semester === undefined || session === undefined || tri === undefined)
    return { error: "Prices must be whole naira amounts." };
  if (semester === null && session === null && tri === null)
    return { error: "Set at least one price." };

  // ---- 1. the room itself -----------------------------------------
  const payload = {
    property_id: propertyId,
    label: String(formData.get("label") ?? "").trim() || null,
    capacity,
    availability,
    price_semester: semester,
    price_session: session,
    price_tri_semester: tri,
  };

  const { data: room, error: roomError } = roomId
    ? await supabase.from("room_types").update(payload).eq("id", roomId).select("id").single()
    : await supabase.from("room_types").insert(payload).select("id").single();

  if (roomError || !room) return { error: roomError?.message ?? "Couldn't save this room." };

  // ---- 2. amenity rows --------------------------------------------
  const rows = [];
  for (const { value } of AMENITIES) {
    const rawMode = String(formData.get(`amenity_${value}_mode`) ?? "not_offered");
    const mode = (MODES.includes(rawMode as AmenityMode) ? rawMode : "not_offered") as AmenityMode;

    if (mode === "not_offered") continue;

    const extras =
      mode === "optional"
        ? {
            extra_semester: priceOrNull(formData.get(`amenity_${value}_semester`)),
            extra_session: priceOrNull(formData.get(`amenity_${value}_session`)),
            extra_tri_semester: priceOrNull(formData.get(`amenity_${value}_tri_semester`)),
          }
        : { extra_semester: null, extra_session: null, extra_tri_semester: null };

    if (Object.values(extras).some((v) => v === undefined))
      return { error: "Extra costs must be whole naira amounts." };

    if (mode === "optional" && Object.values(extras).every((v) => v === null))
      return { error: `Set at least one extra cost for ${value}, or mark it included.` };

    rows.push({ room_type_id: room.id, amenity: value as Amenity, mode, ...extras });
  }

  const keep = rows.map((r) => r.amenity);
  let del = supabase.from("room_type_amenities").delete().eq("room_type_id", room.id);
  if (keep.length > 0) del = del.not("amenity", "in", `(${keep.join(",")})`);
  const { error: delError } = await del;
  if (delError) return { error: delError.message };

  if (rows.length > 0) {
    const { error: amError } = await supabase
      .from("room_type_amenities")
      .upsert(rows, { onConflict: "room_type_id,amenity" });
    if (amError) return { error: amError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteRoom(formData: FormData) {
  const roomId = String(formData.get("room_id") ?? "");
  const ctx = await assertOwnership(roomId);
  if ("error" in ctx) return;

  await ctx.supabase.from("room_types").delete().eq("id", roomId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}