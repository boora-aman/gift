import { useNotifications } from './useNotifications'

/**
 * Toast composable - wrapper around useNotifications for consistency
 */
export function useToast() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    removeNotification,
    clearAllNotifications,
    notifications
  } = useNotifications()

  // Alias showNotification to showToast for consistency
  const showToast = (message, type = 'info', duration = 5000) => {
    return showNotification(message, type, duration)
  }

  return {
    // Toast methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Utility methods
    removeNotification,
    clearAllNotifications,
    notifications
  }
}