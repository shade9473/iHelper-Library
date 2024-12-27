<template>
  <div class="categories-page">
    <h1 class="text-2xl font-bold mb-6">Resource Categories</h1>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
      >
        <h2 class="text-lg font-semibold mb-2">{{ category.name }}</h2>
        <p class="text-gray-600">Category ID: {{ category.id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'

const resourceStore = useResourceStore()
const categories = ref(resourceStore.categories)
</script>

<style scoped>
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
