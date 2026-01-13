<template>
  <div
    v-if="isOffline"
    class="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-40 transition-all duration-300"
    :class="{ 'translate-y-0': isOffline, '-translate-y-full': !isOffline }"
  >
    <div class="container-responsive flex items-center justify-center">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium">You are currently offline</span>
        <button
          @click="checkConnection"
          class="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-red-600 rounded px-2 py-1"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useAppStore } from '../../stores/app'

export default {
  name: 'OfflineIndicator',
  setup() {
    const appStore = useAppStore()
    const { isOffline } = storeToRefs(appStore)
    
    const checkConnection = () => {
      // Force a connection check
      appStore.setOfflineStatus(!navigator.onLine)
      
      if (navigator.onLine) {
        appStore.showSuccess('Connection restored!')
      } else {
        appStore.showError('Still offline. Please check your internet connection.')
      }
    }
    
    return {
      isOffline,
      checkConnection
    }
  }
}
</script>

<style scoped>
/* Ensure the offline indicator appears above other content */
.z-40 {
  z-index: 40;
}

/* Smooth slide transition */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none !important;
  }
  
  .animate-pulse {
    animation: none !important;
  }
}
</style>
