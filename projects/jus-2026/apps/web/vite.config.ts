import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/jusartificial/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
          react(),
          VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: "JusArtificial",
                short_name: "JusAI",
                theme_color: "#10b981",
                icons: [{ src: "/vite.svg", sizes: "512x512", type: "image/svg+xml" }]
            }
          })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
