import type { Facility } from "@/lib/facilities";
import type { Database } from "@/lib/database.types";

type Gender = Database["public"]["Enums"]["gender_pref"];

export type Filters = {
  school: string;            // slug
  minPrice: number | null;
  maxPrice: number | null;
  capacities: number[];
  maxDistance: number | null;
  gender: Gender | null;
  facilities: Facility[];
  availableOnly: boolean;
  sort: "distance" | "price_asc" | "price_desc";
};

/** URLSearchParams -> typed filters. Anything unparseable falls back to a default. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const many = (k: string) => {
    const v = sp[k];
    if (!v) return [];
    return (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
  };
  const num = (k: string) => {
    const n = Number(one(k));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const sort = one("sort");
  const gender = one("gender");

  return {
    school: one("school") === "baze" ? "baze" : "nile",
    minPrice: num("min"),
    maxPrice: num("max"),
    capacities: many("cap").map(Number).filter((n) => n >= 1 && n <= 6),
    maxDistance: num("dist"),
    gender: gender === "male" || gender === "female" || gender === "mixed" ? gender : null,
    facilities: many("fac") as Facility[],
    availableOnly: one("avail") !== "0",
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "distance",
  };
}

/** Filters -> a query string, omitting defaults so URLs stay short. */
export function buildQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.school !== "nile") p.set("school", f.school);
  if (f.minPrice) p.set("min", String(f.minPrice));
  if (f.maxPrice) p.set("max", String(f.maxPrice));
  if (f.capacities.length) p.set("cap", f.capacities.join(","));
  if (f.maxDistance) p.set("dist", String(f.maxDistance));
  if (f.gender) p.set("gender", f.gender);
  if (f.facilities.length) p.set("fac", f.facilities.join(","));
  if (!f.availableOnly) p.set("avail", "0");
  if (f.sort !== "distance") p.set("sort", f.sort);
  return p.toString();
}

export function activeCount(f: Filters): number {
  return [
    f.minPrice || f.maxPrice,
    f.capacities.length > 0,
    f.maxDistance,
    f.gender,
    f.facilities.length > 0,
    !f.availableOnly,
  ].filter(Boolean).length;
}