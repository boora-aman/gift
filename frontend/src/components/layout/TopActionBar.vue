<template>
  <header class="bg-white border-b border-charcoal-200 px-6 py-4 no-print">
    <div class="flex items-center justify-between">
      <!-- Page Title and Breadcrumbs -->
      <div class="flex items-center space-x-4">
        <div>
          <h1 class="text-xl font-semibold text-charcoal-800 font-display">
            {{ pageTitle }}
          </h1>
          <nav v-if="breadcrumbs.length > 1" class="flex items-center space-x-2 mt-1">
            <router-link
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              :to="crumb.path"
              class="text-sm transition-colors duration-200"
              :class="index === breadcrumbs.length - 1 
                ? 'text-charcoal-800 font-medium cursor-default' 
                : 'text-charcoal-600 hover:text-gray-900'"
            >
              {{ crumb.title }}
              <span 
                v-if="index < breadcrumbs.length - 1" 
                class="ml-2 text-charcoal-400"
              >/</span>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center space-x-3">
        <!-- Search Button -->
        <!-- <button
          @click="$emit('toggle-search')"
          class="p-2 text-charcoal-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          title="Search gifts and dispatches"
        >
          <MagnifyingGlassIcon class="w-5 h-5" />
        </button> -->
        
        <!-- Notifications -->
        <!-- <button
          @click="$emit('toggle-notifications')"
          class="relative p-2 text-charcoal-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          title="Notifications"
        >
          <BellIcon class="w-5 h-5" />
          <span 
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button> -->
        
        <!-- User Menu -->
        <div class="relative">
          <button
            @click="$emit('toggle-user-menu')"
            class="flex items-center space-x-2 p-2 text-charcoal-600 hover:bg-charcoal-50 rounded-lg transition-colors duration-200"
          >
            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {{ userInitials }}
            </div>
            <ChevronDownIcon class="w-4 h-4 text-charcoal-400" />
          </button>
        </div>
        
        <!-- Offline Indicator -->
        <div 
          v-if="isOffline"
          class="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg"
          title="You are currently offline"
        >
          <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          <span class="text-sm font-medium">Offline</span>
        </div>
      </div>
    </div>
    
    <!-- Page Actions (if any) -->
    <div v-if="$slots.actions" class="mt-4 flex items-center justify-between">
      <slot name="actions" />
    </div>
  </header>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { useAppStore } from '../../stores/app'

// Import Heroicons
import { 
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'TopActionBar',
  components: {
    MagnifyingGlassIcon,
    BellIcon,
    ChevronDownIcon
  },
  emits: ['toggle-search', 'toggle-notifications', 'toggle-user-menu'],
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const appStore = useAppStore()
    
    const { userInitials } = storeToRefs(authStore)
    const { isOffline, notifications } = storeToRefs(appStore)
    
    const pageTitle = computed(() => {
      return route.meta?.title || 'Gift Management'
    })
    
    const breadcrumbs = computed(() => {
      const crumbs = []
      
      // Always add home
      crumbs.push({ title: 'Dashboard', path: '/' })
      
      // Add parent route if exists
      if (route.meta?.parentRoute && route.name !== route.meta.parentRoute) {
        const parentRoutes = {
          'Gifts': { title: 'Gifts', path: '/gifts' },
          'Dispatches': { title: 'Dispatches', path: '/issues' }
        }
        
        if (parentRoutes[route.meta.parentRoute]) {
          crumbs.push(parentRoutes[route.meta.parentRoute])
        }
      }
      
      // Add current page if not home
      if (route.name !== 'Dashboard') {
        crumbs.push({ 
          title: route.meta?.title || route.name, 
          path: route.path 
        })
      }
      
      return crumbs
    })
    
    const notificationCount = computed(() => {
      return notifications.value?.length || 0
    })
    
    return {
      pageTitle,
      breadcrumbs,
      notificationCount,
      userInitials,
      isOffline
    }
  }
}
</script>

<style scoped>
/* Smooth transitions for interactive elements */
button, a {
  transition: all 0.2s ease-in-out;
}

/* Focus styles for accessibility */
.focus-visible:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Animation for notification badge */
.notification-badge {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Breadcrumb styling */
nav a:not(:last-child):hover {
  text-decoration: underline;
}

/* Offline indicator pulse */
.offline-indicator {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-charcoal-200 {
    border-color: #374151;
  }
  
  button:hover, a:hover {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  button, a {
    transition: none !important;
  }
  
  .notification-badge,
  .offline-indicator {
    animation: none !important;
  }
}
</style>
