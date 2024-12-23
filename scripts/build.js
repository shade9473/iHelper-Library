const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration
const CONFIG = {
    sourceDir: path.join(__dirname, '..'),
    outputDir: path.join(__dirname, '../dist'),
    contentDirs: Array.from({length: 45}, (_, i) => String(i + 1).padStart(2, '0')),
    excludeDirs: ['node_modules', '.git', 'scripts']
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Build functions
function generateSitemap() {
    const urls = [];
    function crawl(dir) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!CONFIG.excludeDirs.includes(item)) {
                    crawl(fullPath);
                }
            } else if (item.endsWith('.md')) {
                urls.push(fullPath.replace(CONFIG.sourceDir, '').replace(/\\/g, '/'));
            }
        });
    }
    crawl(CONFIG.sourceDir);
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
    <url>
        <loc>https://your-domain.com${url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`).join('')}
</urlset>`;

    fs.writeFileSync(path.join(CONFIG.outputDir, 'sitemap.xml'), sitemap);
}

function processMarkdown(content) {
    return marked.parse(content, {
        gfm: true,
        breaks: true,
        headerIds: true
    });
}

function buildContent() {
    CONFIG.contentDirs.forEach(dir => {
        const sourcePath = path.join(CONFIG.sourceDir, dir);
        const outputPath = path.join(CONFIG.outputDir, dir);
        
        if (fs.existsSync(sourcePath)) {
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }
            
            const files = fs.readdirSync(sourcePath);
            files.forEach(file => {
                if (file.endsWith('.md')) {
                    const content = fs.readFileSync(path.join(sourcePath, file), 'utf8');
                    const html = processMarkdown(content);
                    fs.writeFileSync(
                        path.join(outputPath, file.replace('.md', '.html')),
                        html
                    );
                }
            });
        }
    });
}

// Main build process
console.log('🚀 Starting build process...');

try {
    console.log('📝 Processing markdown content...');
    buildContent();
    
    console.log('🗺️ Generating sitemap...');
    generateSitemap();
    
    console.log('✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
