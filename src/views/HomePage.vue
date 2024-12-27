<template>
  <div class="home-page container mx-auto px-4 py-8">
    <section class="hero text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
        Learn, Grow, Succeed
      </h1>
      <p class="text-text-secondary max-w-2xl mx-auto mb-8">
        Discover a world of curated resources designed to accelerate your personal and professional growth.
      </p>
      <div class="flex justify-center space-x-4">
        <router-link 
          to="/categories" 
          class="btn btn-primary px-6 py-3 rounded-lg"
        >
          Explore Categories
        </router-link>
        <router-link 
          to="/resources" 
          class="btn btn-secondary px-6 py-3 rounded-lg"
        >
          Browse Resources
        </router-link>
      </div>
    </section>

    <section class="featured-categories grid md:grid-cols-3 gap-6 mb-16">
      <div 
        v-for="category in featuredCategories" 
        :key="category.id" 
        class="category-card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <h2 class="text-2xl font-semibold text-brand-primary mb-4">
          {{ category.name }}
        </h2>
        <p class="text-text-secondary mb-4">
          {{ category.description }}
        </p>
        <router-link 
          :to="`/categories/${category.id}`" 
          class="text-brand-blue hover:underline"
        >
          View Resources
        </router-link>
      </div>
    </section>

    <section class="recent-resources">
      <h2 class="text-3xl font-bold text-center mb-8">
        Recently Added Resources
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard 
          v-for="resource in recentResources" 
          :key="resource.id"
          :resource="resource"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'
import ResourceCard from '@/components/ResourceCard.vue'

const resourceStore = useResourceStore()

const featuredCategories = ref([
  {
    id: 'startup-basics',
    name: 'Startup Basics',
    description: 'Essential knowledge for aspiring entrepreneurs'
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Advanced planning and growth techniques'
  },
  {
    id: 'personal-development',
    name: 'Personal Development',
    description: 'Skills and mindsets for success'
  }
])

const recentResources = ref([])

onMounted(async () => {
  try {
    recentResources.value = await resourceStore.getRecentResources(6)
  } catch (error) {
    console.error('Error fetching recent resources:', error)
  }
})
</script>

<style scoped>
.btn {
  @apply transition-colors duration-300 ease-in-out;
}

.btn-primary {
  @apply bg-brand-primary text-white hover:bg-brand-secondary;
}

.btn-secondary {
  @apply bg-gray-200 text-brand-primary hover:bg-gray-300;
}
</style>
