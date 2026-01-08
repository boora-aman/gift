import axios, { AxiosInstance, AxiosError } from 'axios'
import { config } from '../config/environment'
import { getAuthHeader } from '../lib/tokenAuth'
import type { 
  Gift, 
  GiftCategory, 
  GiftRecipient, 
  GiftIssue,
  GiftInterest,
  GiftReceipt,
  GiftMaintenance,
  GiftDispatch,
  FrappeListResponse,
  FrappeDocResponse,
  ApiResponse,
  DashboardStats
} from '../types/gift'
import type { Event } from '../types/event'

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (requestConfig) => {
    // Check for token-based auth first (bypasses cookie issues)
    const authHeader = getAuthHeader()
    if (authHeader) {
      requestConfig.headers['Authorization'] = authHeader
    }
    
    // Add CSRF token (prefer window.csrf_token, fallback to csrf_token cookie)
    const csrfToken = window.csrf_token || getCookie('csrf_token')
    if (csrfToken) {
      requestConfig.headers['X-Frappe-CSRF-Token'] = csrfToken
    }

    // Add timestamp to GET requests to prevent caching
    if (requestConfig.method === 'get') {
      requestConfig.params = { ...requestConfig.params, _t: Date.now() }
    }

    return requestConfig
  },
  (error) => Promise.reject(error)
)

