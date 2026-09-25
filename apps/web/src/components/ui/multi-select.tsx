"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { easePremium } from "@/lib/motion";

export type Option = { value: string; label: string };

export function MultiSelect({
  name, label, hint, options, initial, placeholder = "Select...",
}: {
  name: string;
  label: string;
  hint?: string;
  options: Option[];
  initial: string[];
  placeholder?: string;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const chosen = options.filter((o) => selected.includes(o.value));

  function toggle(value: string) {
    setSelected((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]));
  }

  return (
    <div ref={box} className="relative">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {hint ? <p className="mb-2 text-xs text-muted">{hint}</p> : null}

      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-left transition focus:border-brand-deep focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/50"
      >
        <span className="flex flex-wrap gap-1.5">
          {chosen.length === 0 ? (
            <span className="text-[16px] text-muted/70">{placeholder}</span>
          ) : (
            chosen.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[13px] font-semibold text-brand-ink"
              >
                {o.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${o.label}`}
                  onClick={(e) => { e.stopPropagation(); toggle(o.value); }}
                  className="rounded-full p-0.5 transition hover:bg-brand-deep"
                >
                  <X size={11} />
                </span>
              </span>
            ))
          )}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: easePremium }}
            className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
          >
            {options.length > 6 ? (
              <div className="relative border-b border-line">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search schools"
                  className="h-12 w-full bg-transparent pl-10 pr-4 text-[15px] text-ink outline-none placeholder:text-muted/60"
                />
              </div>
            ) : null}

            <ul className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted">No match</li>
              ) : (
                filtered.map((o) => {
                  const on = selected.includes(o.value);
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        onClick={() => toggle(o.value)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[15px] transition ${
                          on ? "bg-brand/30 font-semibold text-brand-ink" : "text-ink hover:bg-surface"
                        }`}
                      >
                        {o.label}
                        {on ? <Check size={16} className="shrink-0" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}