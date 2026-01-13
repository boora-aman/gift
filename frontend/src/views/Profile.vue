<template>
  <div class="min-h-full bg-desert-sand-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white shadow-card">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center space-x-3">
          <UserIcon class="w-6 h-6 text-gray-700" />
          <h1 class="text-xl font-bold text-charcoal-900">Profile</h1>
        </div>
        
        <button
          @click="handleLogout"
          class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:block bg-white shadow-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <UserIcon class="w-8 h-8 text-gray-700" />
            <div>
              <h1 class="text-3xl font-bold text-charcoal-900">User Profile</h1>
              <p class="text-charcoal-600">Manage your account settings and preferences</p>
            </div>
          </div>
          
          <button
            @click="handleLogout"
            class="inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe-navbar">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-card p-6 text-center">
            <!-- Avatar -->
            <div class="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <UserIcon class="h-12 w-12 text-gray-700" />
            </div>
            
            <!-- User Info -->
            <h2 class="text-xl font-bold text-charcoal-900 mb-2">
              {{ user.full_name || user.name || 'User' }}
            </h2>
            <p class="text-charcoal-600 mb-1">{{ user.email }}</p>
            <p class="text-sm text-charcoal-500">{{ user.role || 'User' }}</p>
            
            <!-- Edit Profile Button -->
            <button
              @click="editMode = !editMode"
              class="mt-4 inline-flex items-center px-4 py-2 border border-emerald-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <PencilIcon class="w-4 h-4 mr-2" />
              {{ editMode ? 'Cancel' : 'Edit Profile' }}
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="mt-6 bg-white rounded-xl shadow-card p-6">
            <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Quick Stats</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-charcoal-600">Gifts Created</span>
                <span class="font-semibold text-charcoal-900">{{ stats.giftsCreated || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-charcoal-600">Gifts Issued</span>
                <span class="font-semibold text-charcoal-900">{{ stats.giftsIssued || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-charcoal-600">Last Login</span>
                <span class="text-sm text-charcoal-600">{{ formatDate(stats.lastLogin) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-charcoal-900">Profile Information</h3>
              <div v-if="editMode" class="flex items-center space-x-3">
                <button
                  @click="saveProfile"
                  :disabled="saving"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckIcon v-if="!saving" class="w-4 h-4 mr-2" />
                  <ArrowPathIcon v-else class="w-4 h-4 mr-2 animate-spin" />
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Full Name -->
                <div>
                  <label for="full_name" class="block text-sm font-medium text-charcoal-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    v-model="profileForm.full_name"
                    type="text"
                    :readonly="!editMode"
                    class="block w-full px-3 py-2 border border-charcoal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-emerald-500 disabled:bg-charcoal-50 disabled:text-charcoal-500 transition-colors"
                    :class="{ 'bg-charcoal-50 text-charcoal-500': !editMode }"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-charcoal-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    readonly
                    class="block w-full px-3 py-2 border border-charcoal-300 rounded-lg shadow-sm bg-charcoal-50 text-charcoal-500"
                  />
                  <p class="mt-1 text-xs text-charcoal-500">Email cannot be changed</p>
                </div>

                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-charcoal-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    v-model="profileForm.phone"
                    type="tel"
                    :readonly="!editMode"
                    class="block w-full px-3 py-2 border border-charcoal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-emerald-500 disabled:bg-charcoal-50 disabled:text-charcoal-500 transition-colors"
                    :class="{ 'bg-charcoal-50 text-charcoal-500': !editMode }"
                  />
                </div>

                <!-- Birth Date -->
                <div>
                  <label for="birth_date" class="block text-sm font-medium text-charcoal-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    id="birth_date"
                    v-model="profileForm.birth_date"
                    type="date"
                    :readonly="!editMode"
                    class="block w-full px-3 py-2 border border-charcoal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-emerald-500 disabled:bg-charcoal-50 disabled:text-charcoal-500 transition-colors"
                    :class="{ 'bg-charcoal-50 text-charcoal-500': !editMode }"
                  />
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label for="bio" class="block text-sm font-medium text-charcoal-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  v-model="profileForm.bio"
                  rows="4"
                  :readonly="!editMode"
                  class="block w-full px-3 py-2 border border-charcoal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-emerald-500 disabled:bg-charcoal-50 disabled:text-charcoal-500 resize-none transition-colors"
                  :class="{ 'bg-charcoal-50 text-charcoal-500': !editMode }"
                  placeholder="Tell us a little about yourself..."
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Settings Section -->
          <div class="mt-8 bg-white rounded-xl shadow-card p-6" style="display: none;">
            <h3 class="text-lg font-semibold text-charcoal-900 mb-6">Preferences</h3>
            
            <div class="space-y-6">
              <!-- Notifications -->
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-charcoal-900">Email Notifications</h4>
                  <p class="text-sm text-charcoal-600">Receive notifications about gift activities</p>
                </div>
                <button
                  @click="toggleSetting('emailNotifications')"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  :class="settings.emailNotifications ? 'bg-gray-600' : 'bg-charcoal-200'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>

              <!-- Theme -->
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-charcoal-900">Dark Mode</h4>
                  <p class="text-sm text-charcoal-600">Use dark theme for better visibility</p>
                </div>
                <button
                  @click="toggleSetting('darkMode')"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  :class="settings.darkMode ? 'bg-gray-600' : 'bg-charcoal-200'"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="settings.darkMode ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>

              <!-- Language -->
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-charcoal-900">Language</h4>
                  <p class="text-sm text-charcoal-600">Choose your preferred language</p>
                </div>
                <CustomDropdown
                  v-model="settings.language"
                  :options="languageOptions"
                  @update:modelValue="updateSetting('language', $event)"
                  size="sm"
                  icon="LanguageIcon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../composables/useNotifications'
import CustomDropdown from '../components/CustomDropdown.vue'

// Icons
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Profile',
  components: {
    CustomDropdown,
    UserIcon,
    PencilIcon,
    CheckIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const { showNotification } = useNotifications()

    // State
    const editMode = ref(false)
    const saving = ref(false)
    
    const profileForm = reactive({
      full_name: '',
      email: '',
      phone: '',
      bio: '',
      birth_date: ''
    })

    const settings = reactive({
      emailNotifications: true,
      darkMode: false,
      language: 'en'
    })

    const stats = reactive({
      giftsCreated: 0,
      giftsIssued: 0,
      lastLogin: null
    })

    // Computed
    const user = computed(() => authStore.user || {})

    const languageOptions = computed(() => [
      { value: 'en', label: 'English' },
      { value: 'ar', label: 'العربية (Arabic)' }
    ])

    // Methods
    const loadProfile = async () => {
      try {
        // Load user profile from API
        const profileResult = await authStore.loadUserProfile()
        if (profileResult.success && profileResult.user) {
          profileForm.full_name = profileResult.user.full_name || ''
          profileForm.email = profileResult.user.email || ''
          profileForm.phone = profileResult.user.phone || ''
          profileForm.bio = profileResult.user.bio || ''
          profileForm.birth_date = profileResult.user.birth_date || ''
        }

        // Load user stats
        const statsResult = await authStore.getUserStats()
        if (statsResult.success && statsResult.data) {
          stats.giftsCreated = statsResult.data.gifts_created || 0
          stats.giftsIssued = statsResult.data.gifts_issued || 0
          stats.lastLogin = statsResult.data.last_login
        }

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('userSettings')
        if (savedSettings) {
          Object.assign(settings, JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        showNotification('Failed to load profile data', 'error')
      }
    }

    const saveProfile = async () => {
      if (!editMode.value) return

      saving.value = true

      try {
        // Update profile via API
        await authStore.updateProfile(profileForm)
        
        showNotification('Profile updated successfully', 'success')
        editMode.value = false
      } catch (error) {
        console.error('Failed to update profile:', error)
        showNotification('Failed to update profile', 'error')
      } finally {
        saving.value = false
      }
    }

    const toggleSetting = (key) => {
      settings[key] = !settings[key]
      updateSetting(key, settings[key])
    }

    const updateSetting = (key, value) => {
      settings[key] = value
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
      // Apply specific settings
      // Dark mode disabled; ignore 'darkMode' setting

      showNotification(`${key} updated`, 'success', 3000)
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        showNotification('You have been signed out successfully', 'success')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        showNotification('Error signing out', 'error')
      }
    }

    const formatDate = (date) => {
      if (!date) return 'Never'
      
      return new Date(date).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadProfile()
      
      // Apply saved dark mode setting
      if (settings.darkMode) {
        document.documentElement.classList.add('dark')
      }
    })

    return {
      editMode,
      saving,
      profileForm,
      settings,
      stats,
      user,
      languageOptions,
      saveProfile,
      toggleSetting,
      updateSetting,
      handleLogout,
      formatDate
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

/* Toggle switch animations */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
input:focus,
textarea:focus,
select:focus,
button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition,
  .transition-colors {
    transition: none !important;
  }
  
  .animate-spin {
    animation: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }
  
  .border-charcoal-300 {
    border-color: #374151 !important;
  }
}

/* PWA bottom navbar safe area */
.pb-safe-navbar {
  /* Default padding bottom for desktop */
  padding-bottom: 2rem;
}

/* Mobile PWA bottom navbar spacing */
@media (max-width: 1024px) {
  .pb-safe-navbar {
    /* Account for bottom tab bar (64px) + extra spacing (32px) */
    padding-bottom: 6rem;
  }
}

/* iOS safe area support for PWA */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 1024px) {
    .pb-safe-navbar {
      /* Account for bottom tab bar + safe area + extra spacing */
      padding-bottom: calc(6rem + env(safe-area-inset-bottom));
    }
  }
}

/* Standalone PWA mode (when installed) */
@media (display-mode: standalone) {
  .pb-safe-navbar {
    /* Extra padding for standalone PWA mode */
    padding-bottom: calc(6rem + 1rem);
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (display-mode: standalone) {
    .pb-safe-navbar {
      /* Comprehensive spacing for standalone PWA with safe area */
      padding-bottom: calc(6rem + 1rem + env(safe-area-inset-bottom));
    }
  }
}
</style>
