"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PriceInputs } from "@/components/ui/price-inputs";
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

  const periods = (showTri ? PERIODS : PERIODS.filter((p) => p.key !== "tri_semester")).map((p) => ({
    key: p.key,
    label: p.label,
  }));

  return (
    <div className="rounded-2xl border border-line p-4">
      <input type="hidden" name={`amenity_${amenity}_mode`} value={mode} />

      <div>
        <p className="text-[15px] font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
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
            {mode === m.value ? (
              <motion.span
                layoutId={`amenity-pill-${amenity}`}
                className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {mode === "optional" ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easePremium }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <PriceInputs
                prefix={`amenity_${amenity}`}
                periods={periods}
                initial={{
                  semester: initial?.extra_semester ?? null,
                  session: initial?.extra_session ?? null,
                  tri_semester: initial?.extra_tri_semester ?? null,
                }}
                compact
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}