import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isOffline = ref(!navigator.onLine)
  const screenWidth = ref(window.innerWidth)
  const notifications = ref([])
  const loading = ref(false)
  const scannerHandler = ref(null)
  const theme = ref('light')
  const language = ref(localStorage.getItem('gift-app-language') || 'en')
  
  // Computed
  const isMobile = computed(() => screenWidth.value <= 768)
  const isTablet = computed(() => screenWidth.value > 768 && screenWidth.value <= 1024)
  const isDesktop = computed(() => screenWidth.value > 1024)
  const isDarkMode = computed(() => false)

  // Actions
  const initialize = () => {
    // Set up offline/online listeners
    const updateOfflineStatus = () => {
      isOffline.value = !navigator.onLine
    }
    
    window.addEventListener('online', updateOfflineStatus)
    window.addEventListener('offline', updateOfflineStatus)

    // Force light theme
    document.documentElement.classList.remove('dark')
  }
  
  const updateScreenSize = (width) => {
    screenWidth.value = width
  }
  
  const setOfflineStatus = (offline) => {
    isOffline.value = offline
  }
  
  const setLoading = (loadingState) => {
    loading.value = loadingState
  }
  
  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    notifications.value.push({
      id,
      ...notification,
      timestamp: new Date()
    })
    
    // Auto remove after delay
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
  
  const clearNotifications = () => {
    notifications.value = []
  }
  
  const setScannerHandler = (handler) => {
    scannerHandler.value = handler
  }
  
  const openScanner = () => {
    if (scannerHandler.value) {
      scannerHandler.value()
    }
  }

  const setTheme = () => {
    // Dark mode disabled; keep light
    theme.value = 'light'
    localStorage.setItem('gift-app-theme', 'light')
    document.documentElement.classList.remove('dark')
  }
  
  const toggleTheme = () => {
    // No-op: dark mode disabled
    setTheme('light')
  }
  
  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    localStorage.setItem('gift-app-language', newLanguage)
    document.documentElement.lang = newLanguage
    
    // Update RTL/LTR direction for Arabic
    if (newLanguage === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }
  
  // Notification helpers
  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }
  
  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      autoRemove: false,
      ...options
    })
  }
  
  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }
  
  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }
  
  return {
    // State
    isOffline,
    screenWidth,
    notifications,
    loading,
    scannerHandler,
    theme,
    language,
    
    // Computed
    isMobile,
    isTablet,
    isDesktop,
    isDarkMode,
    
    // Actions
    initialize,
    updateScreenSize,
    setOfflineStatus,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    setScannerHandler,
    openScanner,
    setTheme,
    toggleTheme,
    setLanguage,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
