"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { saveReview, deleteReview, type ReviewState } from "@/app/actions/reviews";
import { SubmitButton } from "@/components/ui/button";
import { easePremium } from "@/lib/motion";

export function ReviewForm({
  propertyId, existing,
}: {
  propertyId: string;
  existing: { rating: number; comment: string | null } | null;
}) {
  const [state, formAction] = useActionState(saveReview, {} as ReviewState);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  const shown = hover || rating;
  const LABELS = ["", "Poor", "Not great", "Okay", "Good", "Excellent"];

  return (
    <div className="rounded-card border border-line p-5">
      <p className="font-bold text-ink">{existing ? "Your review" : "Leave a review"}</p>
      <p className="mt-1 text-sm text-muted">
        Other students rely on this. Be honest and specific.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="property_id" value={propertyId} />
        <input type="hidden" name="rating" value={rating} />

        <div className="flex items-center gap-3">
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="rounded-lg p-0.5 transition active:scale-90"
              >
                <Star
                  size={30}
                  className={
                    shown >= n ? "fill-amber-400 text-amber-400" : "fill-surface text-line"
                  }
                />
              </button>
            ))}
          </div>
          {shown > 0 ? (
            <span className="text-sm font-semibold text-muted">{LABELS[shown]}</span>
          ) : null}
        </div>

        <textarea
          name="comment"
          defaultValue={existing?.comment ?? ""}
          maxLength={1000}
          placeholder="What was the water and power situation? Was the lister easy to deal with?"
          className="min-h-28 w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-[16px] text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50"
        />

        <AnimatePresence>
          {state.error ? (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {state.error}
            </motion.p>
          ) : null}

          {state.ok ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: easePremium }}
              className="overflow-hidden rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
            >
              Thanks — your review is live.
            </motion.p>
          ) : null}
        </AnimatePresence>

        <SubmitButton pendingLabel="Posting...">
          {existing ? "Update review" : "Post review"}
        </SubmitButton>
      </form>

      {existing ? (
        <form action={deleteReview} className="mt-3 text-center">
          <input type="hidden" name="property_id" value={propertyId} />
          <button className="text-sm font-semibold text-muted underline underline-offset-4 transition hover:text-red-600">
            Delete my review
          </button>
        </form>
      ) : null}
    </div>
  );
}