// Response interceptor - only redirect on 401 (not 403)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as any
    
    // Only redirect on 401 (Unauthorized) - not on 403 (Forbidden/Permission denied)
    // 403 means logged in but lacks permission - don't redirect to login
    if (status === 401 && window.location.pathname !== '/login') {
      // Clear local storage and redirect
      localStorage.removeItem('frappe_user')
      localStorage.removeItem('frappe_fullname')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// Helper to parse Frappe server messages
const parseFrappeError = (data: any): string | null => {
  // Try to parse _server_messages (JSON array of JSON strings)
  if (data?._server_messages) {
    try {
      const messages = JSON.parse(data._server_messages)
      if (Array.isArray(messages) && messages.length > 0) {
        const firstMsg = JSON.parse(messages[0])
        return firstMsg.message || firstMsg.title || null
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }
  
  // Try exc_type or exception
  if (data?.exc_type) return data.exc_type
  if (data?.exception) return data.exception
  if (data?.message) return data.message
  
  return null
}

// Helper to handle API errors with better Frappe error parsing
const handleError = (error: unknown, defaultMessage = 'An error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    
    // Try to get Frappe-specific error message
    const frappeError = parseFrappeError(data)
    if (frappeError) return frappeError

    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required. Please log in.'
      case 403:
        // Check if this is likely a cookie/session issue vs real permission issue
        const hasStoredUser = !!localStorage.getItem('frappe_user')
        if (hasStoredUser) {
          return 'Permission denied. Session cookie may not be sent. Try using API Token auth at /debug/connection'
        }
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 417:
        return 'Query field not permitted. Check your filters/fields.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return defaultMessage
    }
  }
  return defaultMessage
}

// Basic cookie reader (for csrf_token)
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

// URL encode doctype name for Frappe REST API
const encodeDoctype = (doctype: string): string => encodeURIComponent(doctype)

// ============ Auth API ============
export const AuthAPI = {
  /**
   * Login using Frappe's standard login endpoint
   * Session is maintained via cookies (sid, csrf_token)
   */
  async login(username: string, password: string): Promise<ApiResponse<{ user: string; fullName?: string }>> {
    try {
      const body = new URLSearchParams({ usr: username, pwd: password })
      const loginRes = await api.post<{ message: string; full_name?: string }>('/api/method/login', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      // Login successful - extract user info from response
      const user = username
      const fullName = loginRes.data?.full_name || username
      
      // Get CSRF token from cookie (set by Frappe after login)
      const csrf = getCookie('csrf_token')
      if (csrf) window.csrf_token = csrf

      // Store user info in localStorage for UI display only (not for auth)
      localStorage.setItem('frappe_user', user)
      localStorage.setItem('frappe_fullname', fullName)

      // Verify session is working by calling get_logged_user
      try {
        const verifyRes = await api.get<{ message: string }>('/api/method/frappe.auth.get_logged_user')
        console.log('Session verified:', verifyRes.data?.message)
      } catch (verifyErr) {
        console.warn('Session verification failed:', verifyErr)
      }

      return { success: true, data: { user, fullName } }
    } catch (error: any) {
      return { success: false, error: handleError(error, 'Login failed') }
    }
  },

  /**
   * Logout using Frappe's standard logout endpoint
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/method/logout')
      window.csrf_token = undefined
      localStorage.removeItem('frappe_user')
      localStorage.removeItem('frappe_fullname')
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Logout failed') }
    }
  },

  /**
   * Check if session is valid by making a lightweight REST API call
   * Uses /api/resource/Gift with minimal fields - if it returns 200, session is valid
   * Returns the cached username from localStorage (session validity confirmed by REST call)
   */
  async getLoggedUser(): Promise<ApiResponse<string>> {
    try {
      // Make a lightweight REST call to verify session is valid
      await api.get('/api/resource/Gift', { 
        params: { 
          fields: JSON.stringify(['name']), 
          limit_page_length: 1 
        } 
      })
      
      // Session is valid - return cached user
      const cachedUser = localStorage.getItem('frappe_user')
      if (cachedUser) {
        return { success: true, data: cachedUser }
      }
      
      // No cached user but session is valid (edge case)
      return { success: false, error: 'No user session found' }
    } catch (error: any) {
      // Check if it's a permission error (403) vs auth error (401)
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        // Logged in but no permission to Gift - try another doctype or accept as logged in
        const cachedUser = localStorage.getItem('frappe_user')
        if (cachedUser) {
          return { success: true, data: cachedUser }
        }
      }
      return { success: false, error: handleError(error, 'Not logged in') }
    }
  },
}

// ============ Gift API ============
export const GiftAPI = {
  async list(filters: Record<string, string> = {}, page = 1, limit = 20): Promise<ApiResponse<Gift[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: limit,
        limit_start: (page - 1) * limit,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<Gift>>(`/api/resource/Gift`, { params })
      
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gifts') }
    }
  },

  async get(name: string): Promise<ApiResponse<Gift>> {
    try {
      const response = await api.get<FrappeDocResponse<Gift>>(`/api/resource/Gift/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift') }
    }
  },

  async create(data: Partial<Gift>): Promise<ApiResponse<Gift>> {
    try {
      const response = await api.post<FrappeDocResponse<Gift>>('/api/resource/Gift', data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create gift') }
    }
  },

  async update(name: string, data: Partial<Gift>): Promise<ApiResponse<Gift>> {
    try {
      const response = await api.put<FrappeDocResponse<Gift>>(`/api/resource/Gift/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update gift') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/Gift/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete gift') }
    }
  },
}

// ============ Gift Category API ============
export const GiftCategoryAPI = {
  async list(): Promise<ApiResponse<GiftCategory[]>> {
    try {
      const response = await api.get<FrappeListResponse<GiftCategory>>(`/api/resource/${encodeDoctype('Gift Category')}`, {
        params: {
          fields: JSON.stringify(['*']),
          limit_page_length: 0,
          order_by: 'category_name asc'
        }
      })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch categories') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftCategory>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftCategory>>(`/api/resource/${encodeDoctype('Gift Category')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch category') }
    }
  },

  async create(data: Partial<GiftCategory>): Promise<ApiResponse<GiftCategory>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftCategory>>(`/api/resource/${encodeDoctype('Gift Category')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create category') }
    }
  },

  async update(name: string, data: Partial<GiftCategory>): Promise<ApiResponse<GiftCategory>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftCategory>>(`/api/resource/${encodeDoctype('Gift Category')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update category') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Category')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete category') }
    }
  },
}

