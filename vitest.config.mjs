import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '~': resolve(process.cwd(), 'node_modules')
    },
    extensions: ['.js', '.json', '.vue']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: process.cwd(),
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage'
    },
    setupFiles: [
      'src/tests/setup.js'
    ],
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.[jt]sx?$/]
    },
    server: {
      deps: {
        fallbackCJS: true,
        inline: [
          /vue/,
          /vitest/,
          /fuse\.js/
        ]
      }
    }
  }
});
