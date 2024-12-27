import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://ihelper-resource-library.pages.dev'

function generateSitemap() {
  const routes = [
    { path: '/', priority: '1.0' },
    { path: '/categories', priority: '0.8' },
    { path: '/resource/guides/startup-basics', priority: '0.7' }
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <priority>${route.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>
`).join('')}
</urlset>`

  fs.writeFileSync(path.resolve('dist/sitemap.xml'), sitemapXml)
  console.log('Sitemap generated successfully!')
}

generateSitemap()
