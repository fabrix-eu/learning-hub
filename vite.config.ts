import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5173 is what back.fabrixproject.eu's CORS_ORIGIN allows for local dev.
  server: { port: 5173 },
});
