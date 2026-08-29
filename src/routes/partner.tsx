import { Link, useParams } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PLATFORM_URL, partnerQueryOptions, topicsQueryOptions } from '../lib/directus';
import type { Partner } from '../lib/types';
import { PartnerLogo } from '../components/PartnerLogo';
import { TopicCard } from '../components/TopicCard';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function PartnerPage() {
  const { key } = useParams({ from: '/partners/$key' });
  const { data: partner } = useSuspenseQuery(partnerQueryOptions(key));
  const { data: topics } = useSuspenseQuery(topicsQueryOptions());

  useDocumentTitle(partner.name, partner.blurb ?? undefined);

  const theirs = topics.filter((topic) => (topic.partner as Partner)?.key === key);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-8">
      <Link to="/partners" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-ink2 hover:text-ink">
        <ArrowLeft className="size-3.5" />
        All partners
      </Link>

      {partner.logo && (
        <div className="mb-4">
          <PartnerLogo partner={partner} size="lg" />
        </div>
      )}

      <h1 className="max-w-[22ch] text-[clamp(25px,3.2vw,33px)] leading-[1.15] tracking-[-0.02em]">{partner.name}</h1>
      <p className="mt-2 text-[12.5px] text-muted">{[partner.city, partner.country].filter(Boolean).join(' · ')}</p>
      {partner.blurb && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink2">{partner.blurb}</p>}

      {partner.fabrix_org_id && (
        <a
          href={`${PLATFORM_URL}/organizations/${partner.fabrix_org_id}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-fx-sm border border-violet-border bg-violet-soft px-3.5 py-2 text-[12.5px] font-medium text-violet-ink"
        >
          View their FABRIX profile
          <ArrowUpRight className="size-3.5" />
        </a>
      )}

      <h2 className="mt-10 mb-3 font-mono text-[10.5px] tracking-[0.11em] text-muted uppercase">
        {theirs.length} contribution{theirs.length > 1 ? 's' : ''}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {theirs.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </main>
  );
}
