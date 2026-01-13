<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-white rounded-xl shadow-card p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-display-2 text-charcoal-800">
            Welcome Back
          </h1>
          <p class="text-charcoal-600 mt-1">
            {{ formatDate(new Date()) }} • {{ currentTime }}
          </p>
        </div>
        <div class="hidden md:block">
          <!-- <div class="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="white"/>
              <path d="M12 6L12.5 10.5L17 11L12.5 11.5L12 16L11.5 11.5L7 11L11.5 10.5L12 6Z" fill="#C8A75C"/>
            </svg>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Available Gifts"
        :value="stats.available_gifts || 0"
        icon="gift"
        color="gray"
        :loading="statsLoading"
        @click="$router.push('/gifts?status=Available')"
      />

      <StatCard
        title="Dispatched Gifts"
        :value="stats.issued_gifts || 0"
        icon="document-check"
        color="gold"
        :loading="statsLoading"
        @click="$router.push('/gifts?status=Issued')"
      />

      <StatCard
        title="Total Gifts"
        :value="stats.total_gifts || 0"
        icon="squares-plus"
        color="charcoal"
        :loading="statsLoading"
        @click="$router.push('/gifts')"
      />
    </div>

    <!-- Quick Actions -->
    <div v-if="authStore.canCreateGifts || authStore.canDispatchGifts" class="bg-white rounded-xl shadow-card p-6">
      <h2 class="text-heading text-charcoal-800 mb-4">Quick Actions</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <router-link
          v-if="authStore.canCreateGifts"
          to="/gifts/new"
          class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
        >
          <div class="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mr-4">
            <PlusIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-charcoal-800 group-hover:text-gray-900">Add New Gift</h3>
            <p class="text-sm text-charcoal-600">Create a new gift</p>
          </div>
        </router-link>

        <!-- Gift Dispatch (Admin and Event Manager only) -->
        <router-link
          v-if="authStore.canDispatchGifts"
          to="/scan"
          class="flex items-center p-4 bg-charcoal-50 hover:bg-charcoal-100 rounded-xl transition-colors duration-200 group text-left"
        >
          <div class="w-12 h-12 bg-charcoal-500 rounded-xl flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-charcoal-800 group-hover:text-charcoal-700">Distribute Gift</h3>
            <p class="text-sm text-charcoal-600">Scan barcode to dispatch gift</p>
          </div>
        </router-link>

        <!-- Add Interest (Event Coordinator only) -->
        <router-link
          v-if="!authStore.canDispatchGifts && authStore.isEventCoordinator"
          to="/scan"
          class="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 group text-left"
        >
          <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-blue-800 group-hover:text-blue-700">Add Interest</h3>
            <p class="text-sm text-blue-600">Scan barcode to register interest</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-heading text-charcoal-800">Recent Activity</h2>
        <router-link
          to="/gifts?status=Issued"
          class="text-sm text-gray-700 hover:text-gray-900 font-medium"
        >
          View all →
        </router-link>
      </div>

      <div v-if="recentActivityLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center space-x-4">
          <div class="w-10 h-10 bg-charcoal-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-charcoal-200 rounded w-3/4"></div>
            <div class="h-3 bg-charcoal-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div v-else-if="recentActivity.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon class="w-8 h-8 text-charcoal-400" />
        </div>
        <p class="text-charcoal-600">No recent activity</p>
        <p class="text-sm text-charcoal-500 mt-1">Gift issues will appear here</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-center space-x-4 p-3 rounded-lg hover:bg-charcoal-50 transition-colors duration-200 cursor-pointer"
          @click="$router.push(`/gifts/${activity.id}`)"
        >
          <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <GiftIcon class="w-5 h-5 text-white" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-charcoal-800 truncate">
              Gift dispatched to {{ activity.recipient }}
            </p>
            <p class="text-xs text-charcoal-600">
              {{ activity.giftName }} • {{ formatRelativeTime(activity.date) }}
            </p>
          </div>

          <div class="flex-shrink-0">
            <ChevronRightIcon class="w-5 h-5 text-charcoal-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useAppStore } from '../stores/app'
import { GiftAPI } from '../services/api'
import { formatDate, formatRelativeTime } from '../utils/helpers'

// Import components
import StatCard from '../components/common/StatCard.vue'

// Import Heroicons
import {
  PlusIcon,
  GiftIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Dashboard',
  components: {
    StatCard,
    PlusIcon,
    GiftIcon,
    ClockIcon,
    ChevronRightIcon
  },
  setup() {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    const { userFullName } = storeToRefs(authStore)

    // Reactive state
    const stats = ref({
      available_gifts: 0,
      issued_gifts: 0,
      total_gifts: 0
    })
    const statsLoading = ref(true)
    const recentActivity = ref([])
    const recentActivityLoading = ref(true)
    const currentTime = ref(new Date().toLocaleTimeString())

    let timeInterval = null

    // Methods
    const loadDashboardData = async () => {
      try {
        statsLoading.value = true
        recentActivityLoading.value = true

        const result = await GiftAPI.getDashboardStats()

        if (result.success) {
          // Extract stats from the nested 'totals' object
          stats.value = result.data.totals || {}

          // Extract recent activities
          if (result.data.recent_activities) {
            recentActivity.value = result.data.recent_activities.map(gift => ({
              id: gift.name,
              recipient: `${gift.owner_full_name || ''} ${gift.owner_full_name || ''}`.trim(),
              giftName: gift.gift_name,
              date: gift.creation || gift.issued_date,
              type: 'gift_issue'
            }))
          }
        } else {
          appStore.showError('Failed to load dashboard data')
        }
      } catch (error) {
        console.error('Dashboard data error:', error)
        appStore.showError('Failed to load dashboard data')
      } finally {
        statsLoading.value = false
        recentActivityLoading.value = false
      }
    }

    const updateTime = () => {
      currentTime.value = new Date().toLocaleTimeString()
    }

    // Lifecycle
    onMounted(async () => {
      // Load dashboard data
      await loadDashboardData()

      // Start time update interval
      timeInterval = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      userFullName,
      stats,
      statsLoading,
      recentActivity,
      recentActivityLoading,
      currentTime,
      formatDate,
      formatRelativeTime,
      authStore
    }
  }
}
</script>

<style scoped>
/* Loading skeleton animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover effects for interactive elements */
.group:hover .group-hover\:text-gray-900 {
  color: #111827;
}

.group:hover .group-hover\:text-gold-700 {
  color: #92400E;
}

.group:hover .group-hover\:text-charcoal-700 {
  color: #374151;
}

/* Focus styles for accessibility */
button:focus, a:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none !important;
  }

  .transition-colors {
    transition: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }
}
</style>
