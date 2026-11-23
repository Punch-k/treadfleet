import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the build works from any folder (GitHub Pages, a subpath, or a file server).
export default defineConfig({ plugins: [react()], base: './', test: { include: ['src/**/*.test.ts'] } } as never);
