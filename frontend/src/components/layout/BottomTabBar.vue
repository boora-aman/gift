<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-200 safe-area-padding z-50 no-print">
    <!-- Scan Button - Elevated Center Top -->
    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
      <router-link
        :to="scanButton.path"
        class="flex flex-col items-center justify-center w-14 h-14 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-600 transition-all duration-200 touch-target"
        :class="isActive(scanButton.name) ? 'bg-gray-600' : ''"
        active-class="bg-gray-600"
      >
        <!-- Icon -->
        <component 
          :is="getIconComponent(scanButton.icon)" 
          class="w-6 h-6 mb-1"
          :class="'text-white'"
        />
        
        <!-- Label -->
        <span class="text-xs leading-none text-white font-medium">
          {{ scanButton.title }}
        </span>
      </router-link>
    </div>
    
    <!-- Bottom Menu Items (4 items in a row) -->
    <div class="flex items-center justify-around h-16 px-2">
      <router-link
        v-for="item in regularMenuItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-all duration-200 rounded-lg touch-target"
        :class="isActive(item.name) ? 'text-gray-700 bg-gray-50' : 'text-charcoal-600 hover:text-gray-700 hover:bg-charcoal-50'"
        active-class="text-gray-700 bg-gray-50"
      >
        <!-- Icon -->
        <component 
          :is="getIconComponent(item.icon)" 
          class="w-6 h-6 mb-1"
          :class="isActive(item.name) ? 'text-gray-700' : 'text-charcoal-500'"
        />
        
        <!-- Label -->
        <span 
          class="text-xs leading-none"
          :class="isActive(item.name) ? 'text-gray-700 font-semibold' : 'text-charcoal-600'"
        >
          {{ item.title }}
        </span>
        
        <!-- Active indicator -->
        <div 
          v-if="isActive(item.name)"
          class="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-b-full"
        ></div>
      </router-link>
    </div>
    
    <!-- Safe area background for devices with home indicator -->
    <div class="h-safe-area-bottom bg-white"></div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMobileNavigationItems, isRouteActive } from '../../router'

// Import Heroicons
import { 
  HomeIcon,
  GiftIcon,
  DocumentTextIcon,
  QrCodeIcon,
  UserIcon,
  PlusIcon,
  CameraIcon
} from '@heroicons/vue/24/outline'

import {
  HomeIcon as HomeIconSolid,
  GiftIcon as GiftIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/vue/24/solid'

export default {
  name: 'BottomTabBar',
  components: {
    HomeIcon,
    GiftIcon,
    DocumentTextIcon,
    QrCodeIcon,
    UserIcon,
    PlusIcon,
    CameraIcon,
    HomeIconSolid,
    GiftIconSolid,
    DocumentTextIconSolid,
    QrCodeIconSolid,
    UserIconSolid
  },
  setup() {
    const route = useRoute()
    
    const navigationItems = computed(() => getMobileNavigationItems())
    
    // Separate scan button from regular menu items
    const scanButton = computed(() => {
      return navigationItems.value.find(item => item.isScanButton) || {}
    })
    
    const regularMenuItems = computed(() => {
      return navigationItems.value.filter(item => !item.isScanButton)
    })
    
    const isActive = (routeName) => {
      return isRouteActive(routeName, route.name, route.meta?.parentRoute)
    }
    
    const getIconComponent = (iconName) => {
      const iconMap = {
        'home': isActive('Dashboard') ? 'HomeIconSolid' : 'HomeIcon',
        'gift': isActive('Gifts') ? 'GiftIconSolid' : 'GiftIcon',
        'document-text': isActive('Issues') ? 'DocumentTextIconSolid' : 'DocumentTextIcon',
        'qr-code': isActive('Scanner') ? 'QrCodeIconSolid' : 'QrCodeIcon',
        'user': isActive('Profile') ? 'UserIconSolid' : 'UserIcon'
      }
      
      return iconMap[iconName] || 'HomeIcon'
    }
    
    return {
      navigationItems,
      scanButton,
      regularMenuItems,
      isActive,
      getIconComponent
    }
  }
}
</script>

<style scoped>
/* Custom styles for bottom tab bar */
.touch-target {
  min-height: 48px;
  min-width: 48px;
  position: relative;
}

/* Elevated scan button styles */
.touch-target:first-child {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

/* Safe area bottom spacing */
.h-safe-area-bottom {
  height: env(safe-area-inset-bottom);
}

/* Smooth transitions for active states */
.router-link-active {
  transform: translateY(-1px);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    border-top-width: 2px;
  }
  
  .text-gray-700 {
    font-weight: 700;
  }
}

/* Print styles */
@media print {
  nav {
    display: none !important;
  }
}
</style>
