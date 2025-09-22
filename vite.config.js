import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'assets'
  },
  publicDir: '../files',
  server: {
    open: true
  },
  define: {
    global: 'window'
  }
})
