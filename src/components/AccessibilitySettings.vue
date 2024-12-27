<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div 
      class="bg-white rounded-lg shadow-lg p-4 space-y-4"
      role="dialog" 
      aria-labelledby="accessibility-settings-title"
    >
      <h2 
        id="accessibility-settings-title" 
        class="text-xl font-semibold text-brand-primary"
      >
        Accessibility Settings
      </h2>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label 
            for="high-contrast-toggle" 
            class="text-text-secondary"
          >
            High Contrast Mode
          </label>
          <button 
            id="high-contrast-toggle"
            @click="toggleHighContrast"
            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
            :class="accessibilityState.highContrastMode 
              ? 'bg-brand-primary' 
              : 'bg-gray-300'"
            role="switch"
            :aria-checked="accessibilityState.highContrastMode"
          >
            <span 
              class="inline-block w-4 h-4 transform transition-transform rounded-full"
              :class="accessibilityState.highContrastMode 
                ? 'translate-x-6 bg-white' 
                : 'translate-x-1 bg-white'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <label 
            for="font-size-select" 
            class="text-text-secondary"
          >
            Font Size
          </label>
          <select 
            id="font-size-select"
            v-model="accessibilityState.fontSize"
            @change="updateFontSize"
            class="px-2 py-1 border rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <label 
            for="reduced-motion-toggle" 
            class="text-text-secondary"
          >
            Reduce Motion
          </label>
          <button 
            id="reduced-motion-toggle"
            @click="toggleReducedMotion"
            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
            :class="accessibilityState.reducedMotion 
              ? 'bg-brand-primary' 
              : 'bg-gray-300'"
            role="switch"
            :aria-checked="accessibilityState.reducedMotion"
          >
            <span 
              class="inline-block w-4 h-4 transform transition-transform rounded-full"
              :class="accessibilityState.reducedMotion 
                ? 'translate-x-6 bg-white' 
                : 'translate-x-1 bg-white'"
            />
          </button>
        </div>
      </div>

      <div class="mt-4">
        <p class="text-sm text-text-secondary">
          Accessibility Score: 
          <span 
            class="font-bold"
            :class="{
              'text-green-600': performanceMetrics.accessibilityScore >= 80,
              'text-yellow-600': performanceMetrics.accessibilityScore >= 50 && performanceMetrics.accessibilityScore < 80,
              'text-red-600': performanceMetrics.accessibilityScore < 50
            }"
          >
            {{ performanceMetrics.accessibilityScore }}%
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { accessibilityManager } from '@/plugins/accessibilityEnhancer'

const accessibilityState = computed(() => accessibilityManager.state.value)
const performanceMetrics = computed(() => accessibilityManager.performanceMetrics.value)

function toggleHighContrast() {
  accessibilityManager.toggleHighContrast()
}

function toggleReducedMotion() {
  accessibilityManager.state.value.reducedMotion = 
    !accessibilityManager.state.value.reducedMotion
  accessibilityManager.applyAccessibilityStyles()
}

function updateFontSize() {
  accessibilityManager.applyAccessibilityStyles()
}
</script>

<style scoped>
/* Accessibility-specific styles */
button[role="switch"] {
  transition: background-color 0.3s ease;
}

button[role="switch"] span {
  transition: transform 0.3s ease;
}
</style>
