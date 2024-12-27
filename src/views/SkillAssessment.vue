<template>
  <div class="skill-assessment-container">
    <section class="hero bg-purple-600 text-white py-16 text-center">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-6">Professional Skill Assessment</h1>
        <p class="text-xl mb-10">Discover your strengths and areas for growth</p>
      </div>
    </section>

    <section class="assessment-content py-16">
      <div class="container mx-auto px-4 max-w-3xl">
        <div v-if="!assessmentStarted" class="text-center">
          <h2 class="text-3xl font-semibold mb-8">Take Your Career Assessment</h2>
          <p class="text-gray-600 mb-12">
            Our comprehensive assessment will help you understand your professional skills, 
            identify growth opportunities, and recommend personalized learning resources.
          </p>
          <button 
            @click="startAssessment"
            class="bg-purple-500 text-white px-8 py-3 rounded-full text-xl hover:bg-purple-600 transition"
          >
            Start Assessment
          </button>
        </div>

        <div v-else-if="!assessmentComplete" class="assessment-questions">
          <div class="bg-white shadow-lg rounded-lg p-8">
            <h3 class="text-2xl font-bold mb-6">{{ currentQuestion.text }}</h3>
            <div class="grid gap-4">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                @click="selectAnswer(option)"
                class="w-full text-left p-4 bg-gray-100 rounded-lg hover:bg-purple-100 transition"
              >
                {{ option.text }}
              </button>
            </div>
            <div class="mt-8 flex justify-between items-center">
              <span class="text-gray-600">
                Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
              </span>
              <div class="progress-bar w-1/2 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-purple-500 h-2 rounded-full" 
                  :style="{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="assessment-results">
          <div class="bg-white shadow-lg rounded-lg p-12 text-center">
            <h2 class="text-3xl font-bold mb-6 text-purple-600">Your Skill Profile</h2>
            <div class="grid md:grid-cols-2 gap-8 mb-12">
              <div 
                v-for="(skill, category) in assessmentResults" 
                :key="category"
                class="skill-category bg-gray-100 p-6 rounded-lg"
              >
                <h3 class="text-xl font-semibold mb-4">{{ category }}</h3>
                <div class="skill-meter bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    class="bg-purple-500 h-4 rounded-full" 
                    :style="{ width: `${skill.score}%` }"
                  ></div>
                </div>
                <p class="text-gray-600">{{ skill.description }}</p>
              </div>
            </div>
            <router-link 
              to="/learning-paths"
              class="bg-purple-500 text-white px-8 py-3 rounded-full text-xl hover:bg-purple-600 transition"
            >
              Explore Recommended Learning Paths
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const assessmentStarted = ref(false)
const assessmentComplete = ref(false)
const currentQuestionIndex = ref(0)

const questions = ref([
  {
    text: 'How comfortable are you with strategic planning?',
    category: 'Strategic Thinking',
    options: [
      { text: 'I struggle with long-term planning', score: 20 },
      { text: 'I have some basic strategic skills', score: 50 },
      { text: 'I excel at creating and executing strategies', score: 80 }
    ]
  },
  {
    text: 'Rate your technical problem-solving abilities',
    category: 'Technical Skills',
    options: [
      { text: 'I find technical challenges overwhelming', score: 20 },
      { text: 'I can solve most technical problems with guidance', score: 50 },
      { text: 'I am a confident technical problem solver', score: 80 }
    ]
  },
  {
    text: 'How do you approach team collaboration?',
    category: 'Interpersonal Skills',
    options: [
      { text: 'I prefer working independently', score: 20 },
      { text: 'I can collaborate effectively', score: 50 },
      { text: 'I am a strong team leader and motivator', score: 80 }
    ]
  }
])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const assessmentResults = ref({
  'Strategic Thinking': { score: 0, description: '' },
  'Technical Skills': { score: 0, description: '' },
  'Interpersonal Skills': { score: 0, description: '' }
})

const startAssessment = () => {
  assessmentStarted.value = true
}

const selectAnswer = (selectedOption) => {
  const currentCategory = currentQuestion.value.category
  assessmentResults.value[currentCategory].score = selectedOption.score

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  } else {
    assessmentComplete.value = true
    generateResultDescriptions()
  }
}

const generateResultDescriptions = () => {
  Object.keys(assessmentResults.value).forEach(category => {
    const score = assessmentResults.value[category].score
    let description = ''

    if (score <= 30) {
      description = 'You have significant room for improvement in this area.'
    } else if (score <= 60) {
      description = 'You have a solid foundation but could benefit from targeted learning.'
    } else {
      description = 'You demonstrate strong skills and potential for leadership.'
    }

    assessmentResults.value[category].description = description
  })
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #8b5cf6 0%, #2c3e50 100%);
}
</style>
