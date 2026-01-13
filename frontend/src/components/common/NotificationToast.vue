<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <transition-group
      name="notification"
      tag="div"
      enter-active-class="transform transition-all duration-300 ease-in-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transform transition-all duration-300 ease-in-out"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-white rounded-xl shadow-elevated border-l-4 p-4 pointer-events-auto"
        :class="getNotificationClasses(notification.type)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component
              :is="getNotificationIcon(notification.type)"
              class="w-5 h-5"
              :class="getIconClasses(notification.type)"
            />
          </div>
          
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="getTitleClasses(notification.type)">
              {{ notification.title || getDefaultTitle(notification.type) }}
            </p>
            <p v-if="notification.message" class="mt-1 text-sm text-charcoal-600">
              {{ notification.message }}
            </p>
          </div>
          
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeNotification(notification.id)"
              class="inline-flex text-charcoal-400 hover:text-charcoal-600 focus:outline-none focus:text-charcoal-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Progress bar for auto-dismiss notifications -->
        <div
          v-if="notification.autoRemove !== false && notification.duration"
          class="mt-2 w-full bg-gray-200 rounded-full h-1"
        >
          <div
            class="bg-current h-1 rounded-full transition-all ease-linear"
            :class="getProgressClasses(notification.type)"
            :style="{ 
              width: '100%',
              animation: `shrink ${notification.duration || 5000}ms linear forwards`
            }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useAppStore } from '../../stores/app'

// Import Heroicons
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'NotificationToast',
  components: {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    XMarkIcon
  },
  setup() {
    const appStore = useAppStore()
    const { notifications } = storeToRefs(appStore)
    
    const getNotificationClasses = (type) => {
      const classes = {
        success: 'border-emerald-500 bg-gray-50',
        error: 'border-red-500 bg-red-50',
        warning: 'border-yellow-500 bg-yellow-50',
        info: 'border-blue-500 bg-blue-50'
      }
      return classes[type] || classes.info
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        success: 'CheckCircleIcon',
        error: 'XCircleIcon',
        warning: 'ExclamationTriangleIcon',
        info: 'InformationCircleIcon'
      }
      return icons[type] || icons.info
    }
    
    const getIconClasses = (type) => {
      const classes = {
        success: 'text-gray-600',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
      }
      return classes[type] || classes.info
    }
    
    const getTitleClasses = (type) => {
      const classes = {
        success: 'text-gray-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800'
      }
      return classes[type] || classes.info
    }
    
    const getProgressClasses = (type) => {
      const classes = {
        success: 'text-gray-600',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
      }
      return classes[type] || classes.info
    }
    
    const getDefaultTitle = (type) => {
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      }
      return titles[type] || 'Notification'
    }
    
    const removeNotification = (id) => {
      appStore.removeNotification(id)
    }
    
    return {
      notifications,
      getNotificationClasses,
      getNotificationIcon,
      getIconClasses,
      getTitleClasses,
      getProgressClasses,
      getDefaultTitle,
      removeNotification
    }
  }
}
</script>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .fixed {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-l-4 {
    border-left-width: 6px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none !important;
  }
  
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
}
</style>
