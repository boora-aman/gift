<template>
  <aside class="w-64 bg-white border-r border-charcoal-200 h-full flex flex-col no-print">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-6 border-b border-charcoal-200">
      <div class="flex items-center space-x-3">
        <!-- Logo -->
        <div class="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src="/images/image.png"
            alt="Gift Manager Logo"
            class="w-full h-full object-contain"
          />
        </div>


      </div>

    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
        :class="isActive(item.name)
          ? 'text-gray-900 bg-gray-100 border border-gray-200'
          : 'text-charcoal-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent'"
      >
        <!-- Icon -->
        <component
          :is="getIconComponent(item.icon)"
          class="w-5 h-5 mr-3 flex-shrink-0"
          :class="isActive(item.name) ? 'text-gray-700' : 'text-charcoal-500 group-hover:text-gray-700'"
        />

        <!-- Label -->
        <span class="flex-1">{{ item.title }}</span>

        <!-- Active indicator -->
        <div
          v-if="isActive(item.name)"
          class="w-2 h-2 bg-gray-600 rounded-full flex-shrink-0"
        ></div>
      </router-link>
    </nav>

    <!-- Quick Actions -->
    <div v-if="authStore.canCreateGifts || authStore.canDispatchGifts" class="px-4 py-6 border-t border-charcoal-200 space-y-3">
      <h3 class="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Quick Actions</h3>

      <div class="space-y-2">
        <router-link
          v-if="authStore.canCreateGifts"
          to="/gifts/new"
          class="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 group"
        >
          <PlusIcon class="w-4 h-4 mr-2 text-gray-700" />
          Add New Gift
        </router-link>

        <router-link
          v-if="authStore.canDispatchGifts"
          to="/scan"
          class="w-full flex items-center px-4 py-2 text-sm font-medium text-charcoal-700 bg-charcoal-100 rounded-lg hover:bg-charcoal-200 transition-colors duration-200 group"
        >
          <svg class="w-4 h-4 mr-2 text-charcoal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Distribute Gift
        </router-link>
      </div>
    </div>

    <!-- User Info -->
    <div class="px-4 py-4 border-t border-charcoal-200">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-charcoal-800 truncate">{{ userFullName }}</p>
          <p class="text-xs text-charcoal-600">{{ user?.email || 'User' }}</p>
        </div>
        <button
          @click="$emit('show-user-menu')"
          class="p-1 text-charcoal-400 hover:text-charcoal-600 rounded-lg transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { getNavigationItems, isRouteActive } from '../../router'

// Import Heroicons
import {
  HomeIcon,
  GiftIcon,
  DocumentTextIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

import {
  HomeIcon as HomeIconSolid,
  GiftIcon as GiftIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/vue/24/solid'

export default {
  name: 'Sidebar',
  components: {
    HomeIcon,
    GiftIcon,
    DocumentTextIcon,
    UserIcon,
    PlusIcon,
    HomeIconSolid,
    GiftIconSolid,
    DocumentTextIconSolid,
    UserIconSolid
  },
  emits: ['toggle-sidebar', 'show-user-menu'],
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()

    const { user, userFullName, userInitials } = storeToRefs(authStore)

    const navigationItems = computed(() => getNavigationItems())

    const isActive = (routeName) => {
      return isRouteActive(routeName, route.name, route.meta?.parentRoute)
    }

    const getIconComponent = (iconName) => {
      const iconMap = {
        'home': isActive('Dashboard') ? 'HomeIconSolid' : 'HomeIcon',
        'gift': isActive('Gifts') ? 'GiftIconSolid' : 'GiftIcon',
        'document-text': isActive('Dispatches') ? 'DocumentTextIconSolid' : 'DocumentTextIcon',
        'barcode': isActive('Scanner') ? 'HomeIconSolid' : 'HomeIcon', // Using home icon as placeholder for barcode
        'user': isActive('Profile') ? 'UserIconSolid' : 'UserIcon'
      }

      return iconMap[iconName] || 'HomeIcon'
    }

    return {
      navigationItems,
      isActive,
      getIconComponent,
      user,
      userFullName,
      userInitials,
      authStore
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for navigation */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(0, 108, 87, 0.2);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 108, 87, 0.4);
}

/* Smooth transitions */
.router-link-active {
  box-shadow: 0 2px 8px rgba(0, 108, 87, 0.15);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all, .transition-colors {
    transition: none !important;
  }
}

/* Focus styles for keyboard navigation */
.focus-visible:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-charcoal-200 {
    border-color: #374151;
  }

  .text-gray-900 {
    font-weight: 700;
  }
}
</style>
