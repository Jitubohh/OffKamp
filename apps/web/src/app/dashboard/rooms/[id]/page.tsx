import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomForm } from "@/components/dashboard/room-form";
import { PhotoManager } from "@/components/dashboard/photo-manager";
import { BackLink } from "@/components/ui/back-link";
import { deleteRoom } from "@/app/dashboard/rooms/actions";
import type { AmenityValue } from "@/components/dashboard/amenity-row";
import type { Amenity } from "@/lib/pricing";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("id, property_schools(schools(has_tri_semester))")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!property) redirect("/dashboard/property");

  const { data: room } = await supabase
    .from("room_types")
    .select("*, room_type_amenities(*), room_photos(id, storage_path, position)")
    .eq("id", id)
    .eq("property_id", property.id)
    .maybeSingle();
  if (!room) redirect("/dashboard");

  const amenities = Object.fromEntries(
    room.room_type_amenities.map((a) => [
      a.amenity,
      {
        mode: a.mode,
        extra_semester: a.extra_semester,
        extra_session: a.extra_session,
        extra_tri_semester: a.extra_tri_semester,
      },
    ])
  ) as Record<Amenity, AmenityValue>;

  const showTri = property.property_schools.some((ps) => ps.schools?.has_tri_semester);
  const photos = [...room.room_photos].sort((a, b) => a.position - b.position);
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:px-8">
      <BackLink href="/dashboard" label="Dashboard" />

      <h1 className="mt-4 text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
        {room.capacity === 1 ? "Single room" : `Room of ${room.capacity}`}
      </h1>
      {room.label && <p className="mt-2 text-[15px] text-muted">{room.label}</p>}

      <div className="mt-8">
        <PhotoManager
          roomId={room.id}
          userId={user.id}
          photos={photos}
          publicBase={publicBase}
        />
      </div>

      <div className="mt-8">
        <RoomForm room={room} amenities={amenities} showTri={showTri} />
      </div>

      <form action={deleteRoom} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="room_id" value={room.id} />
        <button className="text-sm font-semibold text-red-600 transition hover:text-red-700">
          Delete this room
        </button>
      </form>
    </main>
  );
}