<template>
  <div class="category-view">
    <h1>{{ categoryName }}</h1>
    <div class="resources-list">
      <div 
        v-for="resource in resources" 
        :key="resource.name" 
        class="resource-item"
        @click="viewResource(resource)"
      >
        {{ resource.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ContentLoader from '../services/ContentLoader';

const props = defineProps({
  categoryName: String
});

const router = useRouter();
const resources = ref([]);

onMounted(() => {
  const allCategories = ContentLoader.loadContent();
  const category = allCategories.find(cat => cat.name === props.categoryName);
  resources.value = category ? category.resources : [];
});

const viewResource = (resource) => {
  router.push({
    name: 'Resource', 
    params: { 
      categoryName: props.categoryName, 
      resourceName: resource.name 
    }
  });
};
</script>

<style scoped>
.resource-item {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ddd;
  margin: 5px 0;
}
.resource-item:hover {
  background-color: #f0f0f0;
}
</style>
