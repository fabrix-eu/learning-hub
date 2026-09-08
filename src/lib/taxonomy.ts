import type { Accent, Audience, ResourceKind, TopicType } from './types';

/**
 * Display labels. The stored values are the FABRIX content-plan keys; these are
 * what a reader sees. Keep the two apart — renaming a label must never require
 * a data migration.
 */

export const AUDIENCE_LABELS: Record<Audience, string> = {
  sme: 'Organisations',
  facilitator: 'Facilitators',
  research: 'Researchers',
};

export const TYPE_LABELS: Record<TopicType, string> = {
  explainer: 'Explainer',
  guide: 'Guide',
  case: 'Case study',
  method: 'Method',
  tool: 'Tool',
};

export const RESOURCE_LABELS: Record<ResourceKind, string> = {
  video: 'Video',
  canvas: 'Canvas',
  template: 'Template',
  roadmap: 'Roadmap',
  slides: 'Slides',
  report: 'Report',
  diagram: 'Diagram',
};

/**
 * Tailwind cannot see class names built at runtime, so every accent pairing is
 * written out here in full.
 */
export const ACCENT_BLOCK: Record<Accent, string> = {
  green: 'bg-green-soft',
  amber: 'bg-amber-soft',
  teal: 'bg-teal-soft',
  rose: 'bg-rose-soft',
  indigo: 'bg-indigo-soft',
  violet: 'bg-violet-soft',
};

export const ACCENT_TEXT: Record<Accent, string> = {
  green: 'text-green',
  amber: 'text-amber',
  teal: 'text-teal',
  rose: 'text-rose',
  indigo: 'text-indigo',
  violet: 'text-violet-ink',
};

export const ACCENT_CHIP: Record<Accent, string> = {
  green: 'bg-green-soft text-green',
  amber: 'bg-amber-soft text-amber',
  teal: 'bg-teal-soft text-teal',
  rose: 'bg-rose-soft text-rose',
  indigo: 'bg-indigo-soft text-indigo',
  violet: 'bg-violet-soft text-violet-ink',
};

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  el: 'Greek',
  fr: 'French',
  es: 'Spanish',
  nl: 'Dutch',
  it: 'Italian',
};

export const audienceLabel = (value: Audience) => AUDIENCE_LABELS[value] ?? value;
export const typeLabel = (value: TopicType) => TYPE_LABELS[value] ?? value;
export const resourceLabel = (value: ResourceKind) => RESOURCE_LABELS[value] ?? value;
export const languageLabel = (value: string) => LANGUAGE_LABELS[value] ?? value.toUpperCase();
