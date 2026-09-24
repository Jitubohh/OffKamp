import { Stars } from "./stars";

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string | null } | null;
};

function initials(name: string | null): string {
  if (!name) return "S";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
        No reviews yet. Be the first to tell other students what it is like.
      </p>
    );
  }

  return (
    <ul className="space-y-5">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-card border border-line p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">
              {initials(r.profiles?.display_name ?? null)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">
                {r.profiles?.display_name ?? "Student"}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Stars value={r.rating} size={13} />
                <time dateTime={r.created_at} className="text-xs text-muted">
                  {new Date(r.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
                </time>
              </div>
            </div>
          </div>

          {r.comment ? (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {r.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}