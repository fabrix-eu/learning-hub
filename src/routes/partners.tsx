import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { partnersQueryOptions, topicsQueryOptions } from '../lib/directus';
import { PartnerLogo } from '../components/PartnerLogo';
import type { Partner } from '../lib/types';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function PartnersPage() {
  const { data: partners } = useSuspenseQuery(partnersQueryOptions());
  const { data: topics } = useSuspenseQuery(topicsQueryOptions());

  useDocumentTitle('Partners');

  const count = (key: string) => topics.filter((t) => (t.partner as Partner)?.key === key).length;

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="max-w-3xl text-display sm:text-hero">The partners behind the hub</h1>
      <p className="mt-5 mb-9 max-w-2xl text-lead text-ink2">
        Everything here was written by an organisation working on circular textile in a European city — not by
        a content team. Each entry is signed.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {partners.map((partner) => (
          <li key={partner.key}>
            <Link
              to="/partners/$key"
              params={{ key: partner.key }}
              className="flex h-full flex-col gap-2 rounded-fx border border-line bg-card p-5 transition hover:-translate-y-px hover:border-line2"
            >
              {partner.logo && <PartnerLogo partner={partner} />}
              <p className="text-heading text-ink">{partner.name}</p>
              <p className="text-small text-muted">
                {[partner.city, partner.country].filter(Boolean).join(' · ')}
                {' · '}
                {count(partner.key)} contribution{count(partner.key) > 1 ? 's' : ''}
              </p>
              {partner.blurb && <p className="text-small text-ink2">{partner.blurb}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
