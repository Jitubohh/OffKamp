import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-brand-deep/50 blur-3xl"
        />

        <Link href="/" className="relative z-10"><Logo /></Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-ink">
            Off-campus housing,<br />without the group chat.
          </h2>
          <p className="mt-4 text-brand-ink/70">
            Browse hostels near your campus. Filter by price, room size, and distance
            from your gate.
          </p>
        </div>

        <p className="relative z-10 text-sm text-brand-ink/60">Off-campus housing · Abuja</p>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 pb-10 pt-8 sm:px-8 lg:justify-center lg:px-16">
        <Link href="/" className="lg:hidden"><Logo /></Link>
        <div className="mx-auto w-full max-w-sm flex-1 lg:flex-none">{children}</div>
      </main>
    </div>
  );
}