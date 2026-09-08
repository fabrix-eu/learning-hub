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
      className="group flex flex-col gap-3.5 rounded-fx border border-line bg-card p-5 transition hover:-translate-y-px hover:border-line2 hover:shadow-[0_8px_24px_-14px_rgba(26,26,34,0.25)]"
    >
      <div className="flex gap-3">
        <CategoryIcon icon={category?.icon ?? null} accent={category?.accent ?? 'violet'} />
        <div className="min-w-0">
          <h3 className="text-heading text-ink group-hover:text-violet-ink">{topic.title}</h3>
          <p className="mt-2 line-clamp-3 text-small text-ink2">{topic.summary}</p>
        </div>
      </div>

      {/* Chips and byline are two rows, not one wrapping row: at the current
          chip size the byline fell to its own line on some cards and not on
          others, which left a grid of cards that never lined up. */}
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="outline">{typeLabel(topic.type)}</Chip>
          {video && (
            <Chip tone="violet">
              <PlayCircle className="size-3" />
              {video.language === 'en' ? 'Video' : `Video · ${languageLabel(video.language)}`}
            </Chip>
          )}
          {downloads.length > 0 && <Chip>{downloads.length} download{downloads.length > 1 ? 's' : ''}</Chip>}
        </div>
        <span className="flex items-center gap-1.5 border-t border-line pt-2.5 text-[12.5px] text-muted">
          {partner?.short && <span>{partner.short}</span>}
          {topic.read_time ? (
            <>
              <span aria-hidden>·</span>
              <Clock className="size-3.5" />
              {topic.read_time} min
            </>
          ) : null}
        </span>
      </div>
    </Link>
  );
}
