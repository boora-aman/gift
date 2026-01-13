<template>
  <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
    leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
    <div v-if="show" @click.stop
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-charcoal-200 z-50">
      <!-- User Info -->
      <div class="px-4 py-3 border-b border-charcoal-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-charcoal-800 truncate">{{ userFullName }}</p>
            <p class="text-xs text-charcoal-600">{{ user?.email || 'User' }}</p>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-2">
        <router-link to="/profile" @click="$emit('close')"
          class="flex items-center px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors duration-200">
          <UserIcon class="w-4 h-4 mr-3 text-charcoal-500" />
          Profile Settings
        </router-link>



        <hr class="my-2 border-charcoal-200" />


        <button @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200">
          <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3 text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'

// Import Heroicons
import {
  UserIcon,
  CogIcon,
  MoonIcon,
  SunIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'UserMenu',
  components: {
    UserIcon,
    CogIcon,
    MoonIcon,
    SunIcon,
    QuestionMarkCircleIcon,
    ArrowRightOnRectangleIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()

    const { user, userFullName, userInitials } = storeToRefs(authStore)

    const isDarkMode = ref(false)

    const toggleTheme = () => {
      // Dark mode disabled; always keep light
      isDarkMode.value = false
      document.documentElement.classList.remove('dark')
      localStorage.setItem('gift-app-theme', 'light')
      emit('close')
    }

    const handleHelp = () => {
      // You can implement help/support functionality here
      // For now, just close the menu
      emit('close')
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        emit('close')
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

    return {
      user,
      userFullName,
      userInitials,
      isDarkMode,
      toggleTheme,
      handleHelp,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* Ensure the dropdown appears above other elements */
.z-50 {
  z-index: 50;
}

/* Smooth transitions for menu items */
button,
a {
  transition: all 0.2s ease-in-out;
}

/* Focus styles for accessibility */
.focus-visible:focus {
  outline: 2px solid #374151;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-charcoal-200 {
    border-color: #374151;
  }

  .text-charcoal-700 {
    font-weight: 600;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition {
    transition: none !important;
  }
}
</style>
