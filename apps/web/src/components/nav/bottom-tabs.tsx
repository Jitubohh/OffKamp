"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, LayoutGrid, LogIn } from "lucide-react";

type Role = "student" | "lister" | null;

export function BottomTabs({ role, signedIn }: { role: Role; signedIn: boolean }) {
  const pathname = usePathname();

  const base =
    "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition";
  const on = "text-brand-ink";
  const off = "text-muted";

  const isBrowse = pathname === "/" || pathname.startsWith("/property");
  const isSaved = pathname.startsWith("/saved");
  const isDash = pathname.startsWith("/dashboard");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <Link href="/" className={`${base} ${isBrowse ? on : off}`}>
        <Search size={20} />
        Browse
      </Link>

      {signedIn ? (
        <Link href="/saved" className={`${base} ${isSaved ? on : off}`}>
          <Heart size={20} />
          Saved
        </Link>
      ) : null}

      {role === "lister" ? (
        <Link href="/dashboard" className={`${base} ${isDash ? on : off}`}>
          <LayoutGrid size={20} />
          Dashboard
        </Link>
      ) : null}

      {!signedIn ? (
        <Link href="/login" className={`${base} ${off}`}>
          <LogIn size={20} />
          Log in
        </Link>
      ) : null}
    </nav>
  );
}