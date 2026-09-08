export function Pending() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12" aria-busy="true" aria-live="polite">
      <div className="h-8 w-2/3 max-w-md animate-pulse rounded-fx-sm bg-line" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-line" />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-fx border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
