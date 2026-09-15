import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { languageLabel } from '../lib/taxonomy';
import type { Resource } from '../lib/types';

/** Pulls the id out of both youtube.com/watch?v= and youtu.be/ forms. */
function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Click-to-load: the YouTube iframe is only mounted once the reader asks for it,
 * so opening an article does not hand Google a request on their behalf.
 */
export function VideoEmbed({ resource }: { resource: Resource }) {
  const [playing, setPlaying] = useState(false);
  const id = resource.url ? youtubeId(resource.url) : null;
  if (!id) return null;

  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-fx border border-line">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={resource.cta_label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-fx border border-line bg-panel"
    >
      {/* YouTube's thumbnail is not a Directus file, so no blurred preview: the panel colour holds the frame. */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="size-full object-cover transition group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
        <PlayCircle className="size-14 text-white drop-shadow" strokeWidth={1.6} />
      </span>
      <span className="absolute bottom-3 left-3 rounded-fx-sm bg-violet px-2.5 py-1.5 text-label text-white uppercase">
        {resource.cta_label}
        {resource.language !== 'en' && ` · ${languageLabel(resource.language)}`}
      </span>
    </button>
  );
}
