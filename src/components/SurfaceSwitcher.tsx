import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { PLATFORM_URL } from '../lib/directus';

/**
 * The three FABRIX surfaces. Same entries, labels and order on every surface
 * (website: src/components/layout/navLinks.ts) — keep them in step.
 */
const SURFACES = [
  { label: 'Project', href: 'https://fabrixproject.eu', blurb: 'The project and its cities' },
  { label: 'Platform', href: PLATFORM_URL, blurb: 'Map, marketplace, Compass' },
  { label: 'Learning Hub', href: null, blurb: 'Guides and case studies' },
] as const;

/**
 * The name of this surface next to the wordmark, as part of the logo. It
 * opens the other two; each entry goes to that surface's home. The website
 * carries the same component, so the bar reads the same wherever you are.
 */
export function SurfaceSwitcher() {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="flex items-center gap-1 text-lead font-medium whitespace-nowrap text-ink2 outline-hidden transition hover:text-ink data-[state=open]:text-ink">
        Learning Hub
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={16}
          className="z-50 w-64 rounded-fx border border-line bg-card p-1.5 shadow-[0_18px_40px_-22px_rgba(26,26,34,0.55)]"
        >
          {SURFACES.map((surface) => {
            const content = (
              <>
                <span className="flex items-center gap-1.5 text-[14px] leading-[1.55] font-bold text-ink">
                  {surface.label}
                  {surface.href && <ArrowUpRight className="size-3.5 text-muted" aria-hidden />}
                </span>
                <span className="block text-[12.5px] leading-[1.45] text-muted">{surface.blurb}</span>
              </>
            );
            const className =
              'block rounded-fx-sm px-3 py-2 outline-hidden transition data-highlighted:bg-violet-soft';

            return (
              <DropdownMenu.Item key={surface.label} asChild>
                {surface.href ? (
                  <a href={surface.href} className={className}>
                    {content}
                  </a>
                ) : (
                  <Link to="/" className={`${className} bg-violet-soft`} aria-current="page">
                    {content}
                  </Link>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
