<template>
  <div class="relative">
    <div class="flex items-center">
      <input 
        ref="searchInput"
        v-model="searchQuery"
        @input="performSearch"
        @keydown.esc="closeSearch"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.enter="selectCurrentResult"
        type="text"
        placeholder="Search resources..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      <button 
        @click="toggleAdvancedSearch"
        class="ml-2 p-2 text-gray-600 hover:text-brand-primary"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
          />
        </svg>
      </button>
    </div>

    <!-- Advanced Search Filters -->
    <div 
      v-if="showAdvancedSearch" 
      class="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg p-4"
    >
      <div class="grid grid-cols-3 gap-4">
        <select 
          v-model="categoryFilter" 
          class="px-3 py-2 border rounded"
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
          class="px-3 py-2 border rounded"
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
            class="px-2 py-1 rounded-full text-xs cursor-pointer"
            :class="selectedTags.includes(tag) 
              ? 'bg-brand-primary text-white' 
              : 'bg-gray-200 text-gray-700'"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div 
      v-if="searchResults.length > 0" 
      class="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto"
    >
      <div 
        v-for="(result, index) in searchResults" 
        :key="result.id"
        @click="selectResult(result)"
        class="px-4 py-3 hover:bg-gray-100 cursor-pointer"
        :class="{ 'bg-gray-100': index === currentResultIndex }"
      >
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-text-primary">
              {{ result.title }}
            </h3>
            <p class="text-text-secondary text-sm">
              {{ result.description.slice(0, 100) }}{{ result.description.length > 100 ? '...' : '' }}
            </p>
          </div>
          <span 
            class="px-2 py-1 rounded-full text-xs font-bold"
            :class="{
              'bg-green-100 text-green-800': result.difficulty === 'beginner',
              'bg-yellow-100 text-yellow-800': result.difficulty === 'intermediate',
              'bg-red-100 text-red-800': result.difficulty === 'advanced'
            }"
          >
            {{ result.difficulty }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResourceStore } from '@/stores/resourceStore'

const router = useRouter()
const resourceStore = useResourceStore()

// Search state
const searchQuery = ref('')
const searchResults = ref([])
const currentResultIndex = ref(-1)
const showAdvancedSearch = ref(false)

// Filters
const categoryFilter = ref('')
const difficultyFilter = ref('')
const selectedTags = ref([])

// Computed properties
const categories = computed(() => resourceStore.categories)
const availableTags = computed(() => {
  const allTags = new Set()
  Object.values(resourceStore.resources).forEach(resource => {
    resource.tags.forEach(tag => allTags.add(tag))
  })
  return Array.from(allTags)
})

// Search methods
function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  let results = Object.values(resourceStore.resources)

  // Text search
  results = results.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )

  // Apply additional filters
  if (categoryFilter.value) {
    results = results.filter(resource => resource.categoryId === categoryFilter.value)
  }

  if (difficultyFilter.value) {
    results = results.filter(resource => resource.difficulty === difficultyFilter.value)
  }

  if (selectedTags.value.length > 0) {
    results = results.filter(resource => 
      selectedTags.value.every(tag => resource.tags.includes(tag))
    )
  }

  searchResults.value = results.slice(0, 10)
  currentResultIndex.value = -1
}

function selectResult(result) {
  router.push(`/resources/${result.categoryId}/${result.id}`)
  closeSearch()
}

function selectCurrentResult() {
  if (currentResultIndex.value >= 0 && searchResults.value.length > 0) {
    selectResult(searchResults.value[currentResultIndex.value])
  }
}

function navigateResults(direction) {
  if (searchResults.value.length === 0) return

  currentResultIndex.value += direction
  
  // Wrap around
  if (currentResultIndex.value < 0) {
    currentResultIndex.value = searchResults.value.length - 1
  } else if (currentResultIndex.value >= searchResults.value.length) {
    currentResultIndex.value = 0
  }
}

function toggleAdvancedSearch() {
  showAdvancedSearch.value = !showAdvancedSearch.value
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  performSearch()
}

function closeSearch() {
  searchQuery.value = ''
  searchResults.value = []
  showAdvancedSearch.value = false
}

// Keyboard event handler
function handleKeydown(event) {
  // Ctrl/Cmd + K to focus search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value.focus()
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Custom scrollbar for search results */
.max-h-96 {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.2) transparent;
}

.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}
</style>
