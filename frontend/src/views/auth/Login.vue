<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-elevated w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="px-8 pt-8 pb-6 text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
          <img 
            src="/images/image.png" 
            alt="Gift Manager Logo" 
            class="w-full h-full object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-charcoal-800 font-display">Gift Management</h1>
       
      </div>
      
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="px-8 pb-8">
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <ExclamationTriangleIcon class="w-5 h-5 text-red-500 flex-shrink-0" />
          <span class="text-sm text-red-700">{{ errorMessage }}</span>
        </div>
        
        <!-- Email/Mobile Field -->
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-charcoal-700 mb-2">
            Email or Mobile Number
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            class="input w-full"
            placeholder=""
            :disabled="isLoading"
            autocomplete="username"
          >
        </div>
        
        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-charcoal-700 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input w-full pr-12"
              placeholder="Enter your password"
              :disabled="isLoading"
              autocomplete="current-password"
            >
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-charcoal-400 hover:text-charcoal-600"
              :disabled="isLoading"
            >
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
        

        
        <!-- Login Button -->
        <button
          type="submit"
          :disabled="isLoading || !formData.username || !formData.password"
          class="btn btn-primary w-full h-12 text-base font-semibold"
        >
          <div v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
          <span v-else>Sign In</span>
        </button>
        
        <!-- Offline Notice -->
        <div
          v-if="isOffline"
          class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2"
        >
          <svg class="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-yellow-700">You're offline. Please check your connection.</span>
        </div>
      </form>
    </div>
    
    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showForgotPassword = false"
    >
      <div class="bg-white rounded-xl shadow-elevated max-w-sm w-full p-6">
        <h3 class="text-lg font-semibold text-charcoal-800 mb-4">Reset Password</h3>
        
        <form @submit.prevent="handleForgotPassword">
          <div class="mb-4">
            <label for="reset-email" class="block text-sm font-medium text-charcoal-700 mb-2">
              Email Address
            </label>
            <input
              id="reset-email"
              v-model="forgotEmail"
              type="email"
              required
              class="input w-full"
              placeholder="Enter your email address"
              :disabled="isLoading"
            >
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="btn btn-ghost flex-1"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading || !forgotEmail"
              class="btn btn-primary flex-1"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { useAppStore } from '../../stores/app'

// Import Heroicons
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Login',
  components: {
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const appStore = useAppStore()
    
    const { isLoading } = storeToRefs(authStore)
    const { isOffline } = storeToRefs(appStore)
    
    // Reactive state
    const formData = ref({
      username: '',
      password: '',
      rememberMe: true
    })
    
    const showPassword = ref(false)
    const errorMessage = ref('')
    const showForgotPassword = ref(false)
    const forgotEmail = ref('')
    
    // Methods
    const handleLogin = async () => {
      if (isOffline.value) {
        errorMessage.value = 'You are offline. Please check your internet connection.'
        return
      }
      
      errorMessage.value = ''
      
      const result = await authStore.login({
        email: formData.value.username,
        password: formData.value.password
      })
      
      if (result.success) {
        appStore.showSuccess('Welcome back!')
        router.push('/')
      } else {
        errorMessage.value = result.error
      }
    }
    
    const handleForgotPassword = async () => {
      if (isOffline.value) {
        appStore.showError('You are offline. Please check your internet connection.')
        return
      }
      
      const result = await authStore.forgotPassword(forgotEmail.value)
      
      if (result.success) {
        appStore.showSuccess(result.message)
        showForgotPassword.value = false
        forgotEmail.value = ''
      } else {
        appStore.showError(result.error)
      }
    }
    
    // Check if already authenticated
    onMounted(async () => {
      if (authStore.isAuthenticated) {
        router.push('/')
        return
      }
      
      // Try to restore authentication from storage
      await authStore.checkAuth()
      
      if (authStore.isAuthenticated) {
        router.push('/')
      }
    })
    
    return {
      formData,
      showPassword,
      errorMessage,
      showForgotPassword,
      forgotEmail,
      isLoading,
      isOffline,
      handleLogin,
      handleForgotPassword
    }
  }
}
</script>

<style scoped>
/* Custom animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Focus styles for better accessibility */
input:focus, button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    border: 2px solid #374151;
  }
  
  .text-gray-700 {
    color: #065F46;
    font-weight: 700;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none !important;
  }
  
  .transition-colors, .transition-all {
    transition: none !important;
  }
}

/* Print styles */
@media print {
  div {
    display: none !important;
  }
}
</style>
