<template>
  <div class="home-container">
    <section class="hero bg-blue-600 text-white py-20 text-center">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">Accelerate Your Professional Growth</h1>
        <p class="text-xl mb-10">Curated resources, personalized learning paths, and expert insights</p>
        
        <div class="search-container max-w-2xl mx-auto">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search resources, skills, or career paths..." 
              class="w-full p-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
            <button class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-categories py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-semibold text-center mb-12">Explore Categories</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="category in featuredCategories" 
            :key="category.id"
            class="category-card bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div class="category-icon text-4xl mb-4 text-blue-600">
              {{ category.icon }}
            </div>
            <h3 class="text-xl font-bold mb-4">{{ category.title }}</h3>
            <p class="text-gray-600 mb-6">{{ category.description }}</p>
            <router-link 
              :to="category.link" 
              class="inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
            >
              Explore
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="learning-paths py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-semibold text-center mb-12">Personalized Learning Paths</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="path in learningPaths" 
            :key="path.id"
            class="path-card bg-white rounded-lg shadow-md p-6 text-center"
          >
            <div class="path-icon text-4xl mb-4 text-green-600">
              {{ path.icon }}
            </div>
            <h3 class="text-xl font-bold mb-4">{{ path.title }}</h3>
            <p class="text-gray-600 mb-6">{{ path.description }}</p>
            <router-link 
              :to="path.link" 
              class="inline-block bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
            >
              Start Path
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const featuredCategories = ref([
  {
    id: 1,
    title: 'Professional Development',
    description: 'Enhance your skills and career trajectory',
    icon: '💼',
    link: '/categories/professional-development'
  },
  {
    id: 2,
    title: 'Technology & AI',
    description: 'Stay ahead with cutting-edge tech insights',
    icon: '🚀',
    link: '/categories/technology-ai'
  },
  {
    id: 3,
    title: 'Business Strategies',
    description: 'Strategic thinking for entrepreneurs',
    icon: '📈',
    link: '/categories/business-strategies'
  }
])

const learningPaths = ref([
  {
    id: 1,
    title: 'Entry Level',
    description: 'Kickstart your professional journey',
    icon: '🌱',
    link: '/learning-paths/entry-level'
  },
  {
    id: 2,
    title: 'Mid-Career',
    description: 'Accelerate your career growth',
    icon: '🚀',
    link: '/learning-paths/mid-career'
  },
  {
    id: 3,
    title: 'Leadership',
    description: 'Advanced leadership skills',
    icon: '👑',
    link: '/learning-paths/leadership'
  },
  {
    id: 4,
    title: 'Entrepreneurship',
    description: 'Build and scale your business',
    icon: '💡',
    link: '/learning-paths/entrepreneurship'
  }
])
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
}
</style>
