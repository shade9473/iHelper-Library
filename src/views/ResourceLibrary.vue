<template>
  <div class="resource-library">
    <h1>Resource Library</h1>
    <div v-if="loading">Loading resources...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="(typeResources, type) in resources" :key="type">
        <h2>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</h2>
        <ul v-if="typeResources && typeResources.length">
          <li v-for="resource in typeResources" :key="resource.id">
            <router-link :to="`/resource/${type}/${resource.id}`">
              {{ resource.title }}
            </router-link>
            <p>{{ resource.excerpt }}</p>
          </li>
        </ul>
        <p v-else>No resources found for {{ type }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'

const resourceStore = useResourceStore()
const resources = ref({})
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    await resourceStore.loadResources()
    resources.value = resourceStore.resources
  } catch (err) {
    console.error('Resource loading error:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.resource-library {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 15px;
}

a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  color: #42b983;
}
</style>
