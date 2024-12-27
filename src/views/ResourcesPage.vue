<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-brand-primary">Resource Library</h1>
      <div class="flex items-center space-x-4">
        <input 
          v-model="searchQuery" 
          @input="performSearch"
          placeholder="Search resources..." 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button 
          @click="toggleFilters" 
          class="bg-brand-secondary text-white px-4 py-2 rounded-lg hover:bg-brand-primary transition-colors"
        >
          Filters
        </button>
      </div>
    </div>

    <div v-if="showFilters" class="mb-6 grid md:grid-cols-3 gap-4">
      <select 
        v-model="categoryFilter" 
        @change="applyFilters"
        class="px-4 py-2 border rounded-lg"
      >
        <option value="">All Categories</option>
        <option 
          v-for="category in categories" 
          :key="category.id" 
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <select 
        v-model="difficultyFilter" 
        @change="applyFilters"
        class="px-4 py-2 border rounded-lg"
      >
        <option value="">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="tag in availableTags" 
          :key="tag"
          @click="toggleTag(tag)"
          class="px-3 py-1 rounded-full text-sm cursor-pointer"
          :class="selectedTags.includes(tag) 
            ? 'bg-brand-primary text-white' 
            : 'bg-gray-200 text-gray-700'"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div 
      v-if="loading" 
      class="flex justify-center items-center h-64"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
    </div>

    <div 
      v-else-if="displayedResources.length === 0" 
      class="text-center text-gray-500 py-12"
    >
      No resources found. Try adjusting your search or filters.
    </div>

    <div 
      v-else 
      class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div 
        v-for="resource in displayedResources" 
        :key="resource.id"
        class="bg-white rounded-lg shadow-card p-6 hover:shadow-hover transition-all"
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-text-primary">
            {{ resource.title }}
          </h2>
          <span 
            class="px-2 py-1 rounded-full text-xs font-bold"
            :class="{
              'bg-green-100 text-green-800': resource.difficulty === 'beginner',
              'bg-yellow-100 text-yellow-800': resource.difficulty === 'intermediate',
              'bg-red-100 text-red-800': resource.difficulty === 'advanced'
            }"
          >
            {{ resource.difficulty }}
          </span>
        </div>
        <p class="text-text-secondary mb-4">
          {{ resource.description }}
        </p>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <span 
              v-for="tag in resource.tags" 
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {{ tag }}
            </span>
          </div>
          <router-link 
            :to="`/resources/${resource.categoryId}/${resource.id}`"
            class="text-brand-primary hover:underline"
          >
            Read More
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'

const resourceStore = useResourceStore()

// State
const searchQuery = ref('')
const showFilters = ref(false)
const categoryFilter = ref('')
const difficultyFilter = ref('')
const selectedTags = ref([])
const loading = ref(false)

// Computed Properties
const categories = computed(() => resourceStore.categories)
const availableTags = computed(() => {
  const allTags = new Set()
  Object.values(resourceStore.resources).forEach(resource => {
    resource.tags.forEach(tag => allTags.add(tag))
  })
  return Array.from(allTags)
})

const displayedResources = computed(() => {
  let resources = Object.values(resourceStore.resources)

  if (searchQuery.value) {
    resources = resources.filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  if (categoryFilter.value) {
    resources = resources.filter(resource => resource.categoryId === categoryFilter.value)
  }

  if (difficultyFilter.value) {
    resources = resources.filter(resource => resource.difficulty === difficultyFilter.value)
  }

  if (selectedTags.value.length > 0) {
    resources = resources.filter(resource => 
      selectedTags.value.every(tag => resource.tags.includes(tag))
    )
  }

  return resources
})

// Methods
function performSearch() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function applyFilters() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  await resourceStore.loadResources()
  loading.value = false
})
</script>
