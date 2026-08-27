import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { PLATFORM_URL } from '../lib/directus';

const NAV = [
  { to: '/', label: 'Topics' },
  { to: '/tools', label: 'Tools & templates' },
  { to: '/partners', label: 'Partners' },
] as const;

export function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' || pathname.startsWith('/topics') : pathname.startsWith(to);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-topbar max-w-6xl items-center gap-4 px-5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-[19px] tracking-[-0.01em]">FABRIX</span>
            <span className="text-[13px] text-muted">Learning Hub</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[13.5px] transition ${isActive(item.to) ? 'font-medium text-ink' : 'text-ink2 hover:text-ink'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href={`${PLATFORM_URL}/register`}
            className="ml-auto flex items-center gap-1.5 rounded-fx-sm bg-violet px-3.5 py-2 text-[12.5px] font-medium text-white transition hover:brightness-110"
          >
            Join FABRIX
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        {/* Three destinations do not warrant a burger; on narrow screens they
            get their own row rather than disappearing behind a menu. */}
        <nav className="flex h-11 items-center gap-5 overflow-x-auto border-t border-line px-5 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-[13px] whitespace-nowrap transition ${
                isActive(item.to) ? 'font-medium text-ink' : 'text-ink2'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <Outlet />

      <footer className="mt-20 border-t border-line bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-[12.5px] text-muted sm:flex-row sm:items-center">
          <p className="max-w-lg">
            The FABRIX Learning Hub gathers practical knowledge produced by the project partners on circular
            textile and clothing production in European cities.
          </p>
          <div className="flex gap-4 sm:ml-auto">
            <a href="https://www.fabrixproject.eu/about" className="hover:text-ink">About FABRIX</a>
            <a href={PLATFORM_URL} className="hover:text-ink">The platform</a>
            <a href="https://www.fabrixproject.eu/contact" className="hover:text-ink">Contact</a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-10 text-[11.5px] text-muted">
          Funded by the European Union under Grant Agreement No. 101135638.
        </div>
      </footer>
    </div>
  );
}
