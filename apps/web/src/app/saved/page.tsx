import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";
import { ListingCard } from "@/components/browse/listing-card";
import { fetchListings } from "@/lib/listings";
import { parseFilters } from "@/lib/search-params";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("property_id")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const savedIds = new Set((bookmarks ?? []).map((b) => b.property_id));

  // reuse the browse query, then keep only saved properties
  const { school, listings } = await fetchListings(parseFilters({}));
  const saved = listings.filter((l) => savedIds.has(l.id));

  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos`;

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-sm font-semibold text-muted transition hover:text-ink">
            Browse
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">Saved places</h1>

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
                <ListingCard listing={l} publicBase={publicBase} schoolName={school!.name} saved />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}