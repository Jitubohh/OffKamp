import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomForm } from "@/components/dashboard/room-form";
import { BackLink } from "@/components/ui/back-link";

export default async function NewRoomPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("id, property_schools(schools(has_tri_semester))")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) redirect("/dashboard/property");

  const showTri = property.property_schools.some((ps) => ps.schools?.has_tri_semester);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:px-8">
      <BackLink href="/dashboard" label="Dashboard" />

      <h1 className="mt-4 text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
        Add a room
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Each room size is priced separately. You&rsquo;ll add photos after saving.
      </p>

      <div className="mt-8">
        <RoomForm room={null} amenities={{}} showTri={showTri} />
      </div>
    </main>
  );
}