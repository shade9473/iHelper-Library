<template>
  <div class="resource-card bg-white shadow-md rounded-lg p-4">
    <h3 class="text-lg font-bold text-brand-blue">{{ resource.title }}</h3>
    <p class="text-gray-600 mt-2">{{ resource.description }}</p>
    <div class="tags mt-2 flex space-x-2">
      <span 
        v-for="tag in resource.tags" 
        :key="tag"
        class="px-2 py-1 bg-brand-gray text-white text-xs rounded"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  resource: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.resource-card {
  transition: transform 0.3s ease;
}
.resource-card:hover {
  transform: scale(1.02);
}
</style>
