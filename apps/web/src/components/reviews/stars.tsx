import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n - 0.25;
        return (
          <Star
            key={n}
            size={size}
            className={filled ? "fill-amber-400 text-amber-400" : "fill-line text-line"}
            aria-hidden
          />
        );
      })}
    </span>
  );
}