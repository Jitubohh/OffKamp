import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/dashboard/property-form";

export default async function PropertyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "lister") redirect("/");

  const [{ data: schools }, { data: property }] = await Promise.all([
    supabase.from("schools").select("id, name, lat, lng").order("name"),
    supabase
      .from("properties")
      .select("*, property_schools(school_id), property_facilities(facility)")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);

  const selectedSchoolIds = property?.property_schools.map((ps) => ps.school_id) ?? [];
  const selectedFacilities = property?.property_facilities.map((pf) => pf.facility) ?? [];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 pb-24 pt-10 sm:px-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
        {property ? "Edit your property" : "List your property"}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Students see this first. You'll add rooms and prices next.
      </p>
      <div className="mt-8">
        <PropertyForm
          schools={schools ?? []}
          property={property}
          selectedSchoolIds={selectedSchoolIds}
          selectedFacilities={selectedFacilities}
        />
      </div>
    </main>
  );
}