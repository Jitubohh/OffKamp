import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { parseFilters, buildQuery } from "@/lib/search-params";
import { fetchListings } from "@/lib/listings";
import { ListingCard } from "@/components/browse/listing-card";
import { FilterSheet } from "@/components/browse/filter-sheet";
import { Logo } from "@/components/brand/logo";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { school, listings } = await fetchListings(filters);
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;

  const schoolHref = (slug: string) =>
    `/?${buildQuery({ ...filters, school: slug })}`;

  const sortHref = (sort: typeof filters.sort) =>
    `/?${buildQuery({ ...filters, sort })}`;

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/"><Logo /></Link>

          <nav className="flex items-center gap-3">
            {profile?.role === "lister" ? (
              <Link href="/dashboard" className="text-sm font-semibold text-ink transition hover:text-brand-ink">
                Dashboard
              </Link>
            ) : user ? null : (
              <>
                <Link href="/login" className="hidden text-sm font-semibold text-muted transition hover:text-ink sm:block">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center rounded-xl bg-brand-ink px-4 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* school toggle */}
        <div className="mx-auto max-w-6xl px-5 pb-4 sm:px-8">
          <div className="inline-grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
            {[
              { slug: "nile", label: "Nile" },
              { slug: "baze", label: "Baze" },
            ].map((s) => (
              <Link
                key={s.slug}
                href={schoolHref(s.slug)}
                scroll={false}
                className={`rounded-xl px-6 py-2 text-center text-sm font-semibold transition ${
                  filters.school === s.slug
                    ? "bg-white text-brand-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
          Off-campus places near {school?.name.split(" ")[0] ?? "campus"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {listings.length} {listings.length === 1 ? "place" : "places"} to look at.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <FilterSheet filters={filters} resultCount={listings.length} />

          <div className="flex gap-1 rounded-2xl bg-surface p-1">
            {([
              ["distance", "Closest"],
              ["price_asc", "Cheapest"],
              ["price_desc", "Priciest"],
            ] as const).map(([value, label]) => (
              <Link
                key={value}
                href={sortHref(value)}
                scroll={false}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  filters.sort === value ? "bg-white text-brand-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="mt-12 rounded-card border border-dashed border-line bg-surface p-12 text-center">
            <p className="font-semibold text-ink">Nothing matches those filters.</p>
            <p className="mt-1 text-sm text-muted">Try widening your price range or distance.</p>
            <Link
              href="/"
              className="mt-5 inline-flex h-11 items-center rounded-2xl bg-brand-ink px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} publicBase={publicBase} schoolName={school!.name} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}