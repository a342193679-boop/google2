import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': '/src/core',
      '@ui': '/src/ui',
      '@app': '/src',
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true,
    hmr: { overlay: true },
  },
  preview: {
    host: true,
    port: 5173,
    open: true,
  },
})
