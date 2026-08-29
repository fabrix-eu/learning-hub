export type Audience = 'sme' | 'facilitator' | 'research';
export type TopicType = 'explainer' | 'guide' | 'case' | 'method' | 'tool';
export type ResourceKind = 'video' | 'canvas' | 'template' | 'roadmap' | 'slides' | 'report' | 'diagram';
export type Accent = 'green' | 'amber' | 'teal' | 'rose' | 'indigo' | 'violet';

export interface Category {
  key: string;
  label: string;
  label_short: string | null;
  accent: Accent;
  icon: string | null;
  blurb: string | null;
  sort: number;
}

export interface Partner {
  key: string;
  name: string;
  short: string | null;
  country: string | null;
  city: string | null;
  logo: string | null;
  blurb: string | null;
  fabrix_org_id: string | null;
}

export interface Author {
  id: number;
  name: string;
  role: string | null;
  avatar: string | null;
}

export interface Resource {
  id: number;
  kind: ResourceKind;
  cta_label: string;
  language: string;
  url: string | null;
  file: string | null;
  duration: number | null;
}

export interface Photo {
  id: number;
  image: string;
  caption: string | null;
  credit: string | null;
}

export interface ExternalLink {
  title: string;
  url: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  type: TopicType;
  audiences: Audience[];
  featured: boolean;
  read_time: number | null;
  co_contributors: string | null;
  compass_modules: string[];
  external_links: ExternalLink[] | null;
  date_updated: string | null;
  category: Category | string;
  partner: Partner | string;
  authors: { authors_id: Author }[];
  related: { related_topics_id: Topic }[];
  resources: Resource[];
  photos: Photo[];
}

/** A resource lifted out of its topic, for the Tools & templates listing. */
export interface ToolEntry extends Resource {
  topic: Pick<Topic, 'slug' | 'title'> & { category: string };
}
