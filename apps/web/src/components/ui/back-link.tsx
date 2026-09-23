import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
    >
      <ChevronLeft size={18} />
      {label}
    </Link>
  );
}