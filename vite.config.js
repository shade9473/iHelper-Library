import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                onlineCourses: resolve(__dirname, '13_Online_Courses/index.html'),
                ebookSummaries: resolve(__dirname, '14_Ebook_Summaries/index.html'),
                professionalTemplates: resolve(__dirname, '15_Professional_Templates/index.html')
            }
        }
    },
    server: {
        port: 3000,
        open: true
    },
    plugins: []
});
