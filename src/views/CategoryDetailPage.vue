<template>
  <div class="category-detail-page container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center">
      <p>Loading category details...</p>
    </div>
    
    <div v-else-if="category" class="space-y-6">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-brand-primary mb-4">
          {{ category.name }}
        </h1>
        <p class="text-text-secondary">
          {{ category.description }}
        </p>
      </header>

      <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard 
          v-for="resource in categoryResources" 
          :key="resource.id"
          :resource="resource"
        />
      </section>

      <section v-if="categoryResources.length === 0" class="text-center">
        <p class="text-text-secondary">
          No resources found in this category.
        </p>
      </section>
    </div>

    <div v-else class="text-center">
      <p class="text-red-500">Category not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '@/stores/resourceStore'
import ResourceCard from '@/components/ResourceCard.vue'
import { seoManager } from '@/plugins/seo'

const route = useRoute()
const resourceStore = useResourceStore()

const loading = ref(true)
const category = ref(null)
const categoryResources = ref([])

onMounted(async () => {
  try {
    const categoryId = route.params.categoryId
    category.value = await resourceStore.getCategoryById(categoryId)
    
    if (category.value) {
      categoryResources.value = await resourceStore.getResourcesByCategory(categoryId)
      
      // Update SEO metadata
      seoManager.setMetadata({
        title: `${category.value.name} Resources - iHelper Library`,
        description: category.value.description,
        keywords: [
          category.value.name,
          'learning resources',
          'category details'
        ]
      })
    }
  } catch (error) {
    console.error('Error loading category details:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.category-detail-page {
  @apply min-h-screen;
}
</style>
