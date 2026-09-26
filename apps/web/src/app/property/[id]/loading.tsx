export default function Loading() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="h-[73px] border-b border-line" />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        <div className="aspect-[16/10] w-full animate-pulse rounded-card bg-surface sm:aspect-[21/9]" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="h-9 w-2/3 animate-pulse rounded-lg bg-surface" />
            <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-surface" />
            <div className="mt-6 space-y-3">
              <div className="h-24 w-full animate-pulse rounded-card bg-surface" />
              <div className="h-24 w-full animate-pulse rounded-card bg-surface" />
            </div>
          </div>
          <div className="h-56 w-full animate-pulse rounded-card bg-surface" />
        </div>
      </main>
    </div>
  );
}