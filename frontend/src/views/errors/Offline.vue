<template>
  <div class="min-h-screen bg-desert-sand-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-lg w-full text-center">
      <!-- Offline Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-charcoal-100 rounded-full flex items-center justify-center">
          <WifiIcon class="w-12 h-12 text-charcoal-600" />
        </div>
      </div>

      <!-- Offline Content -->
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-charcoal-900 mb-4">You're Offline</h1>
          <p class="text-charcoal-600 leading-relaxed mb-6">
            It looks like you're not connected to the internet. 
            Please check your connection and try again.
          </p>

          <!-- Connection Status -->
          <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            No Internet Connection
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="retryConnection"
            :disabled="checking"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon class="w-5 h-5 mr-2" :class="{ 'animate-spin': checking }" />
            {{ checking ? 'Checking...' : 'Try Again' }}
          </button>
          
          <button
            @click="goBack"
            class="inline-flex items-center justify-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        <!-- Offline Features -->
        <div class="pt-8 border-t border-charcoal-200">
          <h3 class="text-lg font-medium text-charcoal-900 mb-4">
            What you can do offline:
          </h3>
          
          <div class="grid grid-cols-1 gap-3 text-sm text-charcoal-600">
            <div class="flex items-center">
              <CheckIcon class="w-4 h-4 text-gray-600 mr-2" />
              <span>View previously loaded pages</span>
            </div>
            
            <div class="flex items-center">
              <CheckIcon class="w-4 h-4 text-gray-600 mr-2" />
              <span>Access cached gift information</span>
            </div>
            
            <div class="flex items-center">
              <XMarkIcon class="w-4 h-4 text-red-500 mr-2" />
              <span>Create new gifts or dispatches</span>
            </div>
            
            <div class="flex items-center">
              <XMarkIcon class="w-4 h-4 text-red-500 mr-2" />
              <span>Send notifications</span>
            </div>
          </div>
        </div>

        <!-- Troubleshooting Tips -->
        <div class="pt-6 border-t border-charcoal-200 text-left">
          <h4 class="text-base font-medium text-charcoal-900 mb-3">
            Troubleshooting Tips:
          </h4>
          
          <ul class="text-sm text-charcoal-600 space-y-2 list-disc list-inside">
            <li>Check your Wi-Fi or mobile data connection</li>
            <li>Try turning airplane mode on and off</li>
            <li>Restart your router if using Wi-Fi</li>
            <li>Contact your internet service provider if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'

// Icons
import {
  WifiIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Offline',
  components: {
    WifiIcon,
    ArrowPathIcon,
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon
  },
  setup() {
    const router = useRouter()
    const { showNotification } = useNotifications()
    
    const checking = ref(false)

    const retryConnection = async () => {
      checking.value = true
      
      try {
        // Attempt to fetch a small resource to test connection
        const response = await fetch('/api/health-check', {
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        if (response.ok) {
          showNotification('Connection restored!', 'success')
          // Reload the current page or redirect to home
          window.location.reload()
        } else {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Connection check failed:', error)
        showNotification('Still offline. Please check your connection.', 'error')
      } finally {
        checking.value = false
      }
    }

    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }

    return {
      checking,
      retryConnection,
      goBack
    }
  }
}
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Connection status indicator */
@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.bg-red-500 {
  animation: pulse-dot 2s infinite;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  h1 {
    font-size: 1.875rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-charcoal-100 {
    border: 2px solid #374151;
  }
  
  .border-charcoal-200,
  .border-charcoal-300 {
    border-width: 2px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .bg-red-500 {
    animation: none !important;
  }
  
  .transition-colors {
    transition: none !important;
  }
}

/* Print styles */
@media print {
  .min-h-screen {
    min-height: auto;
  }
  
  button {
    color: #374151 !important;
    background: transparent !important;
    border: 1px solid #374151 !important;
  }
}
</style>