// ============ Gift Recipient API ============
export const GiftRecipientAPI = {
  async list(search?: string): Promise<ApiResponse<GiftRecipient[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'owner_full_name asc'
      }
      
      if (search) {
        params.filters = JSON.stringify([
          ['owner_full_name', 'like', `%${search}%`]
        ])
      }
      
      const response = await api.get<FrappeListResponse<GiftRecipient>>(`/api/resource/${encodeDoctype('Gift Recipient')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch recipients') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftRecipient>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftRecipient>>(`/api/resource/${encodeDoctype('Gift Recipient')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch recipient') }
    }
  },

  async create(data: Partial<GiftRecipient>): Promise<ApiResponse<GiftRecipient>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftRecipient>>(`/api/resource/${encodeDoctype('Gift Recipient')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create recipient') }
    }
  },

  async update(name: string, data: Partial<GiftRecipient>): Promise<ApiResponse<GiftRecipient>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftRecipient>>(`/api/resource/${encodeDoctype('Gift Recipient')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update recipient') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Recipient')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete recipient') }
    }
  },
}

// ============ Gift Issue API ============
export const GiftIssueAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<GiftIssue[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<GiftIssue>>(`/api/resource/${encodeDoctype('Gift Issue')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift issues') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftIssue>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftIssue>>(`/api/resource/${encodeDoctype('Gift Issue')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift issue') }
    }
  },

  async create(data: Partial<GiftIssue>): Promise<ApiResponse<GiftIssue>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftIssue>>(`/api/resource/${encodeDoctype('Gift Issue')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create gift issue') }
    }
  },

  async update(name: string, data: Partial<GiftIssue>): Promise<ApiResponse<GiftIssue>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftIssue>>(`/api/resource/${encodeDoctype('Gift Issue')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update gift issue') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Issue')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete gift issue') }
    }
  },
}

// ============ Gift Interest API ============
export const GiftInterestAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<GiftInterest[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<GiftInterest>>(`/api/resource/${encodeDoctype('Gift Interest')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift interests') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftInterest>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftInterest>>(`/api/resource/${encodeDoctype('Gift Interest')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift interest') }
    }
  },

  async create(data: Partial<GiftInterest>): Promise<ApiResponse<GiftInterest>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftInterest>>(`/api/resource/${encodeDoctype('Gift Interest')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create gift interest') }
    }
  },

  async update(name: string, data: Partial<GiftInterest>): Promise<ApiResponse<GiftInterest>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftInterest>>(`/api/resource/${encodeDoctype('Gift Interest')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update gift interest') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Interest')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete gift interest') }
    }
  },
}

// ============ Gift Receipt API ============
export const GiftReceiptAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<GiftReceipt[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<GiftReceipt>>(`/api/resource/${encodeDoctype('Gift Receipt')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift receipts') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftReceipt>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftReceipt>>(`/api/resource/${encodeDoctype('Gift Receipt')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch gift receipt') }
    }
  },

  async create(data: Partial<GiftReceipt>): Promise<ApiResponse<GiftReceipt>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftReceipt>>(`/api/resource/${encodeDoctype('Gift Receipt')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create gift receipt') }
    }
  },

  async update(name: string, data: Partial<GiftReceipt>): Promise<ApiResponse<GiftReceipt>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftReceipt>>(`/api/resource/${encodeDoctype('Gift Receipt')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update gift receipt') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Receipt')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete gift receipt') }
    }
  },
}

// ============ Gift Maintenance API ============
export const GiftMaintenanceAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<GiftMaintenance[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<GiftMaintenance>>(`/api/resource/${encodeDoctype('Gift Maintenance')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch maintenance records') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftMaintenance>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftMaintenance>>(`/api/resource/${encodeDoctype('Gift Maintenance')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch maintenance record') }
    }
  },

  async create(data: Partial<GiftMaintenance>): Promise<ApiResponse<GiftMaintenance>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftMaintenance>>(`/api/resource/${encodeDoctype('Gift Maintenance')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create maintenance record') }
    }
  },

  async update(name: string, data: Partial<GiftMaintenance>): Promise<ApiResponse<GiftMaintenance>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftMaintenance>>(`/api/resource/${encodeDoctype('Gift Maintenance')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update maintenance record') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Maintenance')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete maintenance record') }
    }
  },
}

