import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Automatically polyfill all Node built‑ins
      include: ['crypto', 'stream', 'util', 'buffer', 'process'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  // You no longer need to externalize Node built‑ins
  // build: { rolldownOptions: { external: [] } }
})