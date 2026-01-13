/**
 * Haptic feedback composable for scanner operations
 * Provides vibration feedback for scan success, errors, and detection events
 */

import { ref, reactive, readonly } from 'vue'

// Vibration patterns (in milliseconds)
const VIBRATION_PATTERNS = {
  success: [50, 50, 100], // Short-pause-long pattern for success
  error: [100, 100, 100, 100, 100], // Repeated short bursts for error
  detection: [30], // Very short pulse for detection
  longPress: [200], // Longer vibration for long press/manual input
}

// Settings
const vibrationSettings = reactive({
  enabled: true,
  intensity: 1.0, // Not directly supported by Vibration API, but can scale patterns
})

// Check for vibration support
const isVibrationSupported = () => {
  return 'vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator
}

// Check if device is likely mobile (vibration is mainly mobile feature)
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.matchMedia('(max-width: 768px)').matches ||
         window.matchMedia('(pointer: coarse)').matches ||
         ('ontouchstart' in window)
}

/**
 * Scale vibration pattern by intensity
 */
const scalePattern = (pattern, intensity = 1.0) => {
  if (!Array.isArray(pattern)) {
    return Math.floor(pattern * intensity)
  }
  
  return pattern.map(duration => Math.floor(duration * intensity))
}

/**
 * Execute vibration pattern
 */
const vibrate = (pattern) => {
  if (!vibrationSettings.enabled || !isVibrationSupported() || !isMobileDevice()) {
    return false
  }
  
  try {
    const scaledPattern = scalePattern(pattern, vibrationSettings.intensity)
    
    // Try different vendor prefixes
    if (navigator.vibrate) {
      navigator.vibrate(scaledPattern)
    } else if (navigator.mozVibrate) {
      navigator.mozVibrate(scaledPattern)
    } else if (navigator.webkitVibrate) {
      navigator.webkitVibrate(scaledPattern)
    }
    
    return true
  } catch (error) {
    console.warn('Vibration failed:', error)
    return false
  }
}

/**
 * Stop any ongoing vibration
 */
const stopVibration = () => {
  if (!isVibrationSupported()) return false
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(0)
    } else if (navigator.mozVibrate) {
      navigator.mozVibrate(0)
    } else if (navigator.webkitVibrate) {
      navigator.webkitVibrate(0)
    }
    return true
  } catch (error) {
    console.warn('Failed to stop vibration:', error)
    return false
  }
}

/**
 * Composable hook for haptic feedback
 */
export const useScannerHaptic = () => {
  const isSupported = ref(isVibrationSupported())
  const isMobile = ref(isMobileDevice())
  
  /**
   * Vibrate for successful scan
   */
  const vibrateSuccess = () => {
    return vibrate(VIBRATION_PATTERNS.success)
  }
  
  /**
   * Vibrate for scan error
   */
  const vibrateError = () => {
    return vibrate(VIBRATION_PATTERNS.error)
  }
  
  /**
   * Vibrate for barcode detection
   */
  const vibrateDetection = () => {
    return vibrate(VIBRATION_PATTERNS.detection)
  }
  
  /**
   * Vibrate for long press/manual input
   */
  const vibrateLongPress = () => {
    return vibrate(VIBRATION_PATTERNS.longPress)
  }
  
  /**
   * Custom vibration pattern
   */
  const vibrateCustom = (pattern) => {
    return vibrate(pattern)
  }
  
  /**
   * Enable/disable vibration
   */
  const setEnabled = (enabled) => {
    vibrationSettings.enabled = enabled
  }
  
  /**
   * Set vibration intensity (0.0 to 1.0)
   */
  const setIntensity = (intensity) => {
    vibrationSettings.intensity = Math.max(0, Math.min(1, intensity))
  }
  
  /**
   * Stop any ongoing vibration
   */
  const stop = () => {
    return stopVibration()
  }
  
  /**
   * Test vibration with a simple pattern
   */
  const test = () => {
    return vibrate([100, 100, 100])
  }
  
  return {
    // State
    isSupported: readonly(isSupported),
    isMobile: readonly(isMobile),
    
    // Methods
    vibrateSuccess,
    vibrateError,
    vibrateDetection,
    vibrateLongPress,
    vibrateCustom,
    setEnabled,
    setIntensity,
    stop,
    test,
    
    // Settings (reactive)
    settings: readonly(vibrationSettings)
  }
}

// Export for direct use
export default useScannerHaptic