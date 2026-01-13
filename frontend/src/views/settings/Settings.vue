<template>
  <div class="min-h-screen bg-off-white">
    <!-- Page Header -->
    <div class="bg-white border-b border-charcoal-200">
      <div class="container-responsive py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-charcoal-800">
              Settings
            </h1>
            <p class="text-charcoal-600 mt-1">
              Manage system configuration and user access
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Cog6ToothIcon class="w-4 h-4 mr-1" />
              Admin Panel
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="container-responsive py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Category Management Card -->
        <router-link
          to="/settings/categories"
          class="bg-white rounded-xl border border-charcoal-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-charcoal-300 group"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <TagIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-charcoal-800 group-hover:text-purple-600 transition-colors">
                Category Management
              </h3>
              <p class="text-charcoal-600 text-sm mt-1">
                Configure gift categories and organization
              </p>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-charcoal-400 group-hover:text-purple-600 transition-colors" />
          </div>
          
          <div class="mt-4 pt-4 border-t border-charcoal-100">
            <div class="flex items-center justify-between">
              <span class="text-sm text-charcoal-500">Total Categories</span>
              <span class="text-lg font-semibold text-charcoal-800">{{ stats.totalCategories }}</span>
            </div>
          </div>
        </router-link>

        <!-- User Management Card -->
        <router-link
          to="/settings/users"
          class="bg-white rounded-xl border border-charcoal-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-charcoal-300 group"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <UsersIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-charcoal-800 group-hover:text-blue-600 transition-colors">
                User Management
              </h3>
              <p class="text-charcoal-600 text-sm mt-1">
                Create and manage system users
              </p>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-charcoal-400 group-hover:text-blue-600 transition-colors" />
          </div>
          
          <div class="mt-4 pt-4 border-t border-charcoal-100">
            <div class="flex items-center justify-between">
              <span class="text-sm text-charcoal-500">Active Users</span>
              <span class="text-lg font-semibold text-charcoal-800">{{ stats.activeUsers }}</span>
            </div>
          </div>
        </router-link>

        <!-- Gift Recipient Management Card -->
        <router-link
          to="/settings/gift-recipients"
          class="bg-white rounded-xl border border-charcoal-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-charcoal-300 group"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <UserGroupIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-charcoal-800 group-hover:text-green-600 transition-colors">
                Gift Recipient
              </h3>
              <p class="text-charcoal-600 text-sm mt-1">
                Manage gift recipients and their information
              </p>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-charcoal-400 group-hover:text-green-600 transition-colors" />
          </div>
          
          <div class="mt-4 pt-4 border-t border-charcoal-100">
            <div class="flex items-center justify-between">
              <span class="text-sm text-charcoal-500">Total Recipients</span>
              <span class="text-lg font-semibold text-charcoal-800">{{ stats.totalRecipients }}</span>
            </div>
          </div>
        </router-link>

      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-charcoal-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <router-link
            to="/settings/categories"
            class="bg-white rounded-lg border border-charcoal-200 p-4 hover:shadow-md transition-all duration-200 hover:border-purple-300 group"
          >
            <div class="flex items-center space-x-3">
              <PlusIcon class="w-5 h-5 text-purple-600" />
              <span class="text-sm font-medium text-charcoal-700 group-hover:text-purple-600">
                Add New Category
              </span>
            </div>
          </router-link>

          <router-link
            to="/settings/users"
            class="bg-white rounded-lg border border-charcoal-200 p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
          >
            <div class="flex items-center space-x-3">
              <UserPlusIcon class="w-5 h-5 text-blue-600" />
              <span class="text-sm font-medium text-charcoal-700 group-hover:text-blue-600">
                Create New User
              </span>
            </div>
          </router-link>

          <router-link
            to="/settings/gift-recipients"
            class="bg-white rounded-lg border border-charcoal-200 p-4 hover:shadow-md transition-all duration-200 hover:border-green-300 group"
          >
            <div class="flex items-center space-x-3">
              <UserPlusIcon class="w-5 h-5 text-green-600" />
              <span class="text-sm font-medium text-charcoal-700 group-hover:text-green-600">
                Add Gift Recipient
              </span>
            </div>
          </router-link>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../composables/useToast'
import { api } from '../../services/api'
import { SettingsAPI } from '../../services/api'

// Import icons
import {
  Cog6ToothIcon,
  TagIcon,
  UsersIcon,
  UserGroupIcon,
  ChevronRightIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Settings',
  components: {
    Cog6ToothIcon,
    TagIcon,
    UsersIcon,
    UserGroupIcon,
    ChevronRightIcon,
    PlusIcon,
    UserPlusIcon
  },
  setup() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    
    // Reactive state
    const isLoading = ref(false)
    const stats = ref({
      totalCategories: 0,
      activeUsers: 0,
      totalRecipients: 0
    })

    // Methods
    const loadStats = async () => {
      try {
        isLoading.value = true
        
        // Get categories count
        const categoriesResponse = await SettingsAPI.getCategories({ limit: 1 })
        if (categoriesResponse.success) {
          stats.value.totalCategories = categoriesResponse.total
        }

        // Get active users count (enabled users)
        const activeUsersResponse = await SettingsAPI.getUsers({ 
          limit: 1, 
          enabled: 1 
        })
        if (activeUsersResponse.success) {
          stats.value.activeUsers = activeUsersResponse.total
        }

        // Get gift recipients count
        const recipientsResponse = await SettingsAPI.getGiftRecipients({ limit: 1 })
        if (recipientsResponse.success) {
          stats.value.totalRecipients = recipientsResponse.total
        }

      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      loadStats()
    })

    return {
      isLoading,
      stats
    }
  }
}
</script>

<style scoped>
.container-responsive {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container-responsive {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container-responsive {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* Card hover effects */
.group:hover .w-12 {
  transform: scale(1.05);
}

/* Animation classes */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: 1fr 1fr;
  }
}
</style>