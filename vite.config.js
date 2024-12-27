import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      visualizer({
        filename: './stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 10 KB
        algorithm: 'gzip',
        ext: '.gz'
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'iHelper Resource Library',
          short_name: 'iHelper',
          description: 'A comprehensive learning resource platform',
          theme_color: '#3B82F6',
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
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
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
      sourcemap: mode === 'production' ? false : 'hidden',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    },
    define: {
      'process.env.VITE_ENVIRONMENT': JSON.stringify(env.VITE_ENVIRONMENT || 'development'),
      'process.env.VITE_PERFORMANCE_MODE': JSON.stringify(env.VITE_PERFORMANCE_MODE || 'standard')
    },
    optimizeDeps: {
      exclude: ['globby', 'fast-glob']
    }
  }
})