// ============ Gift Dispatch API ============
export const GiftDispatchAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<GiftDispatch[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'creation desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<GiftDispatch>>(`/api/resource/${encodeDoctype('Gift Dispatch')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch dispatches') }
    }
  },

  async get(name: string): Promise<ApiResponse<GiftDispatch>> {
    try {
      const response = await api.get<FrappeDocResponse<GiftDispatch>>(`/api/resource/${encodeDoctype('Gift Dispatch')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch dispatch') }
    }
  },

  async create(data: Partial<GiftDispatch>): Promise<ApiResponse<GiftDispatch>> {
    try {
      const response = await api.post<FrappeDocResponse<GiftDispatch>>(`/api/resource/${encodeDoctype('Gift Dispatch')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create dispatch') }
    }
  },

  async update(name: string, data: Partial<GiftDispatch>): Promise<ApiResponse<GiftDispatch>> {
    try {
      const response = await api.put<FrappeDocResponse<GiftDispatch>>(`/api/resource/${encodeDoctype('Gift Dispatch')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update dispatch') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Dispatch')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete dispatch') }
    }
  },
}

// ============ Dashboard Stats ============
export const DashboardAPI = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Fetch counts in parallel
      const [giftsRes, availableRes, issuedRes, recipientsRes, categoriesRes] = await Promise.all([
        api.get<FrappeListResponse<Gift>>('/api/resource/Gift', { 
          params: { 
            limit_page_length: 0, 
            fields: JSON.stringify(['name']) 
          } 
        }),
        api.get<FrappeListResponse<Gift>>('/api/resource/Gift', { 
          params: { 
            limit_page_length: 0, 
            fields: JSON.stringify(['name']), 
            filters: JSON.stringify([['status', '=', 'Available']]) 
          } 
        }),
        api.get<FrappeListResponse<Gift>>('/api/resource/Gift', { 
          params: { 
            limit_page_length: 0, 
            fields: JSON.stringify(['name']), 
            filters: JSON.stringify([['status', '=', 'Issued']]) 
          } 
        }),
        api.get<FrappeListResponse<GiftRecipient>>(`/api/resource/${encodeDoctype('Gift Recipient')}`, { 
          params: { 
            limit_page_length: 0, 
            fields: JSON.stringify(['name']) 
          } 
        }),
        api.get<FrappeListResponse<GiftCategory>>(`/api/resource/${encodeDoctype('Gift Category')}`, { 
          params: { 
            limit_page_length: 0, 
            fields: JSON.stringify(['name']) 
          } 
        }),
      ])
      
      return {
        success: true,
        data: {
          totalGifts: giftsRes.data.data?.length || 0,
          availableGifts: availableRes.data.data?.length || 0,
          issuedGifts: issuedRes.data.data?.length || 0,
          totalRecipients: recipientsRes.data.data?.length || 0,
          totalCategories: categoriesRes.data.data?.length || 0,
        }
      }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch dashboard stats') }
    }
  }
}

// ============ Event API (Gift Event doctype) ============
export const EventAPI = {
  async list(filters: Record<string, string> = {}): Promise<ApiResponse<Event[]>> {
    try {
      const params: Record<string, string | number> = {
        fields: JSON.stringify(['*']),
        limit_page_length: 0,
        order_by: 'starts_on desc'
      }
      
      if (Object.keys(filters).length > 0) {
        const filterArray = Object.entries(filters).map(([key, value]) => [key, '=', value])
        params.filters = JSON.stringify(filterArray)
      }
      
      const response = await api.get<FrappeListResponse<Event>>(`/api/resource/${encodeDoctype('Gift Event')}`, { params })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch events') }
    }
  },

  async get(name: string): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get<FrappeDocResponse<Event>>(`/api/resource/${encodeDoctype('Gift Event')}/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch event') }
    }
  },

  async create(data: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const response = await api.post<FrappeDocResponse<Event>>(`/api/resource/${encodeDoctype('Gift Event')}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to create event') }
    }
  },

  async update(name: string, data: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const response = await api.put<FrappeDocResponse<Event>>(`/api/resource/${encodeDoctype('Gift Event')}/${encodeURIComponent(name)}`, data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update event') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Gift Event')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete event') }
    }
  },
}

// ============ File Upload API ============
export const FileAPI = {
  async upload(file: File, isPrivate = false): Promise<ApiResponse<{ file_url: string }>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('is_private', isPrivate ? '1' : '0')
      formData.append('folder', 'Home/Attachments')
      
      const response = await api.post<{ message: { file_url: string } }>('/api/method/upload_file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      return { success: true, data: response.data.message }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to upload file') }
    }
  }
}

// ============ Gift Search by Barcode ============
export const GiftSearchAPI = {
  async findByBarcode(barcode: string): Promise<ApiResponse<Gift | null>> {
    try {
      // Search by barcode_value field
      const response = await api.get<FrappeListResponse<Gift>>('/api/resource/Gift', {
        params: {
          fields: JSON.stringify(['*']),
          filters: JSON.stringify([['barcode_value', '=', barcode]]),
          limit_page_length: 1
        }
      })
      
      if (response.data.data && response.data.data.length > 0) {
        return { success: true, data: response.data.data[0] }
      }
      
      // Try searching by QR code value
      const qrResponse = await api.get<FrappeListResponse<Gift>>('/api/resource/Gift', {
        params: {
          fields: JSON.stringify(['*']),
          filters: JSON.stringify([['qr_code_value', '=', barcode]]),
          limit_page_length: 1
        }
      })
      
      if (qrResponse.data.data && qrResponse.data.data.length > 0) {
        return { success: true, data: qrResponse.data.data[0] }
      }
      
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to search gift') }
    }
  }
}

export { api }

// ============ Reports API ============
export interface ReportResult {
  data: Record<string, any>[]
  total: number
  page?: number
  total_pages?: number
}

export const ReportsAPI = {
  // Generic report fetcher - uses GET with query params
  async fetchReport(method: string, filters: Record<string, any> = {}): Promise<ApiResponse<ReportResult>> {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
      )
      // Use GET request with query parameters as per API docs
      const response = await api.get(`/api/method/gift.api.reports.${method}`, {
        params: cleanFilters
      })
      return { success: true, data: response.data.message }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch report') }
    }
  },

  // Download CSV - uses separate export endpoint
  downloadCSV(method: string, filters: Record<string, any> = {}) {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
    // Remove page/limit for CSV export (exports all records)
    delete cleanFilters.page
    delete cleanFilters.limit
    
    // Convert get_*_report to export_*_to_csv
    const csvMethod = method.replace('get_', 'export_').replace('_report', '_to_csv')
    const params = new URLSearchParams(cleanFilters as Record<string, string>)
    const url = `${config.backendUrl}/api/method/gift.api.reports.${csvMethod}?${params.toString()}`
    window.open(url, '_blank')
  },

  // Convenience methods for specific reports
  getGiftInterestReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_gift_interest_report', filters),
  
  getGiftIssueReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_gift_issue_report', filters),
  
  getGiftRecipientReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_gift_recipient_report', filters),
  
  getBarcodePrintReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_barcode_print_report', filters),
  
  getGiftMaintenanceReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_gift_maintenance_report', filters),
  
  getGiftDispatchReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_gift_dispatch_report', filters),
  
  getPendingDeliveryReport: (filters: Record<string, any> = {}) =>
    ReportsAPI.fetchReport('get_pending_delivery_report', filters),
}

// ============ Notification Log Types ============
export interface NotificationLog {
  name: string
  subject: string
  email_content?: string
  document_type?: string
  document_name?: string
  type?: string
  read?: number
  creation: string
  for_user?: string
}

// ============ Notification API ============
export const NotificationAPI = {
  async list(): Promise<ApiResponse<NotificationLog[]>> {
    try {
      const response = await api.get<FrappeListResponse<NotificationLog>>(`/api/resource/${encodeDoctype('Notification Log')}`, {
        params: {
          fields: JSON.stringify(['*']),
          limit_page_length: 50,
          order_by: 'creation desc'
        }
      })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch notifications') }
    }
  },

  async markRead(name: string): Promise<ApiResponse<NotificationLog>> {
    try {
      const response = await api.put<FrappeDocResponse<NotificationLog>>(`/api/resource/${encodeDoctype('Notification Log')}/${encodeURIComponent(name)}`, {
        read: 1
      })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to mark notification as read') }
    }
  },

  async markAllRead(): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/method/frappe.desk.doctype.notification_log.notification_log.mark_all_as_read')
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to mark all notifications as read') }
    }
  },

  async delete(name: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/resource/${encodeDoctype('Notification Log')}/${encodeURIComponent(name)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to delete notification') }
    }
  }
}

// ============ User Types ============
export interface FrappeUser {
  name: string
  email: string
  full_name: string
  enabled: number
  roles?: { role: string }[]
}

// ============ User API ============
export const UserAPI = {
  // Get current user's roles from Frappe
  async getRoles(): Promise<ApiResponse<string[]>> {
  try {
    // Get current user email first
    const userRes = await api.get<{ message: string }>('/api/method/frappe.auth.get_logged_user')
    const userEmail = userRes.data.message
    
    // Fetch user document with roles
    const response = await api.get<{ data: FrappeUser }>(`/api/resource/User/${encodeURIComponent(userEmail)}`, {
      params: {
        fields: JSON.stringify(['name', 'roles'])
      }
    })
    
    const roles = response.data.data.roles?.map(r => r.role) || []
    return { success: true, data: roles }
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch roles') }
  }
},


  // Get list of all users (admin only)
  async list(): Promise<ApiResponse<FrappeUser[]>> {
    try {
      const response = await api.get<FrappeListResponse<FrappeUser>>('/api/resource/User', {
        params: {
          fields: JSON.stringify(['name', 'email', 'full_name', 'enabled']),
          filters: JSON.stringify([['user_type', '=', 'System User']]),
          limit_page_length: 0,
          order_by: 'full_name asc'
        }
      })
      return { success: true, data: response.data.data || [] }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch users') }
    }
  },

  // Get a single user with their roles
  async get(name: string): Promise<ApiResponse<FrappeUser>> {
    try {
      const response = await api.get<FrappeDocResponse<FrappeUser>>(`/api/resource/User/${encodeURIComponent(name)}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to fetch user') }
    }
  },

  // Update user full name
  async updateFullName(userId: string, fullName: string): Promise<ApiResponse<FrappeUser>> {
    try {
      const response = await api.put<FrappeDocResponse<FrappeUser>>(`/api/resource/User/${encodeURIComponent(userId)}`, {
        full_name: fullName
      })
      // Update localStorage if it's the current user
      const currentUser = localStorage.getItem('frappe_user')
      if (currentUser === userId) {
        localStorage.setItem('frappe_fullname', fullName)
      }
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update name') }
    }
  },

  // Update password using Frappe's password update method
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/method/frappe.core.doctype.user.user.update_password', {
        old_password: currentPassword,
        new_password: newPassword
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to update password') }
    }
  },

  // Add role to user (admin only)
  async addRole(userId: string, role: string): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/method/frappe.client.insert', {
        doc: {
          doctype: 'Has Role',
          parent: userId,
          parenttype: 'User',
          parentfield: 'roles',
          role: role
        }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to add role') }
    }
  },

  // Remove role from user (admin only) 
  async removeRole(userId: string, role: string): Promise<ApiResponse<void>> {
    try {
      // First get the user to find the role entry
      const userRes = await api.get<FrappeDocResponse<any>>(`/api/resource/User/${encodeURIComponent(userId)}`)
      const user = userRes.data.data
      const roleEntry = user.roles?.find((r: any) => r.role === role)
      
      if (roleEntry) {
        await api.post('/api/method/frappe.client.delete', {
          doctype: 'Has Role',
          name: roleEntry.name
        })
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to remove role') }
    }
  },

  // Create a new user (admin only)
  // Create a new user (admin only)
async create(email: string, fullName: string, roles: string[] = []): Promise<ApiResponse<FrappeUser>> {
  try {
    // Split full name into first_name and last_name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || fullName
    const lastName = nameParts.slice(1).join(' ') || ''
    
    const response = await api.post<FrappeDocResponse<FrappeUser>>('/api/resource/User', {
      email: email,
      first_name: firstName,
      last_name: lastName,
      send_welcome_email: 1,
      user_type: 'System User',
      roles: roles.map(r => ({ role: r }))
    })
    return { success: true, data: response.data.data }
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to create user') }
  }
},
  // Disable user (admin only)
  async disable(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.put(`/api/resource/User/${encodeURIComponent(userId)}`, {
        enabled: 0
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to disable user') }
    }
  },

  // Enable user (admin only)
  async enable(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.put(`/api/resource/User/${encodeURIComponent(userId)}`, {
        enabled: 1
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: handleError(error, 'Failed to enable user') }
    }
  }
}

// ============ DocType Metadata API ============

const FALLBACK_OPTIONS: Record<string, Record<string, string[]>> = {
  'Gift Category': {
    'category_type': ['Physical Item', 'Livestock/Animal', 'Vehicle', 'Electronics', 'Jewelry', 'Artwork', 'Real Estate', 'Other']
  },
  'Gift Maintenance': {
    'maintenance_type': ['Health Checkup', 'Feeding', 'Grooming', 'Medical Treatment', 'Vaccination', 'Repair', 'Cleaning', 'Other'],
    'provider_type': ['Internal', 'External Vet', 'External Service'],
    'payment_status': ['Pending', 'Paid', 'Partially Paid']
  },
  'Gift Dispatch': {
    'dispatch_type': ['Gift Issue', 'Event', 'Maintenance', 'Transfer'],
    'dispatch_status': ['Prepared', 'Pending', 'In Transit', 'Delivered', 'Returned'],
    'transport_mode': ['Company Vehicle', 'Private Vehicle', 'Shipping', 'Air Freight', 'Other']
  },
  'Gift Issue': {
    'status': ['Dispatched', 'Delivered']
  },
  'Gift Interest': {
    'follow_up_status': ['New', 'Contacted', 'Follow Up Required', 'Converted to Issue', 'Not Interested', 'Lost'],
    'interest_level': ['Very Interested', 'Interested', 'Just Browsing', 'Reserved'],
    'interest_source': ['Walk-in', 'Phone Call', 'Email', 'Website', 'Social Media', 'Referral', 'Event', 'Other']
  },
  'Gift': {
    'status': ['Available', 'Dispatched', 'In Use', 'Under Maintenance', 'Reserved', 'Retired'],
    'health_status': ['Healthy', 'Needs Checkup', 'Under Treatment', 'Recovering', 'Critical', 'Quarantine']
  },
    'Gift Receipt': {
    'receipt_status': ['Pending Inspection', 'Approved', 'Quarantine', 'Rejected'],
    'inspection_result': ['Pass', 'Fail', 'Conditional Pass']
  },
  'Event': {
    'status': ['Open', 'Completed', 'Closed', 'Cancelled'],
    'event_type_gift': ['Exhibition', 'Display', 'Auction', 'Distribution', 'Other']
  }
}


export const DocTypeAPI = {
  // Get field options for a specific field in a DocType
  async getFieldOptions(doctype: string, fieldname: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.get<{ message: string[] }>(
        '/api/method/gift.gift.api.get_field_options',
        {
          params: { doctype, fieldname }
        }
      )
      
      return { 
        success: true, 
        data: response.data.message || [] 
      }
    } catch (error: any) {
      console.warn(`API failed for ${doctype}.${fieldname}, using fallback options`)
      
      // Use fallback options
      const fallback = FALLBACK_OPTIONS[doctype]?.[fieldname] || []
      return { success: true, data: fallback }
    }
  },
}

export const WarehouseAPI = {
  async list(filters?: Record<string, any>): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get<{ message: any[] }>(
        '/api/resource/Warehouse',
        { params: { filters: JSON.stringify(filters || {}), fields: '["name", "warehouse_name"]' } }
      )
      return { success: true, data: response.data.message }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch warehouses' }
    }
  },
}

