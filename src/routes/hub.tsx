import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { categoriesQueryOptions, topicsQueryOptions } from '../lib/directus';
import { AUDIENCE_LABELS, TYPE_LABELS } from '../lib/taxonomy';
import type { Audience, Category, Topic, TopicType } from '../lib/types';
import { CategoryIcon } from '../components/CategoryIcon';
import { FilterChips } from '../components/FilterChips';
import { TopicCard } from '../components/TopicCard';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export interface HubSearch {
  for?: Audience;
  type?: TopicType;
  cat?: string;
  q?: string;
  media?: 'video' | 'download';
}

const FEATURED = '__featured__';

export function HubPage() {
  const search = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const { data: topics } = useSuspenseQuery(topicsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  useDocumentTitle();

  /** Every filter is a URL search param, so a filtered view is a shareable link. */
  const set = (patch: Partial<HubSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const matches = useMemo(() => {
    const needle = search.q?.trim().toLowerCase();
    return topics.filter((topic) => {
      if (search.for && !topic.audiences?.includes(search.for)) return false;
      if (search.type && topic.type !== search.type) return false;
      if (search.cat === FEATURED && !topic.featured) return false;
      if (search.cat && search.cat !== FEATURED && (topic.category as Category)?.key !== search.cat) return false;
      if (search.media === 'video' && !topic.resources?.some((r) => r.kind === 'video')) return false;
      if (search.media === 'download' && !topic.resources?.some((r) => r.kind !== 'video')) return false;
      if (needle && !`${topic.title} ${topic.summary}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [topics, search]);

  const countFor = (key: string) =>
    key === FEATURED
      ? topics.filter((t) => t.featured).length
      : topics.filter((t) => (t.category as Category)?.key === key).length;

  /** Groups with nothing left after filtering collapse entirely. */
  const groups = categories
    .map((category) => ({ category, items: matches.filter((t) => (t.category as Category)?.key === category.key) }))
    .filter((group) => group.items.length > 0);

  const filtered = Boolean(search.for || search.type || search.cat || search.q || search.media);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="max-w-4xl text-display sm:text-hero">
        Practical knowledge for circular textile businesses
      </h1>
      <p className="mt-5 max-w-2xl text-lead text-ink2">
        Circular business models, EU regulation, carbon footprint, local production, running a community
        event — written by the FABRIX partners for makers and the people who support them.
      </p>
      <p className="mt-5 mb-8 flex items-center gap-2 text-small text-muted">
        <span className="size-1.5 rounded-full bg-green" aria-hidden />
        {topics.length} topics live · adding more each month
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterChips
          label="For"
          allLabel="Everyone"
          value={search.for}
          onChange={(value) => set({ for: value })}
          options={Object.entries(AUDIENCE_LABELS).map(([value, label]) => ({ value: value as Audience, label }))}
        />
        <span className="mx-2 h-4 w-px bg-line2" aria-hidden />
        <FilterChips
          label="Type"
          value={search.type}
          onChange={(value) => set({ type: value })}
          options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value: value as TopicType, label }))}
        />
        <label className="ml-auto flex items-center gap-2 rounded-full border border-line2 bg-card px-3.5 py-2">
          <Search className="size-3.5 text-muted" />
          <input
            type="search"
            defaultValue={search.q ?? ''}
            onChange={(event) => set({ q: event.target.value || undefined })}
            placeholder="Search the hub"
            aria-label="Search the hub"
            className="w-40 bg-transparent text-small outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          // A category with nothing published in it is dead weight, not honesty.
          ...categories.filter((category) => countFor(category.key) > 0),
          { key: FEATURED, label_short: 'Most read', accent: 'violet', icon: 'star' } as unknown as Category,
        ].map(
          (category) => {
            const active = search.cat === category.key;
            return (
              <button
                key={category.key}
                type="button"
                aria-pressed={active}
                onClick={() => set({ cat: active ? undefined : category.key })}
                className={`flex items-center gap-3.5 rounded-fx border p-4 text-left transition hover:-translate-y-px ${
                  active ? 'border-violet bg-violet' : 'border-line bg-card hover:border-line2'
                }`}
              >
                <CategoryIcon icon={category.icon} accent={category.accent} on={active} />
                <span className="min-w-0">
                  <span className={`block text-body font-bold ${active ? 'text-white' : 'text-ink'}`}>
                    {category.label_short ?? category.label}
                  </span>
                  <span className={`block text-small ${active ? 'text-white/75' : 'text-muted'}`}>
                    {category.key === FEATURED ? 'this month' : `${countFor(category.key)} topics`}
                  </span>
                </span>
              </button>
            );
          },
        )}
      </div>

      {matches.length === 0 && (
        <p className="rounded-fx-lg border-2 border-dashed border-line2 p-10 text-center text-body text-ink2">
          No topics match those filters.{' '}
          <button type="button" className="text-violet-ink underline" onClick={() => navigate({ search: {} })}>
            Clear them
          </button>
          .
        </p>
      )}

      {filtered && matches.length > 0 ? (
        <Grid topics={matches} label={`${matches.length} topic${matches.length > 1 ? 's' : ''}`} />
      ) : (
        groups.map(({ category, items }) => (
          <Grid key={category.key} topics={items} label={`${category.label_short ?? category.label} · ${items.length} topics`} />
        ))
      )}
    </main>
  );
}

function Grid({ topics, label }: { topics: Topic[]; label: string }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3.5 text-label text-muted uppercase">{label}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
