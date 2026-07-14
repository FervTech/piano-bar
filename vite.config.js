import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // For Rolldown (experimental)
    rolldownOptions: {
      external: [
        'bcryptjs',
        'crypto',
        'stream',
        'util',
        'path',
        'fs',
        'os',
        // add any other Node.js modules you import
      ]
    },
    // If you're also using Rollup (fallback), include this:
    rollupOptions: {
      external: [
        'bcryptjs',
        'crypto',
        'stream',
        'util',
        'path',
        'fs',
        'os',
      ]
    }
  }
});