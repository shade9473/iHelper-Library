<template>
  <div class="resource-view">
    <h1>{{ resourceName }}</h1>
    <div class="resource-content">
      {{ content }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ContentLoader from '../services/ContentLoader';

const props = defineProps({
  categoryName: String,
  resourceName: String
});

const content = ref('');

onMounted(() => {
  const resourcePath = `/content/${props.categoryName}/${props.resourceName}`;
  content.value = ContentLoader.getResourceContent(resourcePath);
});
</script>

<style scoped>
.resource-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.resource-content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
</style>
