import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    root: 'src',
    base: '/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html')
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        },
        target: 'esnext'
    },
    server: {
        port: 3000,
        open: true,
        strictPort: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '~': resolve(__dirname, 'node_modules')
        },
        extensions: ['.js', '.json', '.vue']
    },
    optimizeDeps: {
        include: ['fuse.js', 'marked', 'vue', 'vue-router', 'pinia'],
        force: true
    },
    plugins: [
        vue()
    ]
});
