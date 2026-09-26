import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { parseFilters, buildQuery } from "@/lib/search-params";
import { fetchListings } from "@/lib/listings";
import { ListingCard } from "@/components/browse/listing-card";
import { FilterSheet } from "@/components/browse/filter-sheet";
import { SchoolPicker } from "@/components/browse/school-picker";
import { PendingLink } from "@/components/ui/pending-link";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/app/(auth)/actions";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: bookmarks }, { data: activeSchools }, listingResult] =
    await Promise.all([
      user
        ? supabase.from("profiles").select("role").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("bookmarks").select("property_id").eq("student_id", user.id)
        : Promise.resolve({ data: null }),
      supabase.from("schools").select("slug, name").eq("active", true).order("name"),
      fetchListings(filters),
    ]);

  const { school, listings } = listingResult;

  const savedIds = new Set(bookmarks?.map((b) => b.property_id) ?? []);
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;

  const sortHref = (sort: typeof filters.sort) => `/?${buildQuery({ ...filters, sort })}`;

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/"><Logo /></Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/saved"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                >
                  <Heart size={16} />
                  <span className="hidden sm:inline">Saved</span>
                </Link>

                {profile?.role === "lister" ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                  >
                    Dashboard
                  </Link>
                ) : null}

                <form action={logout}>
                  <button className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                >
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

        <div className="mx-auto max-w-6xl px-5 pb-4 sm:px-8">
          <SchoolPicker
            schools={activeSchools ?? []}
            current={filters.school}
            baseQuery={buildQuery(filters)}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        {!school ? (
          <div className="mt-12 rounded-card border border-dashed border-line bg-surface p-12 text-center">
            <p className="font-semibold text-ink">No listings for that school yet.</p>
            <p className="mt-1 text-sm text-muted">
              Once a lister nearby signs up, places will show here.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-11 items-center rounded-2xl bg-brand-ink px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Back to browse
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
              Off-campus places near {school.name.split(" ")[0]}
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
                  <PendingLink
                    key={value}
                    href={sortHref(value)}
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      filters.sort === value ? "bg-white text-brand-ink shadow-sm" : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </PendingLink>
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
                    <ListingCard
                      listing={l}
                      publicBase={publicBase}
                      schoolName={school.name}
                      saved={savedIds.has(l.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}