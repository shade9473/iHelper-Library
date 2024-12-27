<template>
  <div id="app">
    <nav>
      <router-link to="/">Resource Library</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
// Any global app logic can go here
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}
</style>
