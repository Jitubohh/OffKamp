import Link from "next/link";
import { Heart } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/app/(auth)/actions";

export function SiteHeader({
  role, signedIn, children,
}: {
  role: "student" | "lister" | null;
  signedIn: boolean;
  children?: React.ReactNode;
}) {
  const link =
    "inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="shrink-0"><Logo /></Link>

        {/* school picker or anything else the page wants inline */}
        <div className="min-w-0 flex-1 sm:flex-none">{children}</div>

        <nav className="hidden shrink-0 items-center gap-1 sm:flex">
          {signedIn ? (
            <>
              <Link href="/saved" className={link}>
                <Heart size={16} />
                Saved
              </Link>

              {role === "lister" ? (
                <Link href="/dashboard" className={link}>Dashboard</Link>
              ) : null}

              <form action={logout}>
                <button className={link}>Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>Log in</Link>
              <Link
                href="/signup"
                className="inline-flex h-10 shrink-0 items-center rounded-xl bg-brand-ink px-4 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}