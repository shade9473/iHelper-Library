<template>
  <div class="resource-detail">
    <div v-if="loading">Loading resource...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="currentResource" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '../stores/resourceStore'
import { marked } from 'marked'

const route = useRoute()
const resourceStore = useResourceStore()

const loading = ref(true)
const error = ref(null)
const currentResource = ref(null)

const renderedContent = computed(() => {
  if (!currentResource.value) return ''
  return marked.parse(currentResource.value)
})

onMounted(async () => {
  try {
    const { type, id } = route.params
    const resourcePath = `/resources/${type}/${id}.md`
    
    const result = await resourceStore.loadResourceContent(resourcePath)
    currentResource.value = result?.content || ''
  } catch (err) {
    error.value = 'Failed to load resource'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.resource-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
