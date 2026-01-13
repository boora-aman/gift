<template>
  <header class="bg-white border-b border-charcoal-200 no-print">
    <!-- PWA Status Bar Spacer -->
    <div class="h-safe-top bg-white"></div>
    
    <!-- Main Header Bar -->
    <div class="px-4 md:px-6 py-3 md:py-4">
      <div class="flex items-center justify-between">
        <!-- Left Side: Logo and Navigation -->
        <div class="flex items-center space-x-3 md:space-x-6">
          <!-- Logo (Always First) -->
          <div class="flex items-center">
            <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm border border-charcoal-200">
              <img 
                src="/images/image.png" 
                alt="Gift Manager Logo" 
                class="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-1">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              :class="isActive(item.name) 
                ? 'text-gray-900 bg-gray-100 border border-gray-200' 
                : 'text-charcoal-700 hover:text-gray-900 hover:bg-gray-50'"
            >
              <component 
                :is="getIconComponent(item.icon)" 
                class="w-4 h-4 mr-2"
              />
              {{ item.title }}
            </router-link>
          </nav>
        </div>
        
        <!-- Right Side: User Controls -->
        <div class="flex items-center space-x-3">
          <!-- Offline Indicator -->
          <div 
            v-if="isOffline"
            class="flex items-center space-x-2 px-2 py-1 bg-red-100 text-red-800 rounded-lg text-xs"
            title="You are currently offline"
          >
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="font-medium">Offline</span>
          </div>
          
          <!-- User Menu -->
          <div class="relative user-menu-container">
            <button
              @click.stop="$emit('toggle-user-menu')"
              class="flex items-center space-x-2 p-2 text-charcoal-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {{ userInitials }}
              </div>
              <ChevronDownIcon class="w-4 h-4 text-charcoal-400" />
            </button>
            
            <!-- User Menu Dropdown -->
            <UserMenu 
              :show="showUserMenu" 
              @close="$emit('close-user-menu')" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Breadcrumb Bar -->
    <div class="px-4 md:px-6 py-2 md:py-3 bg-charcoal-50 border-t border-charcoal-200">
      <div class="flex items-center justify-between">
        <!-- Breadcrumbs -->
        <nav class="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
          <router-link
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            :to="crumb.path"
            class="text-sm transition-colors duration-200 flex items-center"
            :class="index === breadcrumbs.length - 1 
              ? 'text-charcoal-800 font-medium cursor-default' 
              : 'text-charcoal-600 hover:text-gray-900'"
          >
            <component 
              v-if="crumb.icon && index === 0" 
              :is="crumb.icon" 
              class="w-4 h-4 mr-1" 
            />
            {{ crumb.title }}
            <ChevronRightIcon 
              v-if="index < breadcrumbs.length - 1" 
              class="w-4 h-4 mx-2 text-charcoal-400" 
            />
          </router-link>
        </nav>
        
        <!-- Page Actions -->
        <div v-if="$slots.actions" class="flex items-center space-x-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showMobileMenu" class="fixed inset-0 z-50 lg:hidden">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close-mobile-menu')"></div>
        <div class="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
          <div class="p-6 border-b border-charcoal-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/image.png" 
                    alt="Gift Manager Logo" 
                    class="w-full h-full object-contain"
                  />
                </div>
                <span class="font-semibold text-charcoal-800">Gift Manager</span>
              </div>
              <button
                @click="$emit('close-mobile-menu')"
                class="p-2 text-charcoal-600 hover:text-charcoal-800 rounded-lg"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav class="p-4 space-y-2">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              @click="$emit('close-mobile-menu')"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              :class="isActive(item.name) 
                ? 'text-gray-900 bg-gray-100 border border-gray-200' 
                : 'text-charcoal-700 hover:text-gray-900 hover:bg-gray-50'"
            >
              <component 
                :is="getIconComponent(item.icon)" 
                class="w-5 h-5 mr-3"
              />
              {{ item.title }}
            </router-link>
          </nav>
          
          <!-- Quick Actions in Mobile Menu -->
          <div class="p-4 border-t border-charcoal-200 space-y-3">
            <h3 class="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Quick Actions</h3>
            
            <router-link
              to="/gifts/new"
              @click="$emit('close-mobile-menu')"
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <PlusIcon class="w-4 h-4 mr-2 text-gray-700" />
              Add New Gift
            </router-link>
            
            <router-link
              to="/scan"
              @click="$emit('close-mobile-menu')"
              class="flex items-center px-4 py-2 text-sm font-medium text-charcoal-700 bg-charcoal-100 rounded-lg hover:bg-charcoal-200 transition-colors duration-200"
            >
              <QrCodeIcon class="w-4 h-4 mr-2 text-charcoal-600" />
              Distribute Gift
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { useAppStore } from '../../stores/app'
import { getNavigationItems, isRouteActive } from '../../router'
import UserMenu from './UserMenu.vue'

