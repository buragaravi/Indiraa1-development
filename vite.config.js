import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      manifestFilename: 'manifest.webmanifest',
      manifest: false, // Use external manifest file
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:5001\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Reduce console warnings about Vary headers
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
        skipWaiting: true,
        clientsClaim: true
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        swSrc: 'src/sw.js',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limit instead of default 2MB
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
