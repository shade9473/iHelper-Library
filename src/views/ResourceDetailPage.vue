<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
    </div>

    <div v-else-if="resource" class="grid md:grid-cols-3 gap-8">
      <div class="md:col-span-2">
        <article class="prose lg:prose-xl max-w-none">
          <h1 class="text-brand-primary">{{ resource.title }}</h1>
          
          <div class="flex items-center space-x-4 mb-6">
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold"
              :class="{
                'bg-green-100 text-green-800': resource.difficulty === 'beginner',
                'bg-yellow-100 text-yellow-800': resource.difficulty === 'intermediate',
                'bg-red-100 text-red-800': resource.difficulty === 'advanced'
              }"
            >
              {{ resource.difficulty }}
            </span>
            <div class="flex space-x-2">
              <span 
                v-for="tag in resource.tags" 
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-html="renderedContent" class="markdown-content"></div>
        </article>
      </div>

      <aside class="space-y-6">
        <div class="bg-white rounded-lg shadow-card p-6">
          <h3 class="text-xl font-semibold mb-4 text-brand-primary">Resource Details</h3>
          <div class="space-y-2">
            <p><strong>Category:</strong> {{ categoryName }}</p>
            <p><strong>Last Updated:</strong> {{ formattedLastUpdated }}</p>
            <p><strong>Estimated Reading Time:</strong> {{ estimatedReadingTime }} min</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-card p-6">
          <h3 class="text-xl font-semibold mb-4 text-brand-primary">Related Resources</h3>
          <ul class="space-y-3">
            <li 
              v-for="relatedResource in relatedResources" 
              :key="relatedResource.id"
              class="border-b pb-2 last:border-b-0"
            >
              <router-link 
                :to="`/resources/${relatedResource.categoryId}/${relatedResource.id}`"
                class="hover:text-brand-primary transition-colors"
              >
                {{ relatedResource.title }}
              </router-link>
              <span class="text-xs text-gray-500 ml-2">
                {{ relatedResource.difficulty }}
              </span>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <div v-else class="text-center py-12">
      <h2 class="text-2xl text-gray-600">Resource Not Found</h2>
      <p class="text-gray-500 mt-4">The requested resource could not be located.</p>
      <router-link 
        to="/resources" 
        class="mt-6 inline-block bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-secondary transition-colors"
      >
        Back to Resources
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '@/stores/resourceStore'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const resourceStore = useResourceStore()

const resource = ref(null)
const loading = ref(true)
const renderedContent = ref('')

const categoryName = computed(() => {
  const category = resourceStore.categories.find(c => c.id === resource.value?.categoryId)
  return category ? category.name : 'Uncategorized'
})

const formattedLastUpdated = computed(() => {
  return resource.value?.lastUpdated 
    ? new Date(resource.value.lastUpdated).toLocaleDateString() 
    : 'Unknown'
})

const estimatedReadingTime = computed(() => {
  const wordsPerMinute = 200
  const textLength = resource.value?.content?.split(/\s+/).length || 0
  return Math.ceil(textLength / wordsPerMinute)
})

const relatedResources = computed(() => {
  if (!resource.value) return []
  
  return Object.values(resourceStore.resources)
    .filter(r => 
      r.id !== resource.value.id && 
      r.categoryId === resource.value.categoryId
    )
    .slice(0, 5)
})

async function loadResourceContent() {
  try {
    loading.value = true
    const resourcePath = `${route.params.categoryId}/${route.params.resourceId}.md`
    const content = await resourceStore.loadResourceContent(resourcePath)
    
    if (content) {
      resource.value = {
        ...resourceStore.resources[resourcePath],
        content: content.content
      }
      
      // Render markdown with syntax highlighting and sanitization
      const markedContent = marked(content.content, {
        highlight: function(code, lang) {
          const hljs = require('highlight.js')
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        }
      })
      
      renderedContent.value = DOMPurify.sanitize(markedContent)
    }
  } catch (error) {
    console.error('Error loading resource:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await resourceStore.loadResources()
  loadResourceContent()
})
</script>

<style>
.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.markdown-content pre {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.markdown-content code {
  font-family: 'Fira Code', monospace;
}
</style>
