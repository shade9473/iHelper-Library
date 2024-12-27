import { reactive } from 'vue'

const defaultMetadata = {
  title: 'iHelper Resource Library',
  description: 'A comprehensive knowledge base for entrepreneurs, developers, and lifelong learners',
  image: '/og-image.png',
  url: 'https://ihelper.resources',
  keywords: [
    'learning resources', 
    'startup guides', 
    'technology tutorials', 
    'personal development', 
    'workflow automation'
  ]
}

export const seoManager = reactive({
  metadata: { ...defaultMetadata },

  setMetadata(options = {}) {
    this.metadata = { 
      ...defaultMetadata, 
      ...options 
    }

    // Update document title
    document.title = this.metadata.title

    // Update meta tags
    this.updateMetaTags()
  },

  updateMetaTags() {
    const head = document.head
    const metaTags = [
      { name: 'description', content: this.metadata.description },
      { name: 'keywords', content: this.metadata.keywords.join(', ') },
      
      // Open Graph / Facebook
      { property: 'og:title', content: this.metadata.title },
      { property: 'og:description', content: this.metadata.description },
      { property: 'og:image', content: this.metadata.image },
      { property: 'og:url', content: this.metadata.url },
      { property: 'og:type', content: 'website' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: this.metadata.title },
      { name: 'twitter:description', content: this.metadata.description },
      { name: 'twitter:image', content: this.metadata.image }
    ]

    // Remove existing meta tags
    document.querySelectorAll('meta[name], meta[property]').forEach(tag => tag.remove())

    // Add new meta tags
    metaTags.forEach(tag => {
      const metaTag = document.createElement('meta')
      Object.entries(tag).forEach(([key, value]) => {
        metaTag.setAttribute(key, value)
      })
      head.appendChild(metaTag)
    })
  },

  generateStructuredData(type, data) {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': type
    }

    const structuredData = { ...baseStructure, ...data }
    
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    
    // Remove existing structured data scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove())
    
    document.head.appendChild(script)
  }
})

export function useSeo() {
  return seoManager
}
