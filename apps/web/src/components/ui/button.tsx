"use client";

import { motion } from "motion/react";
import { useFormStatus } from "react-dom";
import { easePremium } from "@/lib/motion";

export function SubmitButton({ children, pendingLabel = "Saving…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15, ease: easePremium }}
      className="h-14 w-full rounded-2xl bg-brand-ink text-[15px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(11,59,94,0.6)] transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </motion.button>
  );
}