// Import Heroicons
import { 
  HomeIcon,
  GiftIcon,
  DocumentTextIcon,
  UserIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'

import {
  HomeIcon as HomeIconSolid,
  GiftIcon as GiftIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  DocumentChartBarIcon as DocumentChartBarIconSolid
} from '@heroicons/vue/24/solid'

export default {
  name: 'CenteredHeader',
  components: {
    HomeIcon,
    GiftIcon,
    DocumentTextIcon,
    UserIcon,
    PlusIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    QrCodeIcon,
    Cog6ToothIcon,
    DocumentChartBarIcon,
    HomeIconSolid,
    GiftIconSolid,
    DocumentTextIconSolid,
    UserIconSolid,
    Cog6ToothIconSolid,
    DocumentChartBarIconSolid,
    UserMenu
  },
  props: {
    showMobileMenu: {
      type: Boolean,
      default: false
    },
    showUserMenu: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-menu', 'close-mobile-menu', 'toggle-user-menu', 'close-user-menu'],
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const appStore = useAppStore()
    
    const { userInitials } = storeToRefs(authStore)
    const { isOffline } = storeToRefs(appStore)
    
    const navigationItems = computed(() => getNavigationItems())
    
    const isActive = (routeName) => {
      return isRouteActive(routeName, route.name, route.meta?.parentRoute)
    }
    
    const getIconComponent = (iconName) => {
      const iconMap = {
        'home': isActive('Dashboard') ? 'HomeIconSolid' : 'HomeIcon',
        'gift': isActive('Gifts') ? 'GiftIconSolid' : 'GiftIcon',
        'document-text': isActive('Dispatches') ? 'DocumentTextIconSolid' : 'DocumentTextIcon',
        'document-chart-bar': isActive('Reports') ? 'DocumentChartBarIconSolid' : 'DocumentChartBarIcon',
        'cog-6-tooth': isActive('Settings') ? 'Cog6ToothIconSolid' : 'Cog6ToothIcon',
        'qr-code': isActive('Scanner') ? 'QrCodeIcon' : 'QrCodeIcon',
        'user': isActive('Profile') ? 'UserIconSolid' : 'UserIcon'
      }
      
      return iconMap[iconName] || 'HomeIcon'
    }
    
    const breadcrumbs = computed(() => {
      const crumbs = []
      
      // Always add home with icon
      crumbs.push({ 
        title: 'Dashboard', 
        path: '/', 
        icon: 'HomeIcon' 
      })
      
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
    
    return {
      navigationItems,
      isActive,
      getIconComponent,
      breadcrumbs,
      userInitials,
      isOffline
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles for accessibility */
.focus-visible:focus {
  outline: 2px solid #374151;
  outline-offset: 2px;
}

/* Logo container styling */
.logo-container {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Navigation active state */
.router-link-active {
  font-weight: 600;
}

/* Mobile menu slide transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: transform 0.3s ease;
}

.mobile-menu-enter-from {
  transform: translateX(-100%);
}

.mobile-menu-leave-to {
  transform: translateX(-100%);
}

/* Breadcrumb styling */
nav a:not(:last-child):hover {
  text-decoration: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-charcoal-200 {
    border-color: #374151;
  }
  
  .bg-charcoal-50 {
    background-color: #f9fafb;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all, .transition-colors, .transition-opacity {
    transition: none !important;
  }
}

/* Ensure proper spacing on mobile */
@media (max-width: 768px) {
  .logo-container {
    margin: 0 auto;
  }
}

/* PWA Safe Area Support */
.h-safe-top {
  height: env(safe-area-inset-top);
}

/* PWA Status Bar in standalone mode */
@media (display-mode: standalone) {
  .h-safe-top {
    background-color: #374151; /* Match gray theme color */
  }
}

/* iOS PWA specific adjustments */
@supports (-webkit-touch-callout: none) {
  .h-safe-top {
    height: max(env(safe-area-inset-top), 20px);
  }
}
</style>
