import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { assetUrl } from '../lib/directus';

// `id` is taken out of the img attributes: here it is the Directus file id, not the HTML id.
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'id' | 'src' | 'width' | 'height'> & {
  /** Directus file id. */
  id: string | null | undefined;
  /** Directus transform for the real image: width, height, fit, quality… (webp is added). */
  transform?: Record<string, string>;
  /**
   * The file's own pixel size (directus_files.width/height). Rendered as the
   * img's width/height attributes so the browser reserves the right box before
   * anything loads — required when the image has no fixed height.
   */
  dims?: { width: number | null; height: number | null } | null;
  /** false for logos: a blurred placeholder of a logo reads as a smudge; it only fades in. */
  blur?: boolean;
  /** An image already on screen (a gallery thumbnail) to blur instead of fetching a tiny one. */
  placeholderSrc?: string;
  /** Classes on the frame (position, size, rounding). The img fills it. */
  frameClassName?: string;
};

/**
 * Every Directus image in the hub: a tiny blurred preview (a 32px transform,
 * a few hundred bytes, same crop as the real image) shows at once, and the
 * full image fades in over it once decoded. No empty box while photos load.
 */
export function BlurImage({
  id, transform = {}, dims, blur = true, placeholderSrc, frameClassName = '', className = '', alt = '', loading = 'lazy', ...rest
}: Props) {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const src = assetUrl(id ?? null, { format: 'webp', ...transform }) ?? undefined;

  // A cached image can finish before React attaches onLoad.
  useEffect(() => {
    setLoaded(Boolean(img.current?.complete && img.current.naturalWidth));
  }, [src]);

  if (!src) return null;

  const { width, height, fit } = transform;
  const tiny: Record<string, string> = { width: '32', format: 'webp', quality: '40' };
  if (width && height) tiny.height = String(Math.max(1, Math.round((32 * Number(height)) / Number(width))));
  if (fit) tiny.fit = fit;
  const placeholder = blur ? (placeholderSrc ?? assetUrl(id ?? null, tiny) ?? undefined) : undefined;

  // Callers may position or lay out the frame themselves; never stack a
  // conflicting default under them (utility order in the CSS decides otherwise).
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(frameClassName);
  const displayed = /(^|\s)(inline-block|inline-flex|flex|grid|hidden)(\s|$)/.test(frameClassName);
  const frame = [
    'overflow-hidden',
    positioned ? '' : 'relative',
    displayed ? '' : 'block',
    blur && !loaded ? 'bg-panel' : '',
    frameClassName,
  ].filter(Boolean).join(' ');

  return (
    <span className={frame}>
      {placeholder && !loaded && (
        <img src={placeholder} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
      )}
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        width={dims?.width ?? undefined}
        height={dims?.height ?? undefined}
        onLoad={() => setLoaded(true)}
        className={`relative transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </span>
  );
}
