import { Link, useParams } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import { PLATFORM_URL, topicQueryOptions } from '../lib/directus';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { audienceLabel, typeLabel } from '../lib/taxonomy';
import type { Author, Category, Partner } from '../lib/types';
import { Chip } from '../components/Chip';
import { DownloadList } from '../components/DownloadList';
import { Gallery } from '../components/Gallery';
import { Helpful } from '../components/Helpful';
import { PartnerLogo } from '../components/PartnerLogo';
import { VideoEmbed } from '../components/VideoEmbed';

export function TopicPage() {
  const { slug } = useParams({ from: '/topics/$slug' });
  const { data: topic } = useSuspenseQuery(topicQueryOptions(slug));

  const category = topic.category as Category;
  const partner = topic.partner as Partner;
  const authors = (topic.authors ?? []).map((a) => a.authors_id).filter(Boolean) as Author[];
  const video = topic.resources?.find((r) => r.kind === 'video' && r.url);
  const downloads = topic.resources?.filter((r) => r !== video) ?? [];
  const related = (topic.related ?? []).map((r) => r.related_topics_id).filter(Boolean);

  useDocumentTitle(topic.title, topic.summary);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-ink2 hover:text-ink">
        <ArrowLeft className="size-3.5" />
        Back to the hub
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article>
          <p className="mb-3 flex items-center gap-1.5 text-[12px] text-muted">
            <Link to="/" search={{ cat: category?.key }} className="hover:text-ink">
              {category?.label_short ?? category?.label}
            </Link>
            <ChevronRight className="size-3" />
            <span>{typeLabel(topic.type)}</span>
          </p>

          <h1 className="max-w-[24ch] text-[clamp(25px,3.2vw,33px)] leading-[1.15] tracking-[-0.02em]">
            {topic.title}
          </h1>

          <div className="mt-4 mb-6 flex flex-wrap gap-1.5">
            <Chip tone="outline">{typeLabel(topic.type)}</Chip>
            {topic.audiences?.map((audience) => (
              <Chip key={audience}>For {audienceLabel(audience).toLowerCase()}</Chip>
            ))}
            {topic.read_time ? (
              <Chip>
                <Clock className="size-3" />
                {topic.read_time} min read
              </Chip>
            ) : null}
          </div>

          {video && (
            <div className="mb-6">
              <VideoEmbed resource={video} />
            </div>
          )}

          <p className="mb-7 text-[16px] leading-relaxed text-ink">{topic.summary}</p>

          {/* Partner-authored HTML, converted from the contribution .docx. */}
          <div className="fx-prose" dangerouslySetInnerHTML={{ __html: topic.body }} />

          <Gallery photos={topic.photos ?? []} />

          {topic.external_links && topic.external_links.length > 0 && (
            <section className="mt-10 border-t border-line pt-5">
              <h2 className="mb-3 font-mono text-[10.5px] tracking-[0.11em] text-muted uppercase">External sources</h2>
              <ul className="flex flex-col gap-2">
                {topic.external_links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13.5px] text-violet-ink hover:underline"
                    >
                      {link.title}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Helpful topicId={topic.id} />
        </article>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--spacing-topbar)+1.5rem)] lg:self-start">
          <DownloadList resources={downloads} />

          <div className="rounded-xl border border-line bg-panel p-3.5">
            <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-muted uppercase">Contributed by</p>
            {partner?.logo && (
              <div className="mb-2.5">
                <PartnerLogo partner={partner} />
              </div>
            )}
            <p className="text-[13px] font-medium text-ink">{partner?.name}</p>
            {authors.length > 0 && (
              <p className="mt-0.5 text-[12px] text-ink2">{authors.map((a) => a.name).join(', ')}</p>
            )}
            {topic.co_contributors && (
              <p className="mt-1.5 text-[11.5px] text-muted">With {topic.co_contributors}</p>
            )}
            <div className="mt-3 flex flex-col gap-1.5">
              <Link
                to="/partners/$key"
                params={{ key: partner?.key }}
                className="text-[12.5px] text-violet-ink hover:underline"
              >
                All contributions from {partner?.short ?? partner?.name} →
              </Link>
              {partner?.fabrix_org_id && (
                <a
                  href={`${PLATFORM_URL}/organizations/${partner.fabrix_org_id}`}
                  className="inline-flex items-center gap-1 text-[12.5px] text-violet-ink hover:underline"
                >
                  View on FABRIX
                  <ArrowUpRight className="size-3" />
                </a>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div className="rounded-xl border border-line bg-panel p-3.5">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.11em] text-muted uppercase">Related</p>
              {related.map((item) => (
                <Link
                  key={item.id}
                  to="/topics/$slug"
                  params={{ slug: item.slug }}
                  className="block border-b border-line py-2 text-[12.5px] text-ink2 last:border-0 hover:text-violet-ink"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}

          {topic.compass_modules?.length > 0 && (
            <div className="rounded-xl border border-violet-border bg-violet-soft p-3.5">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.11em] text-violet-ink uppercase">Next step</p>
              <p className="text-[12.5px] leading-relaxed text-ink">
                See where your organisation stands on these practices.{' '}
                <a href={`${PLATFORM_URL}/org/assessments`} className="font-medium text-violet hover:underline">
                  Open the Compass →
                </a>
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
