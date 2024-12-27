<script setup>
import { ref, computed, onMounted } from 'vue';
import ContentLoader from '../services/ContentLoader';

// Enhanced Reactive State
const searchQuery = ref('');
const selectedCategory = ref('All');
const selectedDifficulty = ref('All');
const isLoading = ref(false);
const errorMessage = ref('');

// Categories and Difficulties
const categories = computed(() => 
  ['All', ...new Set(ContentLoader.resourceCategories.value.map(cat => cat.name))]
);

const difficulties = ref(['All', 'Beginner', 'Intermediate', 'Advanced']);

// Comprehensive Search Method
const searchResults = computed(() => {
  if (!searchQuery.value && selectedCategory.value === 'All' && selectedDifficulty.value === 'All') {
    return [];
  }

  const searchOptions = {
    category: selectedCategory.value === 'All' ? null : selectedCategory.value,
    difficulty: selectedDifficulty.value === 'All' ? null : selectedDifficulty.value
  };

  return ContentLoader.searchContent(searchQuery.value, searchOptions);
});

// Enhanced Lifecycle Management
onMounted(async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    await ContentLoader.loadDirectoryStructure();
  } catch (error) {
    console.error('Content Loading Error:', error);
    errorMessage.value = 'Unable to load resources. Please try again later.';
  } finally {
    isLoading.value = false;
  }
});

// Interaction Tracking with Enhanced Logging
const selectResource = (resourceId) => {
  try {
    ContentLoader.logContentInteraction(resourceId, 'view');
  } catch (error) {
    console.warn('Interaction Logging Failed:', error);
  }
};

// Search Performance Optimization
const debouncedSearch = (() => {
  let timeoutId;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Potential future optimization hook
    }, 300);
  };
})();
</script>

<template>
  <div class="search-container">
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-spinner">
      <span>Loading resources...</span>
    </div>

    <!-- Error Message Banner -->
    <div v-if="errorMessage" class="error-banner" role="alert">
      <p>{{ errorMessage }}</p>
      <button @click="errorMessage = ''">Dismiss</button>
    </div>

    <div class="search-header" v-if="!isLoading">
      <input 
        v-model="searchQuery" 
        @input="debouncedSearch"
        placeholder="Search resources..."
        class="search-input"
        aria-label="Search resources"
      />
      <select 
        v-model="selectedCategory" 
        class="category-filter"
        aria-label="Filter by category"
      >
        <option 
          v-for="category in categories" 
          :key="category" 
          :value="category"
        >
          {{ category }}
        </option>
      </select>
      <select 
        v-model="selectedDifficulty" 
        class="difficulty-filter"
        aria-label="Filter by difficulty"
      >
        <option 
          v-for="difficulty in difficulties" 
          :key="difficulty" 
          :value="difficulty"
        >
          {{ difficulty }}
        </option>
      </select>
    </div>

    <!-- Enhanced Results Display -->
    <transition-group 
      name="search-results" 
      tag="div" 
      class="search-results"
    >
      <div 
        v-for="result in searchResults" 
        :key="result.id" 
        class="search-result-item"
        @click="selectResource(result.id)"
      >
        <h3>{{ result.title }}</h3>
        <p>{{ result.content }}</p>
        <div class="result-metadata">
          <span class="category-tag">{{ result.category }}</span>
          <span class="difficulty-tag">{{ result.difficulty }}</span>
          <span class="read-time">{{ result.readTime }}</span>
        </div>
      </div>
    </transition-group>

    <!-- No Results State -->
    <div 
      v-if="!isLoading && searchResults.length === 0" 
      class="no-results"
      role="status"
    >
      <p>No resources found matching your search criteria.</p>
      <p>Try adjusting your search or filters.</p>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.category-filter, .difficulty-filter {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.search-results {
  display: grid;
  gap: 15px;
}

.search-result-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.result-metadata {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.8em;
  color: #666;
}

.category-tag, .difficulty-tag {
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #e0e0e0;
}

.read-time {
  color: #888;
  font-size: 0.7em;
}

.no-results {
  text-align: center;
  color: #666;
  padding: 20px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.error-banner {
  background-color: #ffdddd;
  color: #ff0000;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.search-results-enter-active,
.search-results-leave-active {
  transition: all 0.5s ease;
}

.search-results-enter-from,
.search-results-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
