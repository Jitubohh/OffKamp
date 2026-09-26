"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <Loader2 size={13} className="animate-spin" /> : null;
}

export function PendingLink({
  href, className, children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} scroll={false} className={className}>
      <span className="inline-flex items-center gap-1.5">
        {children}
        <Pending />
      </span>
    </Link>
  );
}