import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// Explicitly define process if not available
if (typeof process === 'undefined') {
  global.process = {
    env: {},
    argv: [],
    platform: 'browser',
    version: ''
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      'process.env': JSON.stringify({
        ...env,
        NODE_ENV: mode,
        VITE_ENVIRONMENT: env.VITE_ENVIRONMENT || 'development',
        VITE_PERFORMANCE_MODE: env.VITE_PERFORMANCE_MODE || 'standard'
      }),
      // Fallback for specific environment checks
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode !== 'production'
    },
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'iHelper Resource Library',
          short_name: 'iHelper',
          description: 'Comprehensive Resource Library for Entrepreneurs',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}']
        }
      }),
      compression(),
      visualizer({
        filename: './stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      strictPort: true
    },
    preview: {
      port: 8080,
      strictPort: true
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      target: 'esnext',
      commonjsOptions: {
        transformMixedEsModules: true
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: false
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          'process.env': JSON.stringify({}),
          global: 'globalThis'
        }
      },
      exclude: ['globby', 'fast-glob']
    }
  }
})
