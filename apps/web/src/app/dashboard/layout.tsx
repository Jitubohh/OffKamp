import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/app/(auth)/actions";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/85 px-5 py-4 backdrop-blur sm:px-8">
        <Link href="/dashboard"><Logo /></Link>
        <form action={logout}>
          <button className="text-sm font-semibold text-muted transition hover:text-ink">
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}