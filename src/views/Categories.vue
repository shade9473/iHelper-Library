<template>
  <div class="categories-container">
    <section class="hero bg-blue-600 text-white py-16 text-center">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">Resource Categories</h1>
        <p class="text-xl mb-10">Discover curated resources tailored to your professional journey</p>
        
        <div class="search-container max-w-2xl mx-auto">
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery"
              @input="filterCategories"
              placeholder="Search categories..." 
              class="w-full p-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
          </div>
        </div>
      </div>
    </section>

    <section class="category-grid py-16">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="category in filteredCategories" 
            :key="category.id"
            class="category-card bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div class="category-icon text-4xl mb-4 text-blue-600">
              {{ category.icon }}
            </div>
            <h3 class="text-xl font-bold mb-4">{{ category.title }}</h3>
            <p class="text-gray-600 mb-6">{{ category.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">
                {{ category.resourceCount }} Resources
              </span>
              <router-link 
                :to="category.link" 
                class="inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
              >
                View Resources
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const categories = ref([
  {
    id: 1,
    title: 'Professional Development',
    description: 'Enhance your skills and career trajectory',
    icon: '💼',
    link: '/category/professional-development',
    resourceCount: 42
  },
  {
    id: 2,
    title: 'Technology & AI',
    description: 'Stay ahead with cutting-edge tech insights',
    icon: '🚀',
    link: '/category/technology-ai',
    resourceCount: 35
  },
  {
    id: 3,
    title: 'Business Strategies',
    description: 'Strategic thinking for entrepreneurs',
    icon: '📈',
    link: '/category/business-strategies',
    resourceCount: 28
  },
  {
    id: 4,
    title: 'Marketing & Sales',
    description: 'Advanced marketing techniques and sales strategies',
    icon: '📣',
    link: '/category/marketing-sales',
    resourceCount: 22
  },
  {
    id: 5,
    title: 'Personal Growth',
    description: 'Mental health, productivity, and self-improvement',
    icon: '🌱',
    link: '/category/personal-growth',
    resourceCount: 18
  },
  {
    id: 6,
    title: 'Entrepreneurship',
    description: 'Building and scaling successful businesses',
    icon: '💡',
    link: '/category/entrepreneurship',
    resourceCount: 15
  }
])

const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filterCategories = () => {
  // Additional filtering logic can be added here if needed
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
}
</style>
