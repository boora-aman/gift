<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-elevated max-w-md w-full">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-charcoal-800">Update Available</h3>
            <p class="text-sm text-charcoal-600">A new version of the app is ready to install.</p>
          </div>
        </div>
        
        <p class="text-sm text-charcoal-600 mb-6">
          We've made improvements to enhance your experience. Would you like to update now?
        </p>
        
        <div class="flex space-x-3">
          <button
            @click="$emit('update')"
            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Update Now
          </button>
          <button
            @click="$emit('dismiss')"
            class="flex-1 bg-charcoal-100 text-charcoal-700 px-4 py-2 rounded-lg hover:bg-charcoal-200 transition-colors duration-200 font-medium"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdatePrompt',
  emits: ['update', 'dismiss']
}
</script>

<style scoped>
/* Backdrop blur effect */
.bg-opacity-50 {
  backdrop-filter: blur(4px);
}

/* Focus styles */
button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-colors {
    transition: none !important;
  }
}
</style>
