<template>
  <div class="fixed inset-0 z-50 bg-charcoal-900/80 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl p-8 mx-4 text-center max-w-md w-full animate-scale-in">
      <!-- Success Icon -->
      <div class="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon class="w-10 h-10 text-gray-700" />
      </div>
      
      <!-- Success Message -->
      <h3 class="text-xl font-semibold text-charcoal-900 mb-3">
        Gift Issued Successfully!
      </h3>
      
      <p class="text-charcoal-600 mb-8">
        The gift has been successfully issued and recorded in the system.
      </p>
      
      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="$emit('issue-another')"
          class="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Issue Another Gift
        </button>
        
        <button
          @click="$emit('close')"
          class="w-full px-6 py-3 border border-charcoal-300 text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'GiftIssueSuccessModal',
  components: {
    CheckCircleIcon
  },
  emits: ['close', 'issue-another']
}
</script>

<style scoped>
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

/* Prevent body scroll when modal is open */
body:has(.fixed) {
  overflow: hidden;
}
</style>
