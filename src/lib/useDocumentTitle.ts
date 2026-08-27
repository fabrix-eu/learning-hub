import { useEffect } from 'react';

const SUFFIX = 'FABRIX Learning Hub';

/**
 * The build prerenders a correct <title> and description per route, but a
 * client-side navigation replaces neither. Every page sets its own.
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
