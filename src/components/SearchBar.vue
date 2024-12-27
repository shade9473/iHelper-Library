<template>
  <div class="search-container">
    <input 
      type="text" 
      placeholder="Search resources..." 
      @input="performSearch"
      class="w-full p-2 border rounded"
    >
    <div v-if="results.length" class="search-results">
      <ResourceCard 
        v-for="result in results" 
        :key="result.id" 
        :resource="result"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Fuse from 'fuse.js'
import ResourceCard from './ResourceCard.vue'

const searchIndex = ref([]) // Populate from your resources
const results = ref([])

const fuse = new Fuse(searchIndex.value, {
  keys: ['title', 'description', 'tags'],
  threshold: 0.3
})

const performSearch = (event) => {
  const query = event.target.value
  results.value = query 
    ? fuse.search(query).map(r => r.item)
    : []
}
</script>

<style scoped>
.search-container {
  @apply max-w-xl mx-auto;
}
.search-results {
  @apply mt-4 space-y-4;
}
</style>
