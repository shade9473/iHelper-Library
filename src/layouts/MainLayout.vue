<template>
  <div class="min-h-screen bg-background-light flex flex-col">
    <header class="bg-white shadow-md">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <router-link 
          to="/" 
          class="text-2xl font-bold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          iHelper Resource Library
        </router-link>
        
        <div class="flex items-center space-x-4">
          <div class="w-96">
            <GlobalSearch />
          </div>
          
          <nav class="space-x-4">
            <router-link 
              to="/categories" 
              class="text-text-secondary hover:text-brand-primary transition-colors"
            >
              Categories
            </router-link>
            <router-link 
              to="/resources" 
              class="text-text-secondary hover:text-brand-primary transition-colors"
            >
              Resources
            </router-link>
          </nav>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8 flex-grow">
      <router-view v-slot="{ Component }">
        <transition 
          name="fade" 
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-white py-6 border-t">
      <div class="container mx-auto px-4 text-center text-text-secondary">
        2024 iHelper Resource Library. All rights reserved.
      </div>
    </footer>

    <AccessibilitySettings />
  </div>
</template>

<script setup>
import GlobalSearch from '@/components/GlobalSearch.vue'
import AccessibilitySettings from '@/components/AccessibilitySettings.vue'
// Layout logic can be added here if needed
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
