import { createClient } from "@/lib/supabase/server";
import type { Filters } from "@/lib/search-params";

export async function fetchListings(filters: Filters) {
  const supabase = await createClient();

    const { data: school } = await supabase
    .from("schools").select("id, name, has_tri_semester")
    .eq("slug", filters.school).eq("active", true).single();

  if (!school) return { school: null, listings: [] };

  let query = supabase
    .from("property_schools")
    .select(`
      distance_km,
      properties!inner (
        id, name, location, distance_note, gender_pref, lat, lng, location_accuracy_m,
        property_facilities ( facility ),
        room_types!inner ( id, capacity, availability, price_semester, price_session, price_tri_semester,
                           room_photos ( storage_path, position ) )
      )
    `)
    .eq("school_id", school.id);

  if (filters.gender) query = query.eq("properties.gender_pref", filters.gender);
  if (filters.maxDistance) query = query.lte("distance_km", filters.maxDistance);
  if (filters.capacities.length) query = query.in("properties.room_types.capacity", filters.capacities);
  if (filters.availableOnly) query = query.eq("properties.room_types.availability", "available");

  const { data, error } = await query;
  if (error || !data) return { school, listings: [] };

  // price and facility filtering happen here: they're per-room aggregates
  // and per-property sets that PostgREST can't express in one pass
  const listings = data
    .map((row) => {
      const p = row.properties;
      const prices = p.room_types
        .map((r) => r.price_semester ?? r.price_session ?? r.price_tri_semester)
        .filter((n): n is number => n !== null);

      const fromPrice = prices.length ? Math.min(...prices) : null;
      const facilities = p.property_facilities.map((f) => f.facility);

      // first room type that actually has photos becomes the card's gallery
      const coverRoom = p.room_types.find((r) => r.room_photos.length > 0);
      const photos = (coverRoom?.room_photos ?? [])
       .slice()
       .sort((a, b) => a.position - b.position)
       .map((ph) => ph.storage_path);

      return {
        id: p.id,
        name: p.name,
        location: p.location,
        distanceNote: p.distance_note,
        distanceKm: row.distance_km,
        gender: p.gender_pref,
        hasDirections: p.location_accuracy_m !== null && p.location_accuracy_m <= 50,
        roomCount: p.room_types.length,
        fromPrice,
        facilities,
        photos,
      };
    })
    .filter((l) => {
      if (l.fromPrice === null) return false;
      if (filters.minPrice && l.fromPrice < filters.minPrice) return false;
      if (filters.maxPrice && l.fromPrice > filters.maxPrice) return false;
      if (filters.facilities.length &&
          !filters.facilities.every((f) => l.facilities.includes(f))) return false;
      return true;
    });

  listings.sort((a, b) => {
    if (filters.sort === "price_asc") return (a.fromPrice ?? 0) - (b.fromPrice ?? 0);
    if (filters.sort === "price_desc") return (b.fromPrice ?? 0) - (a.fromPrice ?? 0);
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });

  return { school, listings };
}

export type Listing = Awaited<ReturnType<typeof fetchListings>>["listings"][number];