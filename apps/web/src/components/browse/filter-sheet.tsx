"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { FACILITIES } from "@/lib/facilities";
import { buildQuery, activeCount, type Filters } from "@/lib/search-params";
import { formatNaira } from "@/lib/pricing";
import { easePremium } from "@/lib/motion";

const CAPACITIES = [1, 2, 3, 4, 5, 6];
const DISTANCES = [1, 2, 5, 10];
const GENDERS = [
  { value: "male", label: "Male only" },
  { value: "female", label: "Female only" },
  { value: "mixed", label: "Mixed" },
] as const;

export function FilterSheet({ filters, resultCount }: { filters: Filters; resultCount: number }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const count = activeCount(filters);

  function openSheet() {
    setDraft(filters);          // always start from what's actually applied
    setOpen(true);
  }

  function apply() {
    const qs = buildQuery(draft);
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  }

  function clearAll() {
    setDraft({ ...draft, minPrice: null, maxPrice: null, capacities: [], maxDistance: null,
               gender: null, facilities: [], availableOnly: true });
  }

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-brand-deep hover:bg-brand/10"
      >
        <SlidersHorizontal size={16} />
        Filters
        {count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-ink px-1.5 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: easePremium }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => { if (info.offset.y > 120) setOpen(false); }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white sm:inset-x-auto sm:right-0 sm:top-0 sm:h-dvh sm:max-h-none sm:w-[26rem] sm:rounded-none"
            >
              <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" />

              <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-lg font-bold text-ink">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="rounded-xl p-2 text-muted transition hover:bg-surface hover:text-ink"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
                <Group title="Price per bed space">
                  <div className="grid grid-cols-2 gap-3">
                    <PriceInput
                      label="Min"
                      value={draft.minPrice}
                      onChange={(v) => setDraft({ ...draft, minPrice: v })}
                    />
                    <PriceInput
                      label="Max"
                      value={draft.maxPrice}
                      onChange={(v) => setDraft({ ...draft, maxPrice: v })}
                    />
                  </div>
                </Group>

                <Group title="Room size">
                  <div className="flex flex-wrap gap-2">
                    {CAPACITIES.map((c) => (
                      <Chip
                        key={c}
                        active={draft.capacities.includes(c)}
                        onClick={() => setDraft({ ...draft, capacities: toggle(draft.capacities, c) })}
                      >
                        {c === 1 ? "Single" : `${c} people`}
                      </Chip>
                    ))}
                  </div>
                </Group>

                <Group title="Distance from campus">
                  <div className="flex flex-wrap gap-2">
                    {DISTANCES.map((d) => (
                      <Chip
                        key={d}
                        active={draft.maxDistance === d}
                        onClick={() => setDraft({ ...draft, maxDistance: draft.maxDistance === d ? null : d })}
                      >
                        Under {d} km
                      </Chip>
                    ))}
                  </div>
                </Group>

                <Group title="Who can stay">
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => (
                      <Chip
                        key={g.value}
                        active={draft.gender === g.value}
                        onClick={() => setDraft({ ...draft, gender: draft.gender === g.value ? null : g.value })}
                      >
                        {g.label}
                      </Chip>
                    ))}
                  </div>
                </Group>

                <Group title="Facilities">
                  <div className="flex flex-wrap gap-2">
                    {FACILITIES.map(({ value, label, icon: Icon }) => (
                      <Chip
                        key={value}
                        active={draft.facilities.includes(value)}
                        onClick={() => setDraft({ ...draft, facilities: toggle(draft.facilities, value) })}
                      >
                        <Icon size={13} /> {label}
                      </Chip>
                    ))}
                  </div>
                </Group>

                <Group title="Availability">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line p-4">
                    <span className="text-[15px] font-medium text-ink">Hide full rooms</span>
                    <input
                      type="checkbox"
                      checked={draft.availableOnly}
                      onChange={(e) => setDraft({ ...draft, availableOnly: e.target.checked })}
                      className="h-5 w-5 accent-[color:var(--color-brand-ink)]"
                    />
                  </label>
                </Group>
              </div>

              <footer className="flex shrink-0 items-center gap-3 border-t border-line px-5 py-4">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-semibold text-muted underline underline-offset-4 transition hover:text-ink"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="ml-auto h-12 flex-1 rounded-2xl bg-brand-ink text-[15px] font-semibold text-white transition hover:brightness-110"
                >
                  Show {resultCount} {resultCount === 1 ? "place" : "places"}
                </button>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "border-brand-ink bg-brand-ink text-white"
          : "border-line bg-white text-ink hover:border-brand-deep hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}

function PriceInput({
  label, value, onChange,
}: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
        <input
          type="text"
          inputMode="numeric"
          value={value ?? ""}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d]/g, ""));
            onChange(n > 0 ? n : null);
          }}
          placeholder="Any"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-7 pr-3 text-[15px] text-ink outline-none transition focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50"
        />
      </div>
    </label>
  );
}