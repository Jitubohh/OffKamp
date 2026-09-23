import type { Database } from "@/lib/database.types";

export type Amenity = Database["public"]["Enums"]["amenity_kind"];
export type AmenityMode = Database["public"]["Enums"]["amenity_mode"];

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