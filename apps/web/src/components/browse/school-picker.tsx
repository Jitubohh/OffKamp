"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, GraduationCap } from "lucide-react";
import { easePremium } from "@/lib/motion";

type School = { slug: string; name: string };

function shortName(name: string): string {
  if (/African University of Science/i.test(name)) return "AUST";
  return name.replace(/\s+University.*$/i, "");
}

export function SchoolPicker({
  schools, current, baseQuery,
}: {
  schools: School[];
  current: string;
  baseQuery: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const hrefFor = (slug: string) => {
    const p = new URLSearchParams(baseQuery);
    if (slug === "nile") p.delete("school");
    else p.set("school", slug);
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  };

  if (schools.length === 0) return null;

  if (schools.length <= 3) {
    return (
      <div
        className="inline-grid gap-1 rounded-2xl bg-surface p-1"
        style={{ gridTemplateColumns: `repeat(${schools.length}, minmax(0, 1fr))` }}
      >
        {schools.map((s) => (
          <Link
            key={s.slug}
            href={hrefFor(s.slug)}
            scroll={false}
            className={`rounded-xl px-5 py-2 text-center text-sm font-semibold transition ${
              current === s.slug ? "bg-white text-brand-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {shortName(s.name)}
          </Link>
        ))}
      </div>
    );
  }

  const active = schools.find((s) => s.slug === current) ?? schools[0];

  return (
    <div ref={box} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-brand-deep hover:bg-brand/10"
      >
        <GraduationCap size={16} className="text-brand-ink" />
        {shortName(active.name)}
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: easePremium }}
            className="absolute left-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
          >
            <ul className="max-h-72 overflow-y-auto">
              {schools.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={hrefFor(s.slug)}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[15px] transition ${
                      current === s.slug
                        ? "bg-brand/30 font-semibold text-brand-ink"
                        : "text-ink hover:bg-surface"
                    }`}
                  >
                    {s.name}
                    {current === s.slug ? <Check size={16} className="shrink-0" /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}