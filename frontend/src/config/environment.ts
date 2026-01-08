// Environment configuration for Frappe backend
// Single source of truth: VITE_API_BASE_URL from .env file

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://bn780x9p-8000.inc1.devtunnels.ms';

export const config = {
  // In dev, Vite proxy handles routing, so use relative URLs
  // In production, use the full backend URL
  apiBaseUrl: import.meta.env.DEV ? '' : BACKEND_URL,
  
  // Full backend URL (always available for reference)
  backendUrl: BACKEND_URL,
  
  // Full API endpoint for Frappe REST API
  get apiEndpoint() {
    return `${this.apiBaseUrl}/api/resource`
  },
  
  // Method endpoint for custom API calls
  get methodEndpoint() {
    return `${this.apiBaseUrl}/api/method`
  },
  
  // Check environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

// Extend window interface for Frappe CSRF token
declare global {
  interface Window {
    csrf_token?: string
  }
}
