<script setup>
import { ref, onMounted } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import SearchComponent from './components/SearchComponent.vue';
import ContentLoader from './services/ContentLoader';

const isLoading = ref(true);
const contentCategories = ref([]);

onMounted(() => {
  try {
    contentCategories.value = ContentLoader.loadContent();
    isLoading.value = false;
  } catch (error) {
    console.error('Content Loading Error:', error);
    isLoading.value = false;
  }
});
</script>

<template>
  <div id="app">
    <header>
      <h1>iHelper Resource Library</h1>
      <SearchComponent />
      <nav>
        <RouterLink 
          v-for="category in contentCategories" 
          :key="category.name"
          :to="{ name: 'Category', params: { categoryName: category.name } }"
        >
          {{ category.name }}
        </RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

nav {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
nav a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
nav a:hover {
  background-color: #f0f0f0;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  color: #888;
}
</style>
