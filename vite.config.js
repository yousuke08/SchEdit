import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: undefined,
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
