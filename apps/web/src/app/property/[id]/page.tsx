import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/property/gallery";
import { RoomCard, type RoomForDisplay } from "@/components/property/room-card";
import { ContactPanel } from "@/components/property/contact-panel";
import { FACILITIES } from "@/lib/facilities";
import { PERIODS, type PeriodKey } from "@/lib/pricing";
import { directionsUrl, isPrecise } from "@/lib/geo";
import type { Metadata } from "next";

const GENDER_LABEL = { male: "Male only", female: "Female only", mixed: "Mixed" } as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("name, location").eq("id", id).maybeSingle();

  if (!data) return { title: "Property — OffKamp" };
  return {
    title: `${data.name}, ${data.location} — OffKamp`,
    description: `Off-campus accommodation in ${data.location}, Abuja. See rooms, prices and contact the lister on OffKamp.`,
  };
}

export default async function PropertyPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select(`
      *,
      property_schools ( distance_km, schools ( name, slug, has_tri_semester ) ),
      property_facilities ( facility ),
      room_types ( *, room_type_amenities (*), room_photos ( storage_path, position ) )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!property) notFound();

  const showTri = property.property_schools.some((ps) => ps.schools?.has_tri_semester);
  const periods = showTri ? PERIODS : PERIODS.filter((p) => p.key !== "tri_semester");

  const rawPeriod = Array.isArray(sp.period) ? sp.period[0] : sp.period;
  const period: PeriodKey =
    periods.some((p) => p.key === rawPeriod) ? (rawPeriod as PeriodKey) : "semester";

  const photos = property.room_types
    .flatMap((r) => r.room_photos.slice().sort((a, b) => a.position - b.position))
    .map((p) => p.storage_path);

  const rooms: RoomForDisplay[] = property.room_types
    .map((r) => ({
      id: r.id,
      capacity: r.capacity,
      label: r.label,
      availability: r.availability,
      price_semester: r.price_semester,
      price_session: r.price_session,
      price_tri_semester: r.price_tri_semester,
      amenities: r.room_type_amenities,
    }))
    .sort((a, b) => a.capacity - b.capacity);

  const facilities = FACILITIES.filter((f) =>
    property.property_facilities.some((pf) => pf.facility === f.value)
  );

  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;
  const directionsHref =
    isPrecise(property.location_accuracy_m) && property.lat !== null && property.lng !== null
      ? directionsUrl({ lat: property.lat, lng: property.lng })
      : null;

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
          >
            <ArrowLeft size={18} /> All places
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        <Gallery photos={photos} publicBase={publicBase} name={property.name} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
              {property.name}
            </h1>

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
              <MapPin size={15} />
              {property.address ?? property.location}
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink">
                {GENDER_LABEL[property.gender_pref]}
              </span>
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {property.property_schools.map((ps, i) => (
                <li
                  key={i}
                  className="rounded-full bg-brand/40 px-3 py-1.5 text-sm font-semibold text-brand-ink"
                >
                  {ps.distance_km !== null
                    ? `${ps.distance_km} km from ${ps.schools?.name.split(" ")[0]}`
                    : `Serves ${ps.schools?.name.split(" ")[0]}`}
                </li>
              ))}
            </ul>

            {property.distance_note && (
              <p className="mt-3 text-[15px] italic text-muted">&ldquo;{property.distance_note}&rdquo;</p>
            )}

            {property.description && (
              <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                {property.description}
              </p>
            )}

            {facilities.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-bold text-ink">What this place has</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {facilities.map(({ value, label, icon: Icon }) => (
                    <li key={value} className="flex items-center gap-2.5 text-[15px] text-ink">
                      <Icon size={18} className="shrink-0 text-brand-ink" />
                      {label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-ink">Rooms &amp; prices</h2>

                <div className="flex gap-1 rounded-2xl bg-surface p-1">
                  {periods.map((p) => (
                    <Link
                      key={p.key}
                      href={`/property/${id}?period=${p.key}`}
                      scroll={false}
                      className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                        period === p.key ? "bg-white text-brand-ink shadow-sm" : "text-muted hover:text-ink"
                      }`}
                    >
                      {p.label.replace("Per ", "")}
                    </Link>
                  ))}
                </div>
              </div>

              {rooms.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
                  This lister hasn't added rooms yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {rooms.map((r) => (
                    <RoomCard key={r.id} room={r} period={period} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ContactPanel
              name={property.name}
              whatsapp={property.contact_whatsapp}
              phone={property.contact_phone}
              directionsHref={directionsHref}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}