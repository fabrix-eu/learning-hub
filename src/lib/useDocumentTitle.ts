import { useEffect } from 'react';

const SUFFIX = 'FABRIX Learning Hub';

const setMeta = (selector: string, content: string) =>
  document.querySelector(selector)?.setAttribute('content', content);

/**
 * The build prerenders a correct <title>, description and sharing tags per
 * route, but a client-side navigation replaces none of them. Every page sets
 * its own. Crawlers never navigate, so the sharing tags are kept in step for
 * the reader who copies the URL and for the "share" extensions that read the
 * live head — not for the card itself, which the prerender owns.
 *
 * `image` is the page's own picture when it has one; without it, the hub's
 * default banner set in index.html stays.
 */
export function useDocumentTitle(title?: string, description?: string, image?: string | null) {
  useEffect(() => {
    const full = title ? `${title} · ${SUFFIX}` : SUFFIX;
    document.title = full;
    setMeta('meta[property="og:title"]', full);
    setMeta('meta[name="twitter:title"]', full);
    setMeta('meta[property="og:url"]', window.location.href.split(/[?#]/)[0]);
    if (description) {
      setMeta('meta[name="description"]', description);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[name="twitter:description"]', description);
    }
    const picture = image ?? `${window.location.origin}/og-image.jpg`;
    setMeta('meta[property="og:image"]', picture);
    setMeta('meta[name="twitter:image"]', picture);
  }, [title, description, image]);
}
