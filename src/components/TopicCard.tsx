import { Link } from '@tanstack/react-router';
import { Clock, PlayCircle } from 'lucide-react';
import type { Category, Topic } from '../lib/types';
import { languageLabel, typeLabel } from '../lib/taxonomy';
import { CategoryIcon } from './CategoryIcon';
import { Chip } from './Chip';

export function TopicCard({ topic }: { topic: Topic }) {
  const category = topic.category as Category;
  const video = topic.resources?.find((r) => r.kind === 'video');
  const downloads = topic.resources?.filter((r) => r.kind !== 'video') ?? [];
  const partner = typeof topic.partner === 'string' ? null : topic.partner;

  return (
    <Link
      to="/topics/$slug"
      params={{ slug: topic.slug }}
      className="group flex flex-col gap-3 rounded-xl border border-line bg-card p-4 transition hover:-translate-y-px hover:border-line2 hover:shadow-[0_8px_24px_-14px_rgba(35,35,43,0.25)]"
    >
      <div className="flex gap-3">
        <CategoryIcon icon={category?.icon ?? null} accent={category?.accent ?? 'violet'} />
        <div className="min-w-0">
          <h3 className="text-[16px] leading-snug tracking-[-0.005em] text-ink group-hover:text-violet-ink">
            {topic.title}
          </h3>
          <p className="mt-1 line-clamp-3 text-[13.5px] leading-relaxed text-ink2">{topic.summary}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <Chip tone="outline">{typeLabel(topic.type)}</Chip>
        {video && (
          <Chip tone="violet">
            <PlayCircle className="size-3" />
            {video.language === 'en' ? 'Video' : `Video · ${languageLabel(video.language)}`}
          </Chip>
        )}
        {downloads.length > 0 && <Chip>{downloads.length} download{downloads.length > 1 ? 's' : ''}</Chip>}
        <span className="ml-auto flex items-center gap-1 text-[12px] text-muted">
          {partner?.short && <span>{partner.short}</span>}
          {topic.read_time ? (
            <>
              <span aria-hidden>·</span>
              <Clock className="size-3" />
              {topic.read_time} min
            </>
          ) : null}
        </span>
      </div>
    </Link>
  );
}
