import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the static build serves from root (Render) or a sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5174 },
});
