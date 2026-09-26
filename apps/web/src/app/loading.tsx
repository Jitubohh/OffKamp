export default function Loading() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="h-[104px] border-b border-line" />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-surface" />
        <div className="mt-3 h-5 w-40 animate-pulse rounded-lg bg-surface" />
        <div className="mt-6 flex gap-3">
          <div className="h-11 w-28 animate-pulse rounded-2xl bg-surface" />
          <div className="h-11 w-64 animate-pulse rounded-2xl bg-surface" />
        </div>
        <ul className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i}>
              <div className="aspect-[4/3] w-full animate-pulse rounded-card bg-surface" />
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-surface" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-surface" />
              <div className="mt-3 h-6 w-1/3 animate-pulse rounded bg-surface" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}