<template>
  <div id="app" class="container mx-auto p-4">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">iHelper Resource Library</h1>
    </header>
    <nav class="mb-4 flex justify-center space-x-4">
      <router-link to="/" class="text-blue-500 hover:text-blue-700">Home</router-link>
      <router-link to="/categories" class="text-blue-500 hover:text-blue-700">Categories</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
// Global app logic can be added here if needed
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
