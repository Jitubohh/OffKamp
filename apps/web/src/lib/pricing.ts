import type { Database } from "@/lib/database.types";

export type Amenity = Database["public"]["Enums"]["amenity_kind"];
export type AmenityMode = Database["public"]["Enums"]["amenity_mode"];
export type PricedAmenity = {
  amenity: Amenity;
  mode: AmenityMode;
  extra_semester: number | null;
  extra_session: number | null;
  extra_tri_semester: number | null;
};

/** The extra cost of one amenity for a given period, or null if it isn't priced for it. */
export function extraFor(a: PricedAmenity, period: PeriodKey): number | null {
  if (a.mode !== "optional") return null;
  return a[`extra_${period}`];
}

/** Base price plus whichever optional amenities the student switched on. */
export function totalFor(
  base: number,
  amenities: PricedAmenity[],
  selected: Amenity[],
  period: PeriodKey
): number {
  return amenities.reduce((sum, a) => {
    if (!selected.includes(a.amenity)) return sum;
    return sum + (extraFor(a, period) ?? 0);
  }, base);
}

export function priceFor(
  room: { price_semester: number | null; price_session: number | null; price_tri_semester: number | null },
  period: PeriodKey
): number | null {
  return room[`price_${period}`];
}

export const PERIODS = [
  { key: "semester",     label: "Per semester",     column: "price_semester" },
  { key: "session",      label: "Per session",      column: "price_session" },
  { key: "tri_semester", label: "Per tri-semester", column: "price_tri_semester" },
] as const;

export type PeriodKey = (typeof PERIODS)[number]["key"];

export const AMENITIES: { value: Amenity; label: string; hint: string }[] = [
  { value: "feeding",   label: "Feeding",   hint: "Meals provided" },
  { value: "laundry",   label: "Laundry",   hint: "Clothes washed" },
  { value: "transport", label: "Transport", hint: "Shuttle to campus" },
];

export const AMENITY_MODES: { value: AmenityMode; label: string }[] = [
  { value: "not_offered", label: "Not offered" },
  { value: "included",    label: "Included" },
  { value: "optional",    label: "Extra cost" },
];

/** 185000 -> "₦185,000" */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}