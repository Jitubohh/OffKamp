"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LayoutGrid, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

export function DashboardTabs() {
  const pathname = usePathname();
  const onDashboard = pathname.startsWith("/dashboard");

  const base = "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <Link href="/" className={`${base} ${onDashboard ? "text-muted" : "text-brand-ink"}`}>
        <Search size={20} />
        Browse
      </Link>

      <Link href="/dashboard" className={`${base} ${onDashboard ? "text-brand-ink" : "text-muted"}`}>
        <LayoutGrid size={20} />
        Dashboard
      </Link>

      <form action={logout} className="flex flex-1">
        <button className={`${base} w-full text-muted`}>
          <LogOut size={20} />
          Log out
        </button>
      </form>
    </nav>
  );
}