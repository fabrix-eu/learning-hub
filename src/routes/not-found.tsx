import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-24 text-center">
      <h1 className="text-title sm:text-display">We couldn't find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-lead text-ink2">
        The topic may have been renamed, or the link may be incomplete.
      </p>
      <Link
        to="/"
        className="mt-7 inline-block rounded-fx-action bg-violet px-5 py-2.5 text-body font-bold text-white transition hover:brightness-110"
      >
        Browse all topics
      </Link>
    </main>
  );
}
