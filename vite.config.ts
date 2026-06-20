import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the static build works when served from a sub-path on
// Hostinger shared hosting as well as from root on Render.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
