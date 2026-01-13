<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 py-12 px-4 sm:px-6 lg:px-8 relative">
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating shapes for visual appeal -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full space-y-8 relative z-10">
      <!-- Logo and Header -->
      <div class="text-center">
        <!-- Enhanced Logo Design -->
        <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 mb-6">
          <img 
            src="/images/image.png" 
            alt="Gift Manager Logo" 
            class="w-14 h-14 object-contain"
          />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p class="text-base text-gray-600 font-medium">
          Sign in to your Gift Management account
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mt-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Email/Username Field -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
              Email or Username
            </label>
            <div class="mt-1 relative">
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                autocomplete="username"
                required
                class="block w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
                :class="{ 'border-red-300 focus:ring-red-500': errors.username }"
                placeholder=""
                @blur="validateField('username')"
              />
              <UserIcon class="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.username" class="mt-2 text-sm text-red-600 font-medium">
              {{ errors.username }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
                :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
                placeholder=""
                @blur="validateField('password')"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-600 font-medium">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            :class="{ 'transform hover:-translate-y-0.5': !loading }"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-4">
              <ArrowPathIcon v-if="loading" class="h-5 w-5 animate-spin" />
              <LockClosedIcon v-else class="h-5 w-5 transition-colors" />
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

      </div>


    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '@composables/useNotifications'

// Icons
import {
  GiftIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Login',
  components: {
    GiftIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    ArrowPathIcon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const { showNotification } = useNotifications()

    // Form state
    const form = reactive({
      username: '',
      password: '',
      rememberMe: false
    })

    const errors = reactive({})
    const loading = ref(false)
    const showPassword = ref(false)

    // Form validation
    const validateField = (field) => {
      errors[field] = ''

      switch (field) {
        case 'username':
          if (!form.username.trim()) {
            errors.username = 'Username or email is required'
          } else if (form.username.includes('@') && !isValidEmail(form.username)) {
            errors.username = 'Please enter a valid email address'
          }
          break
        case 'password':
          if (!form.password) {
            errors.password = 'Password is required'
          } else if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
          }
          break
      }
    }

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    const validateForm = () => {
      validateField('username')
      validateField('password')
      return !errors.username && !errors.password
    }

    // Form submission
    const handleSubmit = async () => {
      if (!validateForm()) {
        showNotification('Please fix the errors above', 'error')
        return
      }

      loading.value = true

      try {
        const result = await authStore.login({
          usr: form.username,
          pwd: form.password,
          remember_me: form.rememberMe
        })

        if (result.success) {
          showNotification('Welcome back! You have been signed in successfully.', 'success')
          
          // Redirect to dashboard (default page) or intended route
          const redirectTo = router.currentRoute.value.query.redirect || '/'
          router.push(redirectTo)
        } else {
          // Handle login failure
          console.error('Login failed:', result.error)
          
          // Show appropriate error message
          if (result.error?.includes('Invalid') || result.error?.includes('authentication')) {
            showNotification('Invalid username or password', 'error')
          } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
            showNotification('Too many login attempts. Please try again later.', 'error')
          } else {
            showNotification(result.error || 'Login failed. Please try again.', 'error')
          }

          // Clear password on error
          form.password = ''
        }

      } catch (error) {
        console.error('Login error:', error)
        
        // Handle network or unexpected errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          showNotification('Unable to connect to server. Please check your internet connection.', 'error')
        } else {
          showNotification('An unexpected error occurred. Please try again.', 'error')
        }

        // Clear password on error
        form.password = ''
      } finally {
        loading.value = false
      }
    }

    // Additional actions
    const forgotPassword = () => {
      showNotification('Please contact your administrator to reset your password', 'info', 8000)
    }

    // Auto-focus username field when component mounts
    onMounted(() => {
      const usernameField = document.getElementById('username')
      if (usernameField) {
        usernameField.focus()
      }
    })

    return {
      form,
      errors,
      loading,
      showPassword,
      handleSubmit,
      validateField,
      forgotPassword
    }
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.max-w-md {
  animation: fadeInUp 0.8s ease-out;
}

/* Enhanced focus transitions */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

button:focus {
  transform: translateY(-1px);
}

/* Enhanced hover effects for button */
button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(107, 114, 128, 0.25);
}

/* Logo animation */
.mx-auto.h-20 {
  animation: slideInFromTop 0.6s ease-out 0.2s both;
}

/* Form animation */
.bg-white\/95 {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(24px)) {
  .backdrop-blur-xl {
    background-color: rgba(255, 255, 255, 0.98);
  }
}

/* Input placeholder animation */
input::placeholder {
  transition: opacity 0.3s ease;
}

input:focus::placeholder {
  opacity: 0.5;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white\/95 {
    background-color: white;
    border: 2px solid #374151;
  }
  
  .border-gray-200 {
    border-color: #374151 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .max-w-md,
  .mx-auto.h-20,
  .bg-white\/95 {
    animation: none;
  }
  
  input:focus,
  button:focus,
  button:hover:not(:disabled) {
    transform: none;
  }
  
  .transition-all,
  .transition-colors {
    transition: none !important;
  }
}

/* Print styles */
@media print {
  .min-h-screen {
    min-height: auto;
  }
  
  .bg-gradient-to-br {
    background: white !important;
  }
  
  .absolute {
    display: none !important;
  }
}
</style>
