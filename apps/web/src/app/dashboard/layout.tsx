import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/app/(auth)/actions";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-dvh bg-white pb-20 sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/"><Logo /></Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
            >
              Browse
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
            >
              Dashboard
            </Link>
            <form action={logout}>
              <button className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {children}

      <DashboardTabs />
    </div>
  );
}