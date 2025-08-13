// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// ---------------------------------------------------
// Vite configuration for NEW-RENTAL- (KenRent Manager)
// ---------------------------------------------------
// • React 18 + SWC for fast HMR
// • Aliases "@/..." to "./src"
// • Dev server on http://localhost:8080
// • Optional `base` path for GitHub Pages (commented)
// ---------------------------------------------------

export default defineConfig({
  // Uncomment the next line if you’ll host the **built** site
  // under a sub-folder, e.g. GitHub Pages at /NEW-RENTAL-/
  // base: '/NEW-RENTAL-/',

  server: {
    host: '::',      // listen on all IPv4 & IPv6 interfaces
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5178',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  plugins: [
    react()          // @vitejs/plugin-react-swc
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
