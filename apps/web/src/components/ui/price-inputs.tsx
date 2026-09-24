"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { PeriodKey } from "@/lib/pricing";

type Period = { key: PeriodKey; label: string };

const digitsOnly = (s: string) => s.replace(/\D/g, "");
const withCommas = (s: string) => (s === "" ? "" : Number(s).toLocaleString("en-NG"));

export function PriceInputs({
  prefix, periods, initial, compact = false,
}: {
  prefix: string;                          // "price" or "amenity_feeding"
  periods: Period[];
  initial: Partial<Record<PeriodKey, number | null>>;
  compact?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => ({
    semester: initial.semester != null ? String(initial.semester) : "",
    session: initial.session != null ? String(initial.session) : "",
    tri_semester: initial.tri_semester != null ? String(initial.tri_semester) : "",
  }));

  // once the lister edits session by hand, stop overwriting it
  const [sessionManual, setSessionManual] = useState(initial.session != null);
  const [autofilled, setAutofilled] = useState(false);

  function update(key: PeriodKey, raw: string) {
    const clean = digitsOnly(raw);

    setValues((v) => {
      const next = { ...v, [key]: clean };

      if (key === "semester" && !sessionManual) {
        next.session = clean === "" ? "" : String(Number(clean) * 2);
        setAutofilled(clean !== "");
      }
      if (key === "session") {
        setSessionManual(true);
        setAutofilled(false);
      }
      return next;
    });
  }

  const h = compact ? "h-12" : "h-14";
  const pad = compact ? "pl-7 pr-3 text-[15px]" : "pl-9 pr-4 text-[16px]";
  const sign = compact ? "left-3 text-sm" : "left-4 text-[16px]";

  return (
    <div className={`grid gap-3 ${periods.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {periods.map((p) => (
        <label key={p.key} className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
            {p.label}
            {p.key === "session" && autofilled && !sessionManual ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/40 px-1.5 py-0.5 text-[10px] font-bold text-brand-ink">
                <Sparkles size={9} /> auto
              </span>
            ) : null}
          </span>

          <div className="relative">
            <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${sign}`}>
              &#8358;
            </span>
            <input
              type="text"
              inputMode="numeric"
              name={`${prefix}_${p.key}`}
              value={withCommas(values[p.key])}
              onChange={(e) => update(p.key, e.target.value)}
              placeholder="0"
              className={`${h} ${pad} w-full rounded-2xl border border-line bg-surface text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50`}
            />
          </div>
        </label>
      ))}
    </div>
  );
}