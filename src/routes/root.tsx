import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { PLATFORM_URL } from '../lib/directus';
import { Footer } from '../components/Footer';
import { SurfaceSwitcher } from '../components/SurfaceSwitcher';

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
          <div className="flex flex-none items-center gap-2.5">
            <Link to="/" aria-label="Learning Hub home">
              <img src="/fabrix-logo.svg" alt="FABRIX" className="h-7 w-auto" />
            </Link>
            <span className="h-5 w-px bg-line2" aria-hidden />
            <SurfaceSwitcher />
          </div>

          <nav className="ml-6 hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-body transition ${
                  isActive(item.to) ? 'font-extrabold text-ink' : 'font-medium text-ink2 hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href={`${PLATFORM_URL}/register`}
            className="ml-auto flex items-center gap-1.5 rounded-fx-action bg-violet px-4 py-2.5 text-body font-bold text-white transition hover:brightness-110"
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
              className={`text-body whitespace-nowrap transition ${
                isActive(item.to) ? 'font-extrabold text-ink' : 'font-medium text-ink2'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <Outlet />

      <Footer />
    </div>
  );
}
