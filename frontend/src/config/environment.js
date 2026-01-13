// Environment configuration for the Gift Management app
export const config = {
  // API configuration - use relative URLs with proxy for development
  apiBaseUrl: '/api/method',
  baseUrl: '', // Empty for relative URLs
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App configuration
  appName: 'Gift Management',
  appVersion: '1.0.0',
  
  // Feature flags
  features: {
    qrScanner: true,
    fileUpload: true,
    notifications: true,
    offlineMode: false
  },
  
  // UI configuration
  ui: {
    itemsPerPage: 20,
    debounceDelay: 300,
    toastDuration: 3000
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    folder: 'Home/Attachments'
  }
}

// Export individual configs for convenience
export const { apiBaseUrl, baseUrl, isDevelopment, isProduction, features, ui, upload } = config

export default config