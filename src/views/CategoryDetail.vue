<template>
  <div class="category-detail-container">
    <section class="hero bg-blue-600 text-white py-16 text-center">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">{{ category.title }}</h1>
        <p class="text-xl mb-10">{{ category.description }}</p>
      </div>
    </section>

    <section class="resources-grid py-16">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <div class="search-container w-1/2">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search resources..." 
              class="w-full p-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
          </div>
          <div class="filter-container">
            <select 
              v-model="selectedSortOption"
              class="p-3 rounded-full text-gray-800"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="resource in filteredAndSortedResources" 
            :key="resource.id"
            class="resource-card bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div class="resource-icon text-4xl mb-4 text-blue-600">
              {{ resource.icon }}
            </div>
            <h3 class="text-xl font-bold mb-4">{{ resource.title }}</h3>
            <p class="text-gray-600 mb-6">{{ resource.description }}</p>
            <div class="resource-meta flex justify-between items-center">
              <span class="text-sm text-gray-500">
                {{ resource.type }} • {{ resource.duration }}
              </span>
              <button 
                @click="viewResourceDetails(resource)"
                class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const searchQuery = ref('')
const selectedSortOption = ref('newest')

const category = ref({
  id: route.params.id,
  title: 'Professional Development',
  description: 'Enhance your skills and career trajectory',
  icon: '💼'
})

const resources = ref([
  {
    id: 1,
    title: 'Effective Communication Skills',
    description: 'Master the art of professional communication',
    type: 'Course',
    duration: '4 weeks',
    icon: '💬',
    popularity: 95,
    rating: 4.8
  },
  {
    id: 2,
    title: 'Time Management Mastery',
    description: 'Boost productivity and achieve more',
    type: 'Workshop',
    duration: '2 weeks',
    icon: '⏰',
    popularity: 88,
    rating: 4.6
  },
  {
    id: 3,
    title: 'Leadership Fundamentals',
    description: 'Develop essential leadership skills',
    type: 'Online Program',
    duration: '6 weeks',
    icon: '👑',
    popularity: 92,
    rating: 4.7
  }
])

const filteredAndSortedResources = computed(() => {
  let filtered = resources.value.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  switch(selectedSortOption.value) {
    case 'popular':
      return filtered.sort((a, b) => b.popularity - a.popularity)
    case 'rating':
      return filtered.sort((a, b) => b.rating - a.rating)
    default:
      return filtered
  }
})

const viewResourceDetails = (resource) => {
  // Future implementation: Navigate to resource details page
  console.log(`Viewing resource: ${resource.title}`)
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
}
</style>
