import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/sungolf',
    assetsDir: '.'
  },
  server: {
    port: 8708,
    strictPort: true,
  },
  preview: {
    port: 8768,
    strictPort: true,
  },
  base: './'
})
