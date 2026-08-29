import { createDirectus, rest, readItems, readItem, createItem } from '@directus/sdk';
import { queryOptions } from '@tanstack/react-query';
import type { Category, Partner, Topic, ToolEntry } from './types';

export const DIRECTUS_URL: string =
  import.meta.env.VITE_DIRECTUS_URL || 'https://back.fabrixproject.eu';

export const PLATFORM_URL: string =
  import.meta.env.VITE_PLATFORM_URL || 'https://platform.fabrixproject.eu';

/*
 * The client is deliberately left untyped: the SDK's schema generic infers
 * relational `fields` selections poorly once you nest two levels, and fighting
 * it buys nothing here. The contract is enforced where it matters — every query
 * below returns one of the app types in ./types.ts.
 *
 * No token: the Directus Public role reads published content. Nothing secret
 * ships in this bundle.
 */
export const directus = createDirectus(DIRECTUS_URL).with(rest());

export const assetUrl = (id: string | null, params?: Record<string, string>) =>
  id ? `${DIRECTUS_URL}/assets/${id}${params ? `?${new URLSearchParams(params)}` : ''}` : null;

const PUBLISHED = { status: { _eq: 'published' } };

/** Everything a card needs, and nothing more. */
const CARD_FIELDS = [
  'id', 'slug', 'title', 'summary', 'type', 'audiences', 'featured', 'read_time',
  'category.key', 'category.label', 'category.label_short', 'category.accent', 'category.icon',
  'partner.key', 'partner.short', 'partner.name',
  'resources.kind', 'resources.language',
];

const ARTICLE_FIELDS = [
  '*',
  'category.*', 'partner.*',
  'authors.authors_id.*',
  'resources.*',
  'photos.*',
  'related.related_topics_id.id', 'related.related_topics_id.slug', 'related.related_topics_id.title',
];

export const topicsQueryOptions = () =>
  queryOptions({
    queryKey: ['topics'],
    queryFn: async () =>
      (await directus.request(
        readItems('topics', { fields: CARD_FIELDS, filter: PUBLISHED, sort: ['sort'], limit: -1 }),
      )) as Topic[],
  });

export const topicQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['topic', slug],
    queryFn: async () => {
      const rows = (await directus.request(
        readItems('topics', {
          fields: ARTICLE_FIELDS,
          filter: { ...PUBLISHED, slug: { _eq: slug } },
          limit: 1,
        }),
      )) as Topic[];
      if (!rows.length) throw new Error(`No published topic at "${slug}"`);
      return rows[0];
    },
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ['categories'],
    queryFn: async () =>
      (await directus.request(readItems('categories', { fields: ['*'], sort: ['sort'], limit: -1 }))) as Category[],
  });

export const partnersQueryOptions = () =>
  queryOptions({
    queryKey: ['partners'],
    queryFn: async () =>
      (await directus.request(readItems('partners', { fields: ['*'], sort: ['name'], limit: -1 }))) as Partner[],
  });

export const partnerQueryOptions = (key: string) =>
  queryOptions({
    queryKey: ['partner', key],
    queryFn: async () => (await directus.request(readItem('partners', key, { fields: ['*'] }))) as Partner,
  });

/**
 * Tools & templates lists the download area of every published article as an
 * object in its own right — that is what an SME actually comes back for.
 */
export const toolsQueryOptions = () =>
  queryOptions({
    queryKey: ['tools'],
    queryFn: async () =>
      (await directus.request(
        readItems('resources', {
          fields: ['*', 'topic.slug', 'topic.title', 'topic.category'],
          filter: { topic: PUBLISHED },
          sort: ['sort'],
          limit: -1,
        }),
      )) as ToolEntry[],
  });

export const sendFeedback = (topic: string, helpful: boolean) =>
  directus.request(createItem('feedback', { topic, helpful }));
