import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Download, PlayCircle } from 'lucide-react';
import { assetUrl, toolsQueryOptions } from '../lib/directus';
import { RESOURCE_LABELS, languageLabel, resourceLabel } from '../lib/taxonomy';
import type { ResourceKind } from '../lib/types';
import { FilterChips } from '../components/FilterChips';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export interface ToolsSearch {
  kind?: ResourceKind;
}

/**
 * On an article the partner's CTA is the right label ("Download the canvas").
 * In a list of fifteen of them it is not: a dozen cards reading "Watch the
 * webinar" tell you nothing. So name the thing, and let the CTA be the button.
 */
function toolTitle(tool: { kind: ResourceKind; cta_label: string; topic: { title: string } }) {
  if (tool.kind === 'video') return tool.topic.title;
  return tool.cta_label.replace(/^(download|read|watch|get)\s+(the\s+)?/i, '').replace(/^./, (c) => c.toUpperCase());
}

/**
 * The download area of every article, listed as objects in their own right.
 * These canvases and roadmaps are what an SME comes back for — burying them
 * inside the articles wastes the most actionable thing the partners produced.
 */
export function ToolsPage() {
  const search = useSearch({ from: '/tools' });
  const navigate = useNavigate({ from: '/tools' });
  const { data: tools } = useSuspenseQuery(toolsQueryOptions());

  useDocumentTitle('Tools & templates');

  // Downloads before recordings, then alphabetical — a stable, scannable order
  // rather than whatever Directus returns.
  const ordered = [...tools].sort(
    (a, b) =>
      Number(a.kind === 'video') - Number(b.kind === 'video') ||
      toolTitle(a).localeCompare(toolTitle(b)),
  );
  const shown = search.kind ? ordered.filter((tool) => tool.kind === search.kind) : ordered;
  const kinds = [...new Set(ordered.map((tool) => tool.kind))];

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10">
      <h1 className="text-[clamp(26px,3.4vw,34px)] leading-[1.15] tracking-[-0.02em]">Tools &amp; templates</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink2">
        Every canvas, roadmap, matrix, recording and report the FABRIX partners produced — free to download,
        print and take into a meeting.
      </p>

      <div className="mt-6 mb-6 flex flex-wrap items-center gap-2">
        <FilterChips
          label="Kind"
          allLabel="Everything"
          value={search.kind}
          onChange={(kind) => navigate({ search: { kind }, replace: true })}
          options={kinds.map((kind) => ({ value: kind, label: RESOURCE_LABELS[kind] ?? kind }))}
        />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((tool) => {
          const href = tool.url ?? assetUrl(tool.file, { download: '' });
          const isVideo = tool.kind === 'video';
          return (
            <li key={tool.id} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-violet-soft text-violet">
                  {isVideo ? <PlayCircle className="size-[18px]" strokeWidth={1.7} /> : <Download className="size-[18px]" strokeWidth={1.7} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug text-ink">{toolTitle(tool)}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {resourceLabel(tool.kind)}
                    {tool.language !== 'en' && ` · ${languageLabel(tool.language)}`}
                  </p>
                </div>
              </div>

              <Link
                to="/topics/$slug"
                params={{ slug: tool.topic.slug }}
                className="text-[13px] text-ink2 hover:text-violet-ink"
              >
                {isVideo ? tool.cta_label : `From: ${tool.topic.title}`}
              </Link>

              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto rounded-fx-sm border border-line2 px-3 py-2 text-center text-[12.5px] font-medium text-ink transition hover:border-violet-border hover:bg-violet-soft"
                >
                  {isVideo ? 'Watch' : 'Download'}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
