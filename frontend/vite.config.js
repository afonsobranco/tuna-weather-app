import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from /tuna-weather-app/
  base: '/tuna-weather-app/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          store: ['zustand'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
