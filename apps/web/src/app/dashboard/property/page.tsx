import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/dashboard/property-form";
import { BackLink } from "@/components/ui/back-link";

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
  const selectedFacilities = property?.property_facilities.map((f) => f.facility) ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:px-8">
      <BackLink href="/dashboard" label="Dashboard" />

      <h1 className="mt-4 text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
        {property ? "Edit your property" : "List your property"}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Students see this first. You&rsquo;ll add rooms and prices next.
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