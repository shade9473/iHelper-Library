<template>
  <div class="learning-paths-container">
    <section class="hero bg-green-600 text-white py-16 text-center">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">Personalized Learning Paths</h1>
        <p class="text-xl mb-10">Curated journeys to accelerate your professional growth</p>
      </div>
    </section>

    <section class="paths-grid py-16">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="path in learningPaths" 
            :key="path.id"
            class="path-card bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div class="path-icon text-4xl mb-4 text-green-600">
              {{ path.icon }}
            </div>
            <h3 class="text-xl font-bold mb-4">{{ path.title }}</h3>
            <p class="text-gray-600 mb-6">{{ path.description }}</p>
            <div class="path-details">
              <div class="flex justify-between mb-4">
                <span class="text-sm text-gray-500">Duration: {{ path.duration }}</span>
                <span class="text-sm text-gray-500">Difficulty: {{ path.difficulty }}</span>
              </div>
              <button 
                @click="startLearningPath(path)"
                class="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition"
              >
                Start Learning Path
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const learningPaths = ref([
  {
    id: 1,
    title: 'Entry Level Professional',
    description: 'Foundational skills for career beginners',
    icon: '🌱',
    duration: '4-6 weeks',
    difficulty: 'Beginner',
    resources: [
      'Professional Communication',
      'Time Management',
      'Basic Business Skills'
    ]
  },
  {
    id: 2,
    title: 'Mid-Career Growth',
    description: 'Advanced strategies for career acceleration',
    icon: '🚀',
    duration: '8-10 weeks',
    difficulty: 'Intermediate',
    resources: [
      'Leadership Development',
      'Strategic Thinking',
      'Advanced Networking'
    ]
  },
  {
    id: 3,
    title: 'Tech & AI Professional',
    description: 'Cutting-edge technology and AI skills',
    icon: '💻',
    duration: '12 weeks',
    difficulty: 'Advanced',
    resources: [
      'Machine Learning Basics',
      'AI Ethics',
      'Cloud Computing'
    ]
  },
  {
    id: 4,
    title: 'Entrepreneurship Bootcamp',
    description: 'Building and scaling successful businesses',
    icon: '💡',
    duration: '10 weeks',
    difficulty: 'Advanced',
    resources: [
      'Business Model Canvas',
      'Startup Financing',
      'Growth Hacking'
    ]
  }
])

const startLearningPath = (path) => {
  // Future implementation: Track user progress, unlock resources
  console.log(`Starting learning path: ${path.title}`)
  // Potential future routing to a detailed path view
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #48bb78 0%, #2c3e50 100%);
}
</style>
