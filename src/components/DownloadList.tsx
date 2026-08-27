import { Download, FileText } from 'lucide-react';
import { assetUrl } from '../lib/directus';
import { resourceLabel } from '../lib/taxonomy';
import type { Resource } from '../lib/types';

export function DownloadList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-panel p-3.5">
      <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-muted uppercase">Download</p>
      <ul className="flex flex-col gap-1.5">
        {resources.map((resource) => {
          const href = resource.url ?? assetUrl(resource.file, { download: '' });
          if (!href) return null;
          return (
            <li key={resource.id}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 rounded-fx-sm border border-line2 bg-card px-3 py-2.5 text-[12.5px] text-ink transition hover:border-violet-border hover:bg-violet-soft/40"
              >
                <FileText className="mt-0.5 size-4 flex-none text-violet" strokeWidth={1.6} />
                <span className="min-w-0">
                  <span className="block leading-snug">{resource.cta_label}</span>
                  <span className="block text-[10.5px] text-muted">{resourceLabel(resource.kind)}</span>
                </span>
                <Download className="mt-0.5 ml-auto size-3.5 flex-none text-muted" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
