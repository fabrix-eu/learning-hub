import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-24 text-center">
      <h1 className="text-[28px] tracking-[-0.02em]">We couldn't find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink2">
        The topic may have been renamed, or the link may be incomplete.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-fx-sm bg-violet px-4 py-2.5 text-[13px] font-medium text-white"
      >
        Browse all topics
      </Link>
    </main>
  );
}
