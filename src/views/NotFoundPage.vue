<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background-light">
    <div class="text-center max-w-xl mx-auto px-4">
      <div class="mb-8">
        <svg 
          class="mx-auto h-24 w-24 text-brand-primary opacity-75" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      <h1 class="text-4xl font-bold text-text-primary mb-4">
        Page Not Found
      </h1>
      
      <p class="text-text-secondary mb-6">
        Oops! The page you're looking for seems to have wandered off into the digital wilderness. 
        Don't worry, we can help you find your way back.
      </p>
      
      <div class="flex justify-center space-x-4">
        <router-link 
          to="/" 
          class="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
        >
          Return Home
        </router-link>
        
        <router-link 
          to="/resources" 
          class="px-6 py-3 bg-white border border-brand-primary text-brand-primary rounded-lg hover:bg-gray-50 transition-colors"
        >
          Browse Resources
        </router-link>
      </div>
      
      <div class="mt-12 bg-white rounded-lg shadow-card p-6">
        <h2 class="text-xl font-semibold text-brand-primary mb-4">
          Suggested Resources
        </h2>
        
        <div class="grid md:grid-cols-3 gap-4">
          <div 
            v-for="resource in suggestedResources" 
            :key="resource.id" 
            class="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
          >
            <router-link 
              :to="`/resources/${resource.categoryId}/${resource.id}`"
              class="block"
            >
              <h3 class="font-semibold text-text-primary mb-2">
                {{ resource.title }}
              </h3>
              <p class="text-text-secondary text-sm">
                {{ resource.description.slice(0, 100) }}{{ resource.description.length > 100 ? '...' : '' }}
              </p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'

const resourceStore = useResourceStore()
const suggestedResources = ref([])

onMounted(async () => {
  await resourceStore.loadResources()
  
  // Select 3 random resources
  const allResources = Object.values(resourceStore.resources)
  suggestedResources.value = allResources
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
})
</script>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

svg {
  animation: float 3s ease-in-out infinite;
}
</style>
