import type { AnyRouter } from '@tanstack/react-router';

/**
 * Matomo, cookieless: visits are counted without storing anything on the
 * visitor's device, so no consent banner is required (see the cookies policy).
 * Off in dev and whenever the env is not set.
 */
export function startAnalytics(router: AnyRouter) {
  const url = import.meta.env.VITE_MATOMO_URL;
  const site = import.meta.env.VITE_MATOMO_SITE_ID;
  if (!url || !site || import.meta.env.DEV) return;

  const base = url.endsWith('/') ? url : `${url}/`;
  const paq = (window._paq = window._paq ?? []);
  paq.push(['disableCookies']); // must precede the tracker load
  paq.push(['enableLinkTracking']);
  paq.push(['setTrackerUrl', `${base}matomo.php`]);
  paq.push(['setSiteId', site]);

  const script = document.createElement('script');
  script.async = true;
  script.src = `${base}matomo.js`;
  document.head.appendChild(script);

  // Fires for the first load and every client-side navigation. Deferred one
  // tick so the page's own useDocumentTitle has run.
  router.subscribe('onResolved', ({ toLocation }) => {
    setTimeout(() => {
      paq.push(['setCustomUrl', toLocation.href]);
      paq.push(['setDocumentTitle', document.title]);
      paq.push(['trackPageView']);
    }, 0);
  });
}
