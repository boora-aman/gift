<template>
  <div id="app" class="h-full min-h-screen bg-off-white">
    <!-- Login Page (No Layout) -->
    <div v-if="showAuthLayout" class="h-screen">
      <router-view v-slot="{ Component, route }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
    
    <!-- Main App Layout (Authenticated Users) -->
    <div v-else>
      <!-- Mobile Layout (≤ 768px) -->
      <div v-if="isMobile" class="flex flex-col h-screen">
        <!-- Mobile Header -->
        <CenteredHeader 
          :show-mobile-menu="showMobileMenu"
          :show-user-menu="showUserMenu"
          @toggle-menu="toggleMobileMenu"
          @close-mobile-menu="closeMobileMenu"
          @toggle-user-menu="toggleUserMenu"
          @close-user-menu="closeUserMenu"
        >
          <template #actions>
            <slot name="header-actions" />
          </template>
        </CenteredHeader>
        
        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto pb-24 safe-area-padding">
          <router-view v-slot="{ Component, route }">
            <transition
              :name="getTransitionName(route)"
              mode="out-in"
            >
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </main>
        
        <!-- Bottom Tab Bar -->
        <BottomTabBar />
      </div>
      
      <!-- Desktop/Tablet Layout (> 768px) -->
      <div v-else class="flex flex-col h-screen">
        <!-- Centered Header -->
        <CenteredHeader 
          :show-mobile-menu="showMobileMenu"
          :show-user-menu="showUserMenu"
          @toggle-menu="toggleMobileMenu"
          @close-mobile-menu="closeMobileMenu"
          @toggle-user-menu="toggleUserMenu"
          @close-user-menu="closeUserMenu"
        >
          <template #actions>
            <slot name="header-actions" />
          </template>
        </CenteredHeader>
        
        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto">
          <div class="container-responsive py-6">
            <router-view v-slot="{ Component, route }">
              <transition
                :name="getTransitionName(route)"
                mode="out-in"
              >
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </main>
      </div>
    </div>
    
    <!-- Global Modals and Overlays -->
    <ScannerModal v-if="showScannerModal" @close="closeScannerModal" />
    <NotificationToast />
    <OfflineIndicator />
    
    <!-- PWA Update Prompt -->
    <UpdatePrompt v-if="showUpdatePrompt" @update="updateApp" @dismiss="dismissUpdate" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from './stores/app'
import { useAuthStore } from './stores/auth'

// Layout Components
import BottomTabBar from './components/layout/BottomTabBar.vue'
import CenteredHeader from './components/layout/CenteredHeader.vue'

// Global Components
import ScannerModal from './components/scanner/ScannerModal.vue'
import NotificationToast from './components/common/NotificationToast.vue'
import OfflineIndicator from './components/common/OfflineIndicator.vue'
import UpdatePrompt from './components/common/UpdatePrompt.vue'

export default {
  name: 'App',
  components: {
    BottomTabBar,
    CenteredHeader,
    ScannerModal,
    NotificationToast,
    OfflineIndicator,
    UpdatePrompt
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const authStore = useAuthStore()
    
    // Reactive state
    const screenWidth = ref(window.innerWidth)
    const showScannerModal = ref(false)
    const showUpdatePrompt = ref(false)
    const showMobileMenu = ref(false)
    const showUserMenu = ref(false)
    
    // Computed properties
    const isMobile = computed(() => screenWidth.value <= 768)
    const isTablet = computed(() => screenWidth.value > 768 && screenWidth.value <= 1024)
    const isDesktop = computed(() => screenWidth.value > 1024)
    
    // Show auth layout (login, etc) without sidebar/navigation
    const showAuthLayout = computed(() => {
      return route.meta?.hideNavigation === true || !isAuthenticated.value
    })
    
    // Store state
    const { isOffline, notifications } = storeToRefs(appStore)
    const { user, isAuthenticated } = storeToRefs(authStore)
    
    // Methods
    const handleResize = () => {
      screenWidth.value = window.innerWidth
      appStore.updateScreenSize(screenWidth.value)
    }
    
    const openScannerModal = () => {
      showScannerModal.value = true
    }
    
    const closeScannerModal = () => {
      showScannerModal.value = false
    }
    
    const updateApp = () => {
      // Handle PWA update
      if ('serviceWorker' in navigator) {
        window.location.reload()
      }
    }
    
    const dismissUpdate = () => {
      showUpdatePrompt.value = false
    }
    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }
    
    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    const closeUserMenu = () => {
      showUserMenu.value = false
    }
    
    // Click outside handler for closing menus
    const handleClickOutside = (event) => {
      // Check if the click is within the user menu area
      const userMenuContainer = event.target.closest('.user-menu-container')
      
      // Don't close if clicking within the user menu container
      if (!userMenuContainer && showUserMenu.value) {
        showUserMenu.value = false
      }
      
      // Check for mobile menu
      if (!event.target.closest('.mobile-menu-container')) {
        showMobileMenu.value = false
      }
    }
    
    // Route transition methods
    const getTransitionName = (route) => {
      // Define transition based on route meta or path
      if (route.meta?.transition) {
        return route.meta.transition
      }
      
      // Default transitions based on route patterns
      if (route.path.includes('/create') || route.path.includes('/new')) {
        return 'slide-up'
      } else if (route.path.includes('/edit')) {
        return 'slide-right'
      } else if (route.path.includes('/detail') || route.path.includes('/view')) {
        return 'slide-left'
      } else {
        return 'fade'
      }
    }
    
    // Lifecycle hooks
    onMounted(() => {
      // Add resize listener
      window.addEventListener('resize', handleResize)
      
      // Add the click outside event listener with a small delay to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
      
      // Initialize app store
      appStore.initialize()
      
      // Listen for PWA update events
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SKIP_WAITING') {
            showUpdatePrompt.value = true
          }
        })
      }

      // Force light theme: ensure no 'dark' class is present
      document.documentElement.classList.remove('dark')

      // Prevent zoom on iOS double-tap
      let lastTouchEnd = 0
      document.addEventListener('touchend', (event) => {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      }, false)
      
      // Handle online/offline status
      const updateOnlineStatus = () => {
        appStore.setOfflineStatus(!navigator.onLine)
      }
      
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      updateOnlineStatus() // Set initial status
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      // Clean up click outside listener
      document.removeEventListener('click', handleClickOutside)
    })
    
    // Global event bus for scanner
    const handleGlobalScanRequest = () => {
      openScannerModal()
    }
    
    // Expose scanner globally for components
    appStore.setScannerHandler(handleGlobalScanRequest)
    
    return {
      // Computed
      isMobile,
      isTablet,
      isDesktop,
      showAuthLayout,
      
      // State
      showScannerModal,
      showUpdatePrompt,
      showMobileMenu,
      showUserMenu,
      
      // Methods
      openScannerModal,
      closeScannerModal,
      updateApp,
      dismissUpdate,
      toggleMobileMenu,
      closeMobileMenu,
      toggleUserMenu,
      closeUserMenu,
      getTransitionName,
      
      // Store state
      isOffline,
      notifications,
      user,
      isAuthenticated
    }
  }
}
</script>

<style>
/* App-specific styles */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure proper touch handling */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection in input areas */
input, textarea, [contenteditable] {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Smooth transitions for layout changes */
.flex, .grid {
  transition: all 0.3s ease;
}

/* Handle safe areas on mobile devices */
@supports (padding: max(0px)) {
  .safe-area-padding {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 108, 87, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 108, 87, 0.4);
}

/* Route Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
