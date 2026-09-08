import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // The Directus the dev server proxies to — the same VITE_DIRECTUS_URL the
  // build uses, read here so a .env pointing elsewhere moves the proxy too.
  const target = loadEnv(mode, process.cwd(), '').VITE_DIRECTUS_URL || 'https://back.fabrixproject.eu';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      /*
       * Directus is reached through this proxy in dev, never straight from the
       * browser: the request then leaves from the dev server, where CORS does
       * not apply. Before this, `back.fabrixproject.eu`'s CORS_ORIGIN allowed
       * exactly one local origin (5173) — so the day another project held that
       * port, vite moved to 5174 without a word and the hub rendered "Something
       * went wrong!" over a console full of preflight failures. The dev server
       * is now free to run on any port.
       */
      proxy: {
        '/cms': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cms/, ''),
        },
      },
    },
  };
});
