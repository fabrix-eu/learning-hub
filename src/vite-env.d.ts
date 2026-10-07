/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL?: string;
  readonly VITE_PLATFORM_URL?: string;
  readonly VITE_MATOMO_URL?: string;
  readonly VITE_MATOMO_SITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  _paq?: unknown[][];
}
