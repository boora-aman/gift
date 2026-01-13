import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gift Management',
        short_name: 'GiftApp',
        description: 'UAE-friendly Gift Management System',
        theme_color: '#006C57',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@services': resolve(__dirname, 'src/services'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@router': resolve(__dirname, 'src/router'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@composables': resolve(__dirname, 'src/composables')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8008',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          scanner: ['html5-qrcode', 'jsqr']
        }
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
