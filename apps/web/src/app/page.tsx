import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Pencil, AlertTriangle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/app/(auth)/actions";
import { isPrecise } from "@/lib/geo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, display_name").eq("id", user.id).single();
  if (profile?.role !== "lister") redirect("/");

  const { data: property } = await supabase
    .from("properties")
    .select("*, property_schools(distance_km, schools(name))")
    .eq("owner_id", user.id)
    .maybeSingle();

  const needsLocation = property !== null && property.lat === null;

  return (
    <div className="min-h-dvh bg-white">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <Link href="/"><Logo /></Link>
        <form action={logout}>
          <button className="text-sm font-semibold text-muted transition hover:text-ink">Log out</button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
          {profile.display_name ? `Hi, ${profile.display_name.split(" ")[0]}` : "Your dashboard"}
        </h1>

        {!property ? (
          <div className="mt-8 rounded-card border border-dashed border-line bg-surface p-8 text-center">
            <p className="text-[15px] text-muted">You haven't listed a property yet.</p>
            <Link
              href="/dashboard/property"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-ink px-6 text-[15px] font-semibold text-white transition hover:brightness-110"
            >
              <Plus size={18} /> List your property
            </Link>
          </div>
        ) : (
          <>
            {needsLocation && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Add your location to appear in distance searches
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Students filter by how far a place is from campus. Without a pin, yours stays hidden from those results.
                  </p>
                  <Link
                    href="/dashboard/property"
                    className="mt-3 inline-flex h-10 items-center rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Set location
                  </Link>
                </div>
              </div>
            )}

            <section className="mt-6 rounded-card border border-line p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-ink">{property.name}</h2>
                  <p className="mt-1 text-sm text-muted">{property.location}</p>
                </div>
                <Link
                  href="/dashboard/property"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-ink transition hover:bg-surface"
                >
                  <Pencil size={15} /> Edit
                </Link>
              </div>

              <ul className="mt-4 space-y-1.5">
                {property.property_schools.map((ps, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink">
                    <MapPin size={14} className="text-brand-ink" />
                    {ps.distance_km !== null
                      ? `${ps.distance_km} km from ${ps.schools?.name}`
                      : `Serves ${ps.schools?.name}`}
                  </li>
                ))}
              </ul>

              {property.distance_note && (
                <p className="mt-3 text-sm italic text-muted">"{property.distance_note}"</p>
              )}

              {isPrecise(property.location_accuracy_m) && (
                <p className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Precise location · directions enabled
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}