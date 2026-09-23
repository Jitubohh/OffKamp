"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, LocateFixed, CheckCircle2, AlertTriangle } from "lucide-react";
import { haversineKm, isPrecise, type LatLng } from "@/lib/geo";
import { easePremium } from "@/lib/motion";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-surface sm:h-80" />,
});

export type SchoolPin = { id: string; name: string; lat: number | null; lng: number | null };

export function LocationPicker({
  schools,
  initial,
  initialAccuracy,
}: {
  schools: SchoolPin[];
  initial: LatLng | null;
  initialAccuracy: number | null;
}) {
  const [position, setPosition] = useState<LatLng | null>(initial);
  const [accuracy, setAccuracy] = useState<number | null>(initialAccuracy);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // centre the map on the first school that has coordinates
  const fallback = schools.find((s) => s.lat !== null && s.lng !== null);
  const center: LatLng = position ?? {
    lat: fallback?.lat ?? 9.0579,
    lng: fallback?.lng ?? 7.4951, // Abuja
  };

  function pick(p: LatLng, acc: number | null) {
    setPosition(p);
    setAccuracy(acc);
    setGeoError(null);
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoError("Your browser can't share location. Tap the map instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          Math.round(pos.coords.accuracy)
        );
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Tap the map to drop a pin instead."
            : "Couldn't get your location. Tap the map to drop a pin instead."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  const precise = isPrecise(accuracy);

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-2 block text-sm font-semibold text-ink">Location</span>
        <p className="mb-3 text-xs text-muted">
          Best done standing at the property — tap <strong>Use my location</strong> for an exact pin.
          You can also tap the map, or come back and set this later.
        </p>
      </div>

      {/* these are what the server action actually reads */}
      <input type="hidden" name="lat" value={position?.lat ?? ""} />
      <input type="hidden" name="lng" value={position?.lng ?? ""} />
      <input type="hidden" name="location_accuracy_m" value={accuracy ?? ""} />

      <LocationMap position={position} center={center} onPick={pick} />

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-[15px] font-semibold text-ink transition hover:bg-brand/30 disabled:opacity-60"
      >
        <LocateFixed size={18} className={locating ? "animate-spin" : ""} />
        {locating ? "Finding you…" : "Use my location"}
      </button>

      <AnimatePresence mode="wait">
        {geoError && (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            {geoError}
          </motion.p>
        )}

        {position && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easePremium }}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <p className={`flex items-center gap-2 text-sm font-semibold ${precise ? "text-green-700" : "text-muted"}`}>
              {precise ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {precise
                ? `Precise location set (±${accuracy}m) — students get directions`
                : accuracy
                  ? `Location set, but only accurate to ±${accuracy}m`
                  : "Pin dropped manually"}
            </p>

            <ul className="mt-3 space-y-1.5">
              {schools.map((s) =>
                s.lat !== null && s.lng !== null ? (
                  <li key={s.id} className="flex items-center gap-2 text-sm text-ink">
                    <MapPin size={14} className="text-brand-ink" />
                    {haversineKm(position, { lat: s.lat, lng: s.lng }).toFixed(1)} km from {s.name}
                  </li>
                ) : null
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}