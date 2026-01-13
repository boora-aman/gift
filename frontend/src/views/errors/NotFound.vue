<template>
  <div class="min-h-screen bg-desert-sand-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-lg w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-charcoal-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon class="w-12 h-12 text-charcoal-600" />
        </div>
      </div>

      <!-- Error Content -->
      <div class="space-y-6">
        <div>
          <h1 class="text-6xl font-bold text-charcoal-900 mb-2">404</h1>
          <h2 class="text-2xl font-semibold text-charcoal-900 mb-4">Page Not Found</h2>
          <p class="text-charcoal-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goBack"
            class="inline-flex items-center justify-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <router-link
            to="/"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            <HomeIcon class="w-5 h-5 mr-2" />
            Go Home
          </router-link>
        </div>

        <!-- Helpful Links -->
        <div class="pt-8 border-t border-charcoal-200">
          <p class="text-sm text-charcoal-600 mb-4">
            Looking for something specific? Try these links:
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <router-link
              to="/gifts"
              class="text-gray-700 hover:text-gray-800 font-medium"
            >
              Browse Gifts
            </router-link>
            
            <router-link
              to="/issues"
              class="text-gray-700 hover:text-gray-800 font-medium"
            >
              View Dispatches
            </router-link>
            
            <router-link
              to="/profile"
              class="text-gray-700 hover:text-gray-800 font-medium"
            >
              My Profile
            </router-link>
            
            <a
              href="mailto:support@example.com"
              class="text-gray-700 hover:text-gray-800 font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

// Icons
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'NotFound',
  components: {
    ExclamationTriangleIcon,
    ArrowLeftIcon,
    HomeIcon
  },
  setup() {
    const router = useRouter()

    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
button:focus,
a:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  h1 {
    font-size: 4rem;
  }
  
  h2 {
    font-size: 1.5rem;
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

/* Print styles */
@media print {
  .min-h-screen {
    min-height: auto;
  }
  
  button,
  a {
    color: #374151 !important;
    text-decoration: underline;
  }
}
</style>
