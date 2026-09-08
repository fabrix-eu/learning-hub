import { PLATFORM_URL } from '../lib/directus';

const SOCIAL = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/101634457/',
    path: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/fabrixproject/',
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
  },
];

const LINKS = [
  { label: 'About FABRIX', href: 'https://www.fabrixproject.eu/about' },
  { label: 'News', href: 'https://www.fabrixproject.eu/news' },
  { label: 'The platform', href: PLATFORM_URL },
  { label: 'Contact', href: 'https://www.fabrixproject.eu/contact' },
];

/**
 * Logos and funding disclaimer are aligned on fabrixproject.eu and reviewed by
 * the project officer: the FABRIX mark, the EU emblem with "Funded by the
 * European Union", and the grant disclaimer **in full**. Do not shorten the
 * disclaimer or drop either logo.
 */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-3">
          {/* self-start: in a flex column the img would otherwise stretch to the
              column width and centre the artwork inside it. */}
          <img src="/fabrix-logo.svg" alt="FABRIX" className="h-6 w-auto self-start" />
          <p className="max-w-sm text-small text-muted">
            Practical knowledge on circular textile and clothing production, produced by the FABRIX
            project partners.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:ml-auto sm:items-end">
          <nav className="flex flex-wrap gap-4 text-small font-medium text-ink2">
            {LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-2">
            {SOCIAL.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`FABRIX on ${social.label}`}
                className="flex size-9 items-center justify-center rounded-fx-sm border border-line text-ink2 transition hover:border-violet hover:text-violet"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-[17px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {social.path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row">
          <img
            src="/flag-of-europe.svg"
            alt="Flag of Europe"
            className="h-9 w-auto flex-none rounded-[3px]"
          />
          <div className="max-w-3xl">
            <p className="text-small font-bold text-ink">Funded by the European Union</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              FABRIX has received funding from the European Union’s Horizon Europe Programme, under
              grant agreement No. 101135638. Views and opinions expressed are however those of the
              author(s) only and do not necessarily reflect those of the European Union or HaDEA.
              Neither the European Union nor the granting authority can be held responsible for them.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 py-5 text-[12px] text-muted">
          <a href="https://www.fabrixproject.eu/privacy-policy" className="hover:text-ink">
            Privacy policy
          </a>
          <a href="https://www.fabrixproject.eu/privacy-policy/cookies" className="hover:text-ink">
            Cookies policy
          </a>
          <span className="ml-auto">© {new Date().getFullYear()} FABRIX</span>
        </div>
      </div>
    </footer>
  );
}
