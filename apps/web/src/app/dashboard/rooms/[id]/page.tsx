import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomForm } from "@/components/dashboard/room-form";
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
    .select("*, room_type_amenities(*)")
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

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 pb-24 pt-10 sm:px-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">Edit room</h1>
      <div className="mt-8">
        <RoomForm room={room} amenities={amenities} showTri={showTri} />
      </div>
    </main>
  );
}