// Date and time utilities
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj)
}

export const formatDateTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj)
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateObj)
}

// Currency formatting
export const formatCurrency = (amount, currency = 'AED') => {
  if (amount === null || amount === undefined) return ''
  
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Emirates ID validation
export const validateEmiratesId = (emiratesId) => {
  if (!emiratesId) return { isValid: false, message: 'Emirates ID is required' }
  
  // Remove spaces and dashes
  const cleanId = emiratesId.replace(/[\s-]/g, '')
  
  // Check format: 15 digits
  if (!/^\d{15}$/.test(cleanId)) {
    return { 
      isValid: false, 
      message: 'Emirates ID must be 15 digits (format: 784-YYYY-XXXXXXX-X)' 
    }
  }
  
  // Check if starts with 784
  if (!cleanId.startsWith('784')) {
    return { 
      isValid: false, 
      message: 'Emirates ID must start with 784' 
    }
  }
  
  return { isValid: true, formatted: formatEmiratesId(cleanId) }
}

export const formatEmiratesId = (emiratesId) => {
  if (!emiratesId) return ''
  
  const cleanId = emiratesId.replace(/[\s-]/g, '')
  if (cleanId.length !== 15) return emiratesId
  
  return `${cleanId.slice(0, 3)}-${cleanId.slice(3, 7)}-${cleanId.slice(7, 14)}-${cleanId.slice(14)}`
}

export const maskEmiratesId = (emiratesId) => {
  if (!emiratesId) return ''
  
  const formatted = formatEmiratesId(emiratesId)
  return formatted.replace(/(\d{3}-\d{4}-)\d{7}(-\d)/, '$1*******$2')
}

// Phone number validation and formatting
export const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: false, message: 'Phone number is required' }
  
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // UAE phone number formats
  const uaePatterns = [
    /^971\d{8,9}$/, // +971XXXXXXXXX
    /^0\d{8,9}$/, // 0XXXXXXXXX
    /^\d{8,9}$/ // XXXXXXXXX
  ]
  
  const isValid = uaePatterns.some(pattern => pattern.test(cleanPhone))
  
  if (!isValid) {
    return { 
      isValid: false, 
      message: 'Please enter a valid UAE phone number' 
    }
  }
  
  return { isValid: true, formatted: formatPhoneNumber(cleanPhone) }
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // Format UAE numbers
  if (cleanPhone.startsWith('971')) {
    // +971 XX XXX XXXX
    return `+${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`
  } else if (cleanPhone.startsWith('0')) {
    // 0XX XXX XXXX
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
  } else {
    // XX XXX XXXX
    return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`
  }
}

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

export const isImageFile = (file) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const extension = typeof file === 'string' ? getFileExtension(file) : getFileExtension(file.name)
  return imageTypes.includes(extension)
}

// Text utilities
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

export const capitalizeFirst = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const generateInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : 'G'
  const last = lastName ? lastName.charAt(0).toUpperCase() : 'U'
  return `${first}${last}`
}

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value)
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString) => {
  const params = {}
  const searchParams = new URLSearchParams(queryString)
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  
  return params
}

// Local storage utilities with JSON support
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return defaultValue
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  },
  
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

// Device detection utilities
export const device = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  isTouchDevice: () => 'ontouchstart' in window,
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () => /Android/.test(navigator.userAgent),
  isSafari: () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  isStandalone: () => window.matchMedia('(display-mode: standalone)').matches
}

// Camera and media utilities
export const media = {
  async checkCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return { hasPermission: true, error: null }
    } catch (error) {
      return { 
        hasPermission: false, 
        error: error.name === 'NotAllowedError' ? 'Camera access denied' : 'Camera not available' 
      }
    }
  },
  
  async getCameraStream(constraints = { video: { facingMode: 'environment' } }) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      throw new Error(error.name === 'NotAllowedError' ? 'Camera access denied' : 'Camera not available')
    }
  }
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Color utilities for status badges
export const getStatusColor = (status) => {
  const colors = {
    'Available': 'emerald',
    'Issued': 'gold',
    'Expired': 'red',
    'Draft': 'gray',
    'Active': 'emerald',
    'Inactive': 'red',
    'Pending': 'yellow',
    'Completed': 'emerald',
    'Error': 'red'
  }
  
  return colors[status] || 'gray'
}
