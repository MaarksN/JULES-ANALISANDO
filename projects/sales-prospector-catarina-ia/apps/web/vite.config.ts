import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
            },
          },
        ],
      },
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // ⚡ Bolt Optimization: Split heavy charting library into separate chunk
            // Check specific libraries first to avoid shadowing by 'react' check below
            if (id.includes('recharts')) {
              return 'charts';
            }
            // ⚡ Bolt Optimization: Group UI libraries (icons, components, utils)
            if (id.includes('lucide-react') || id.includes('@radix-ui') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui';
            }
            // ⚡ Bolt Optimization: Group core vendor libraries (React, Framer Motion)
            if (id.includes('react') || id.includes('react-dom') || id.includes('framer-motion')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
})
