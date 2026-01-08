// apps/gift/gift-keeper/vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // DEV config (vite dev)
  if (command === 'serve') {
    return {
      server: {
        host: "::",
        port: 8080,
        proxy: {
          '/api': {
            target: backendUrl,
            changeOrigin: true,
            secure: false,
          },
          '/files': {
            target: backendUrl,
            changeOrigin: true,
            secure: false,
          },
          '/private/files': {
            target: backendUrl,
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react(), componentTagger()].filter(Boolean),
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      base: '/' // Dev uses root
    }
  }

  // BUILD config (vite build)
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: '../../gift/public/dist',
      emptyOutDir: true,
      assetsDir: '.',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    },
    base: '/assets/gift/dist/' // Production asset path
  }
});
