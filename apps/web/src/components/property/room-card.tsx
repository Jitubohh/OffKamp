"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Plus, Users } from "lucide-react";
import {
  AMENITIES, formatNaira, priceFor, totalFor, extraFor,
  type Amenity, type PeriodKey, type PricedAmenity,
} from "@/lib/pricing";
import { easePremium } from "@/lib/motion";

export type RoomForDisplay = {
  id: string;
  capacity: number;
  label: string | null;
  availability: "available" | "full";
  price_semester: number | null;
  price_session: number | null;
  price_tri_semester: number | null;
  amenities: PricedAmenity[];
};

export function RoomCard({ room, period }: { room: RoomForDisplay; period: PeriodKey }) {
  const [selected, setSelected] = useState<Amenity[]>([]);

  const base = priceFor(room, period);
  const included = room.amenities.filter((a) => a.mode === "included");
  const optional = room.amenities.filter((a) => a.mode === "optional" && extraFor(a, period) !== null);
  const total = base === null ? null : totalFor(base, room.amenities, selected, period);

  const label = (a: Amenity) => AMENITIES.find((x) => x.value === a)?.label ?? a;

  function toggle(a: Amenity) {
    setSelected((s) => (s.includes(a) ? s.filter((v) => v !== a) : [...s, a]));
  }

  if (base === null) {
    return (
      <li className="rounded-card border border-line p-5 opacity-60">
        <p className="font-bold text-ink">
          {room.capacity === 1 ? "Single room" : `Room of ${room.capacity}`}
        </p>
        <p className="mt-1 text-sm text-muted">Not priced for this period.</p>
      </li>
    );
  }

  return (
    <li className={`rounded-card border p-5 transition ${
      room.availability === "full" ? "border-line bg-surface/60" : "border-line"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 font-bold text-ink">
            <Users size={16} className="text-brand-ink" />
            {room.capacity === 1 ? "Single room" : `Room of ${room.capacity}`}
          </p>
          {room.label && <p className="mt-0.5 text-sm text-muted">{room.label}</p>}
        </div>

        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          room.availability === "available" ? "bg-green-50 text-green-700" : "bg-line text-muted"
        }`}>
          {room.availability === "available" ? "Available" : "Full"}
        </span>
      </div>

      {included.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {included.map((a) => (
            <li
              key={a.amenity}
              className="inline-flex items-center gap-1 rounded-full bg-brand/40 px-2.5 py-1 text-xs font-semibold text-brand-ink"
            >
              <Check size={12} /> {label(a.amenity)} included
            </li>
          ))}
        </ul>
      )}

      {optional.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted">Add extras</p>
          <div className="flex flex-wrap gap-2">
            {optional.map((a) => {
              const on = selected.includes(a.amenity);
              const extra = extraFor(a, period)!;
              return (
                <button
                  key={a.amenity}
                  type="button"
                  onClick={() => toggle(a.amenity)}
                  aria-pressed={on}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    on
                      ? "border-brand-ink bg-brand-ink text-white"
                      : "border-line bg-white text-ink hover:border-brand-deep hover:bg-brand/10"
                  }`}
                >
                  {on ? <Check size={13} /> : <Plus size={13} />}
                  {label(a.amenity)}
                  <span className={on ? "text-white/80" : "text-muted"}>
                    +{formatNaira(extra)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">
          {selected.length > 0 ? "Total per bed space" : "Per bed space"}
        </span>
        <motion.span
          key={total}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: easePremium }}
          className="text-xl font-extrabold text-ink"
        >
          {formatNaira(total!)}
        </motion.span>
      </div>

      {selected.length > 0 && (
        <p className="mt-1 text-right text-xs text-muted">
          {formatNaira(base)} base + {formatNaira(total! - base)} extras
        </p>
      )}
    </li>
  );
}