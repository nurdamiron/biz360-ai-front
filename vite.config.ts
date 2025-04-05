import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Biz360 CRM ИИ-Ассистент',
        short_name: 'Biz360 CRM',
        description: 'ИИ-Ассистент для разработки Biz360 CRM',
        theme_color: '#0085FF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ],
        shortcuts: [
          {
            name: 'Задачи',
            short_name: 'Задачи',
            description: 'Управление задачами',
            url: '/tasks',
            icons: [{ src: 'task-icon.png', sizes: '192x192' }]
          },
          {
            name: 'Проекты',
            short_name: 'Проекты',
            description: 'Управление проектами',
            url: '/projects',
            icons: [{ src: 'project-icon.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '1280x720',
            type: 'image/png',
            label: 'Дашборд Biz360 CRM'
          },
          {
            src: 'screenshot2.png',
            sizes: '1280x720',
            type: 'image/png',
            label: 'Управление задачами'
          }
        ],
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://biz360crm.app/manifest.json'
          }
        ],
        prefer_related_applications: false,
        // Настройки обработки жестов
        handle_links: 'preferred'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.biz360crm\.app\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 часа
              },
              networkTimeoutSeconds: 10 // Таймаут сети
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
              }
            }
          }
        ],
        // Предварительное кеширование основных маршрутов
        navigateFallback: '/index.html'
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['redux', '@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom']
        }
      }
    }
  }
});