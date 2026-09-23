export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="var(--color-brand)" />
        <path
          d="M16 8l7 5.5V23a1 1 0 0 1-1 1h-4v-5h-4v5h-4a1 1 0 0 1-1-1v-9.5L16 8z"
          fill="var(--color-brand-ink)"
        />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-ink">
        off<span className="text-brand-ink">Kamp</span>
      </span>
    </span>
  );
}