"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { easePremium } from "@/lib/motion";

export function BookmarkButton({
  propertyId, saved, size = "sm",
}: {
  propertyId: string;
  saved: boolean;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [toast, setToast] = useState(false);

  const px = size === "lg" ? 24 : 19;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await toggleBookmark(propertyId, !optimistic);

      if (res.needsAuth) {
        setToast(true);
        setTimeout(() => router.push("/login"), 900);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-pressed={optimistic}
        aria-label={optimistic ? "Remove from saved" : "Save this place"}
        className={`rounded-full backdrop-blur transition ${
          size === "lg"
            ? "border border-line bg-white p-3 hover:bg-surface"
            : "bg-white/80 p-2 hover:bg-white"
        }`}
      >
        <motion.span
          key={String(optimistic)}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="block"
        >
          <Heart
            size={px}
            className={optimistic ? "fill-red-500 text-red-500" : "text-ink"}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {toast ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easePremium }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:bottom-8"
          >
            Log in to save places
          </motion.p>
        ) : null}
      </AnimatePresence>
    </>
  );
}