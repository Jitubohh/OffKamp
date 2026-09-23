"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AMENITY_MODES, PERIODS, type Amenity, type AmenityMode } from "@/lib/pricing";
import { easePremium } from "@/lib/motion";

export type AmenityValue = {
  mode: AmenityMode;
  extra_semester: number | null;
  extra_session: number | null;
  extra_tri_semester: number | null;
};

export function AmenityRow({
  amenity, label, hint, initial, showTri,
}: {
  amenity: Amenity;
  label: string;
  hint: string;
  initial: AmenityValue | null;
  showTri: boolean;
}) {
  const [mode, setMode] = useState<AmenityMode>(initial?.mode ?? "not_offered");

  const periods = showTri ? PERIODS : PERIODS.filter((p) => p.key !== "tri_semester");

  return (
    <div className="rounded-2xl border border-line p-4">
      <input type="hidden" name={`amenity_${amenity}_mode`} value={mode} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-ink">{label}</p>
          <p className="text-xs text-muted">{hint}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-surface p-1">
        {AMENITY_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`relative z-0 rounded-lg py-2 text-xs font-semibold transition-colors ${
              mode === m.value ? "text-brand-ink" : "text-muted"
            }`}
          >
            {mode === m.value && (
              <motion.span
                layoutId={`amenity-pill-${amenity}`}
                className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {mode === "optional" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easePremium }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {periods.map((p) => (
                <label key={p.key} className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{p.label}</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name={`amenity_${amenity}_${p.key}`}
                      defaultValue={initial?.[`extra_${p.key}` as keyof AmenityValue] ?? ""}
                      placeholder="0"
                      className="h-12 w-full rounded-xl border border-line bg-surface pl-7 pr-3 text-[15px] text-ink outline-none transition focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50"
                    />
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}