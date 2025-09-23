import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: '.'
  },
  server: {
    port: 8705,
    strictPort: true,
  },
  preview: {
    port: 8768,
    strictPort: true,
  },
  base: './'
})
