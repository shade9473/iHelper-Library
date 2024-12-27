<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-brand-primary mb-6">Resource Categories</h1>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="bg-white rounded-lg shadow-card p-6 hover:shadow-hover transition-all"
      >
        <h2 class="text-xl font-semibold text-text-primary mb-4">
          {{ category.name }}
        </h2>
        <p class="text-text-secondary mb-4">
          {{ category.description }}
        </p>
        <router-link 
          :to="`/categories/${category.id}`" 
          class="inline-block px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary transition-colors"
        >
          Explore Category
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    id: 'startup-basics',
    name: 'Startup Basics',
    description: 'Essential guides and resources for entrepreneurs'
  },
  {
    id: 'vue-tutorials',
    name: 'Vue.js Tutorials',
    description: 'Learn Vue.js from beginner to advanced levels'
  },
  {
    id: 'marketing',
    name: 'Digital Marketing',
    description: 'Strategies and tools for online marketing success'
  }
])
</script>
