import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { assetUrl } from '../lib/directus';
import type { GalleryItem, Photo } from '../lib/types';
import { BlurImage } from './BlurImage';

/**
 * Directus hands the gallery over as junction rows. Flatten them into what the
 * figures need, dropping any row whose file was deleted from the library.
 */
const toPhotos = (items: GalleryItem[]): Photo[] =>
  [...items]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .flatMap((item) =>
      item.directus_files_id
        ? [{
            id: item.id,
            image: item.directus_files_id.id,
            caption: item.caption,
            credit: item.directus_files_id.credit,
            width: item.directus_files_id.width ?? null,
            height: item.directus_files_id.height ?? null,
          }]
        : [],
    );

const THUMB = { width: '720', height: '540', fit: 'cover', quality: '75' };
const LARGE = { width: '1600', quality: '85' };

/** The grid thumbnail, already in the browser cache: the lightbox blurs it while the large one loads. */
const thumbUrl = (photo: Photo) => assetUrl(photo.image, { ...THUMB, format: 'webp' }) ?? undefined;

function Caption({ photo, tone }: { photo: Photo; tone: 'light' | 'dark' }) {
  if (!photo.caption && !photo.credit) return null;
  return (
    <figcaption className={`mt-2 text-small ${tone === 'dark' ? 'text-white/80' : 'text-ink2'}`}>
      {photo.caption}
      {photo.credit && (
        <span className={tone === 'dark' ? 'text-white/50' : 'text-muted'}>
          {photo.caption ? ' · ' : ''}
          {photo.credit}
        </span>
      )}
    </figcaption>
  );
}

/**
 * A topic's photos. Most topics have none — this renders nothing at all then,
 * no heading and no empty state. One photo is an illustration, so it gets the
 * full width of the column; two or more become a grid. Both open a lightbox.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const photos = toPhotos(items);
  if (!photos.length) return null;

  const open = index === null ? null : photos[index];
  const move = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));

  return (
    <section className="mt-8">
      {photos.length === 1 ? (
        <figure>
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="block w-full cursor-zoom-in overflow-hidden rounded-fx border border-line"
          >
            <BlurImage id={photos[0].image} transform={LARGE} dims={photos[0]} alt={photos[0].caption ?? ''} className="h-auto w-full" />
          </button>
          <Caption photo={photos[0]} tone="light" />
        </figure>
      ) : (
        <ul className={`grid gap-2 sm:grid-cols-2 ${photos.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {photos.map((photo, i) => (
            <li key={photo.id}>
              <figure>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group block w-full cursor-zoom-in overflow-hidden rounded-fx border border-line"
                >
                  <BlurImage
                    id={photo.image}
                    transform={THUMB}
                    alt={photo.caption ?? ''}
                    frameClassName="aspect-[4/3] w-full transition group-hover:scale-[1.02]"
                    className="h-full w-full object-cover"
                  />
                </button>
                <Caption photo={photo} tone="light" />
              </figure>
            </li>
          ))}
        </ul>
      )}

      <Dialog.Root open={open !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/85" />
          <Dialog.Content
            ref={content}
            tabIndex={-1}
            /*
             * Radix focuses the first focusable child on open — here the
             * "previous photo" arrow, so Enter would walk the gallery
             * backwards the moment it opens. Focus the dialog itself instead:
             * the arrow keys below are bound to it, and Escape still closes.
             */
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              content.current?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') move(1);
              if (event.key === 'ArrowLeft') move(-1);
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-10"
          >
            <Dialog.Title className="sr-only">{open?.caption ?? 'Photo'}</Dialog.Title>
            {open && (
              <figure className="flex max-h-full max-w-5xl flex-col items-center">
                {/* Keyed on the photo so moving to the next one restarts the blur, not a blank frame. */}
                <BlurImage
                  key={open.id}
                  id={open.image}
                  transform={LARGE}
                  dims={open}
                  placeholderSrc={thumbUrl(open)}
                  loading="eager"
                  alt={open.caption ?? ''}
                  frameClassName="inline-block rounded-fx bg-white"
                  className="h-auto max-h-[78vh] w-auto max-w-full object-contain"
                />
                <Caption photo={open} tone="dark" />
              </figure>
            )}

            {photos.length > 1 && (
              <div className="mt-4 flex items-center gap-3 text-label text-white/60">
                <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="hover:text-white">
                  <ChevronLeft className="size-5" />
                </button>
                {index !== null && `${index + 1} / ${photos.length}`}
                <button type="button" onClick={() => move(1)} aria-label="Next photo" className="hover:text-white">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}

            <Dialog.Close aria-label="Close" className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X className="size-6" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
