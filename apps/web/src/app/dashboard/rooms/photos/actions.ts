"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PhotoResult = { error?: string };

/** Confirms the room belongs to the caller. */
async function assertRoomOwner(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const };

  const { data: room } = await supabase
    .from("room_types")
    .select("id, properties!inner(owner_id)")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || room.properties.owner_id !== user.id)
    return { error: "That room isn't yours." as const };

  return { supabase, userId: user.id };
}

/** Records an already-uploaded file in room_photos, at the next free slot. */
export async function attachPhoto(roomId: string, storagePath: string): Promise<PhotoResult> {
  const ctx = await assertRoomOwner(roomId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  // the path must sit under this user's folder — belt and braces over the storage policy
  if (!storagePath.startsWith(`${ctx.userId}/`)) return { error: "Invalid file path." };

  const { data: existing } = await supabase
    .from("room_photos").select("position").eq("room_type_id", roomId);

  const taken = new Set((existing ?? []).map((p) => p.position));
  const position = [0, 1, 2].find((p) => !taken.has(p));
  if (position === undefined) return { error: "This room already has 3 photos." };

  const { error } = await supabase
    .from("room_photos")
    .insert({ room_type_id: roomId, storage_path: storagePath, position });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/rooms/${roomId}`);
  return {};
}

export async function deletePhoto(photoId: string, roomId: string): Promise<PhotoResult> {
  const ctx = await assertRoomOwner(roomId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { data: photo } = await supabase
    .from("room_photos").select("storage_path").eq("id", photoId).eq("room_type_id", roomId).maybeSingle();
  if (!photo) return { error: "Photo not found." };

  const { error } = await supabase.from("room_photos").delete().eq("id", photoId);
  if (error) return { error: error.message };

  // remove the bytes too — a failure here only leaves an orphan, so don't block on it
  await supabase.storage.from("room-photos").remove([photo.storage_path]);

  revalidatePath(`/dashboard/rooms/${roomId}`);
  return {};
}

/** Swaps two photos' positions so the lister can reorder. */
export async function movePhoto(photoId: string, roomId: string, direction: -1 | 1): Promise<PhotoResult> {
  const ctx = await assertRoomOwner(roomId);
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const { data: photos } = await supabase
    .from("room_photos").select("id, position").eq("room_type_id", roomId).order("position");
  if (!photos) return { error: "Couldn't load photos." };

  const index = photos.findIndex((p) => p.id === photoId);
  const target = photos[index + direction];
  if (index === -1 || !target) return {};

  const current = photos[index];

  // unique(room_type_id, position) blocks a direct swap, so park one at 99 first
  await supabase.from("room_photos").update({ position: 99 }).eq("id", current.id);
  await supabase.from("room_photos").update({ position: current.position }).eq("id", target.id);
  await supabase.from("room_photos").update({ position: target.position }).eq("id", current.id);

  revalidatePath(`/dashboard/rooms/${roomId}`);
  return {};
}