import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'
import frappeui from 'frappe-ui/vite'


export default defineConfig({
  plugins: [
    frappeui({
      jinjaBootData: true,
      buildConfig: {
        indexHtmlPath: '../gift/www/gift.html',
      },
    }),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gift Management',
        short_name: 'GiftApp',
        description: 'UAE-friendly Gift Management System',
        theme_color: '#006C57',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/gift',
        icons: [
          {
            src: '/assets/gift/manifest/gift-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/gift/manifest/gift-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/assets/gift/manifest/gift-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/gift/manifest/gift-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@composables': path.resolve(__dirname, 'src/composables'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  build: {
    outDir: '../gift/public/frontend',
    emptyOutDir: true,
    target: 'es2015',
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: getProxyOptions(),
  }
})

function getProxyOptions() {
  const config = getCommonSiteConfig()
  const webserver_port = config ? config.webserver_port : 8000
//   if (!config) {
//     console.log('No common_site_config.json found, using default port 8000')
//   }
  return {
    '^/(app|login|api|assets|files|private)': {
      target: `http://127.0.0.1:${webserver_port}`,
      ws: true,
      router: function (req) {
        const site_name = req.headers.host.split(':')[0]
        // console.log(`Proxying ${req.url} to ${site_name}:${webserver_port}`)
        return `http://${site_name}:${webserver_port}`
      },
    },
  }
}

function getCommonSiteConfig() {
  let currentDir = path.resolve('.')
  // traverse up till we find frappe-bench with sites directory
  while (currentDir !== '/') {
    if (
      fs.existsSync(path.join(currentDir, 'sites')) &&
      fs.existsSync(path.join(currentDir, 'apps'))
    ) {
      let configPath = path.join(currentDir, 'sites', 'common_site_config.json')
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath))
      }
      return null
    }
    currentDir = path.resolve(currentDir, '..')
  }
  return null
}
