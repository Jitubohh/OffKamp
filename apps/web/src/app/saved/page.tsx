import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/browse/listing-card";
import { fetchListings } from "@/lib/listings";
import { parseFilters } from "@/lib/search-params";
import { SiteHeader } from "@/components/nav/site-header";
import { BottomTabs } from "@/components/nav/bottom-tabs";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: bookmarks }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase
      .from("bookmarks")
      .select("property_id")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const savedIds = new Set((bookmarks ?? []).map((b) => b.property_id));
  const { school, listings } = await fetchListings(parseFilters({}));
  const saved = listings.filter((l) => savedIds.has(l.id));

  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;
  const role = profile?.role ?? null;

  return (
    <div className="min-h-dvh bg-white pb-20 sm:pb-0">
      <SiteHeader role={role} signedIn />

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2rem]">
          Saved places
        </h1>

        {saved.length === 0 ? (
          <div className="mt-10 rounded-card border border-dashed border-line bg-surface p-12 text-center">
            <Heart size={28} className="mx-auto text-muted" />
            <p className="mt-3 font-semibold text-ink">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted">Tap the heart on a place to keep it here.</p>
            <Link
              href="/"
              className="mt-5 inline-flex h-11 items-center rounded-2xl bg-brand-ink px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Start browsing
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((l) => (
              <li key={l.id}>
                <ListingCard
                  listing={l}
                  publicBase={publicBase}
                  schoolName={school?.name ?? ""}
                  saved
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomTabs role={role} signedIn />
    </div>
  );
}