import axios from 'axios'
import { config } from '../config/environment'

// Create API instance
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  withCredentials: true, // Important for Frappe session cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Frappe-CSRF-Token': window.csrf_token || ''
  }
})

// Log the API configuration for debugging
// console.log('API Configuration:', {
//   baseURL: config.apiBaseUrl,
//   backendBaseUrl: config.baseUrl,
//   isDevelopment: config.isDevelopment,
//   isProduction: config.isProduction
// })

// Request interceptor
api.interceptors.request.use(
  async (requestConfig) => {
    // Add timestamp to prevent caching issues
    if (requestConfig.method === 'get') {
      requestConfig.params = { ...requestConfig.params, _t: Date.now() }
    }
    requestConfig.headers['X-Frappe-CSRF-Token'] = window.csrf_token || ''

    return requestConfig
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()

      const refreshed = await authStore.refreshAuthToken()
      if (refreshed) {
        // Retry the original request
        return api(error.config)
      } else {
        // Redirect to login
        authStore.clearAuthData()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// API service classes
export class GiftAPI {
  // Get all gifts with pagination and filters
  static async list(filters = {}, page = 1, limit = 20) {
    try {
      const response = await api.get('/gift.api.get_gifts', {
        params: {
          ...filters,
          page,
          limit
        }
      })

      // Handle Frappe response format - check for .message first, then direct data
      const responseData = response.data.message || response.data

      return {
        success: true,
        data: responseData.data || responseData || [],
        total: responseData.total || 0,
        page: responseData.page || page,
        totalPages: responseData.total_pages || 1
      }
    } catch (error) {
      console.error('Gift list error:', error)
      return {
        success: false,
        error: ApiUtils.handleError(error)
      }
    }
  }

  // Get single gift by ID
  static async get(id) {
    try {
      const response = await api.get(`/gift.api.get_gift`, { params: { name: id } })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift get error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift'
      }
    }
  }

  // Get gift details with issue history
  static async getDetails(id) {
    try {
      const response = await api.get('/gift.gift.doctype.gift.gift.get_gift_details', {
        params: { gift_name: id }
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift details error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift details'
      }
    }
  }

  // Create new gift
  static async create(giftData) {
    try {
      const response = await api.post('/gift.api.create_gift', giftData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift create error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create gift'
      }
    }
  }

  // Update gift
  static async update(id, giftData) {
    try {
      const response = await api.post('/gift.api.update_gift', {
        name: id,
        ...giftData
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift update error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update gift'
      }
    }
  }

  // Delete gift
  static async delete(id) {
    try {
      const response = await api.post('/gift.api.delete_gift', { name: id })
      return {
        success: true,
        message: response.data.message || 'Gift deleted successfully'
      }
    } catch (error) {
      console.error('Gift delete error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete gift'
      }
    }
  }

  // Get gift by barcode/QR code
  static async getByCode(code) {
    try {
      const response = await api.get('/gift.api.get_gift_by_code', {
        params: { barcode_value: code }
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift by code error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Gift not found'
      }
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await api.get('/gift.api.get_dashboard_stats')
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics'
      }
    }
  }

  // Get gift categories
  static async getCategories() {
    try {
      const response = await api.get('/gift.api.get_categories')
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Get categories error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  }

  // Regenerate barcode for a gift
  static async regenerateBarcode(id) {
    try {
      const response = await api.post('/gift.api.regenerate_gift_barcode', { name: id })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift regenerate barcode error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to regenerate barcode'
      }
    }
  }

  // Update barcode value for a gift
  static async updateBarcodeValue(updateData) {
    try {
      const response = await api.post('/gift.api.update_gift_barcode', updateData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift update barcode error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update barcode'
      }
    }
  }
}

export class GiftCategoryAPI {
  // Get all gift categories
  static async list() {
    try {
      const response = await api.get('/frappe.client.get_list', {
        params: {
          doctype: 'Gift Category',
          fields: ['name', 'category_name'],
          order_by: 'category_name'
        }
      })
      return {
        success: true,
        data: response.data.message || []
      }
    } catch (error) {
      console.error('Gift category list error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift categories'
      }
    }
  }
}

export class GiftIssueAPI {
  // Get all gift dispatches with pagination and filters
  static async list(params = {}) {
    try {
      const response = await api.get('/gift.api.get_gift_issues', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0
      }
    } catch (error) {
      console.error('Gift dispatch list error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift dispatches'
      }
    }
  }

  // Get single gift dispatch by ID
  static async get(id) {
    try {
      const response = await api.get('/gift.api.get_gift_issue', { params: { name: id } })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift dispatch get error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift dispatch'
      }
    }
  }

  // Create new gift issue
  static async create(issueData) {
    try {
      const response = await api.post('/gift.api_v2.create_gift_issue_v2', issueData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift issue create error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to issue gift'
      }
    }
  }

  // Update gift dispatch
  static async update(id, issueData) {
    try {
      const response = await api.post('/gift.api.update_gift_issue', {
        name: id,
        ...issueData
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift dispatch update error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update gift dispatch'
      }
    }
  }

  // Delete gift dispatch (which will revert gift status)
  static async delete(id) {
    try {
      const response = await api.post('/gift.api.delete_gift_issue', { name: id })
      return {
        success: true,
        message: response.data.message || 'Gift dispatch deleted successfully'
      }
    } catch (error) {
      console.error('Gift dispatch delete error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete gift dispatch'
      }
    }
  }

  // Get gift dispatch history by gift ID
  static async getDispatchHistory(giftId) {
    try {
      const response = await api.get('/gift.api.get_gift_dispatch_history', {
        params: { gift_id: giftId }
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift dispatch history error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift dispatch history'
      }
    }
  }

  // Update delivery status
  static async updateDeliveryStatus(issueId, status, deliveryNote = null, deliveryDescription = null, deliveryDate = null) {
    try {
      const response = await api.post('/gift.api.update_gift_delivery_status', {
        issue_name: issueId,
        status: status,
        delivery_note: deliveryNote,
        delivery_description: deliveryDescription,
        delivery_date: deliveryDate
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift delivery status update error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update delivery status'
      }
    }
  }

  // Validate Emirates ID
  static async validateEmiratesId(emiratesId) {
    try {
      const response = await api.get('/gift.api.validate_emirates_id', {
        params: { emirates_id: emiratesId }
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Emirates ID validation error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to validate Emirates ID'
      }
    }
  }
}

export class FileAPI {
  // Upload file
  static async upload(file, isPrivate = false) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('is_private', isPrivate ? '1' : '0')
      formData.append('folder', 'Home/Attachments')

      // Use relative URL - proxy will handle routing to backend
      const response = await axios.post('/api/method/upload_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Frappe-CSRF-Token': window.csrf_token || ''
        },
        withCredentials: true
      })

      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload file'
      }
    }
  }

  // Delete file
  static async delete(fileUrl) {
    try {
      // First get the file document by file_url
      const fileDoc = await api.get('/method/frappe.client.get_list', {
        params: {
          doctype: 'File',
          filters: JSON.stringify([['file_url', '=', fileUrl]]),
          limit: 1
        }
      })

      if (fileDoc.data.message && fileDoc.data.message.length > 0) {
        const fileName = fileDoc.data.message[0].name
        // Delete the file document
        const response = await api.delete(`/document/File/${fileName}`)
        return {
          success: true,
          message: 'File deleted successfully'
        }
      } else {
        throw new Error('File not found')
      }
    } catch (error) {
      console.error('File delete error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete file'
      }
    }
  }
}

// Generic API utilities
export const ApiUtils = {
  // Handle API errors consistently
  handleError(error, defaultMessage = 'An error occurred') {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.'
    }

    if (error.response?.data?.message) {
      return error.response.data.message
    }

    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid request. Please check your input.'
        case 401:
          return 'Authentication required. Please log in.'
        case 403:
          return 'You do not have permission to perform this action.'
        case 404:
          return 'The requested resource was not found.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
          return 'Server error. Please try again later.'
        default:
          return defaultMessage
      }
    }

    return error.message || defaultMessage
  },

  // Build query parameters for API calls
  buildParams(filters = {}, pagination = {}, sorting = {}) {
    const params = {}

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value
      }
    })

    // Add pagination
    if (pagination.page) {
      params.page = pagination.page
    }
    if (pagination.limit) {
      params.limit = pagination.limit
    }

    // Add sorting
    if (sorting.field) {
      params.order_by = sorting.field
    }
    if (sorting.direction) {
      params.sort_order = sorting.direction
    }

    return params
  }
}

// User API service
export class UserAPI {
  // Get user profile information
  static async getProfile() {
    try {
      const response = await api.get('/gift.api.get_user_profile')
      return {
        success: true,
        data: response.data.message.user
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile'
      }
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const response = await api.post('/gift.api.update_user_profile', profileData)
      return {
        success: true,
        data: response.data.message.user,
        message: response.data.message.message
      }
    } catch (error) {
      console.error('Update user profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user profile'
      }
    }
  }

  // Get user statistics
  static async getStats() {
    try {
      const response = await api.get('/gift.api.get_user_stats')
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user statistics'
      }
    }
  }
}

export class GiftInterestAPI {
  // Get all gift interests with pagination and filters
  static async list(params = {}) {
    try {
      const response = await api.get('/gift.api.get_gift_interests', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0
      }
    } catch (error) {
      console.error('Gift interest list error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift interests'
      }
    }
  }

  // Get single gift interest by ID
  static async get(id) {
    try {
      const response = await api.get('/gift.api.get_gift_interest', { params: { name: id } })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift interest get error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift interest'
      }
    }
  }

  // Create new gift interest
  static async create(interestData) {
    try {
      const response = await api.post('/gift.api_v2.create_gift_interest_v2', interestData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift interest create error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create gift interest'
      }
    }
  }

  // Update gift interest
  static async update(id, interestData) {
    try {
      const response = await api.post('/gift.api.update_gift_interest', {
        name: id,
        ...interestData
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Gift interest update error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update gift interest'
      }
    }
  }

  // Delete gift interest
  static async delete(id) {
    try {
      const response = await api.post('/gift.api.delete_gift_interest', { name: id })
      return {
        success: true,
        message: response.data.message || 'Gift interest deleted successfully'
      }
    } catch (error) {
      console.error('Gift interest delete error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete gift interest'
      }
    }
  }

  // Get interests for a specific gift
  static async getByGift(giftId) {
    try {
      const response = await api.get('/gift.api.get_gift_interests', {
        params: { gift: giftId }
      })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0
      }
    } catch (error) {
      console.error('Gift interest by gift error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift interests'
      }
    }
  }
}

export class ReportsAPI {
  // Get Interest Shows report
  static async getInterestShowsReport(params = {}) {
    try {
      const response = await api.get('/gift.api.get_interest_shows_report', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Interest shows report error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch interest shows report'
      }
    }
  }

  // Get Dispatched Gifts report
  static async getDispatchedGiftsReport(params = {}) {
    try {
      const response = await api.get('/gift.api.get_dispatched_gifts_report', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Dispatched gifts report error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dispatched gifts report'
      }
    }
  }

  // Get Pending Delivery report
  static async getPendingDeliveryReport(params = {}) {
    try {
      const response = await api.get('/gift.api.get_pending_delivery_report', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Pending delivery report error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pending delivery report'
      }
    }
  }

  // Get Barcode Print report
  static async getBarcodeReportData(params = {}) {
    try {
      const response = await api.get('/gift.api.get_barcode_print_report', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Barcode print report error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch barcode print report'
      }
    }
  }

  // Export report to Excel
  static async exportToExcel(reportType, params = {}) {
    try {
      // Set a high limit to get all data for export
      const exportParams = { ...params, limit: 10000 }

      let response
      switch (reportType) {
        case 'interest-shows':
          response = await this.getInterestShowsReport(exportParams)
          break
        case 'dispatched-gifts':
          response = await this.getDispatchedGiftsReport(exportParams)
          break
        case 'pending-delivery':
          response = await this.getPendingDeliveryReport(exportParams)
          break
        case 'barcode-print':
          response = await this.getBarcodeReportData(exportParams)
          break
        default:
          throw new Error('Invalid report type')
      }

      if (!response.success) {
        throw new Error(response.error)
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Export to Excel error:', error)
      return {
        success: false,
        error: error.message || 'Failed to export report'
      }
    }
  }
}

// Settings API service
export class SettingsAPI {
  // Get categories for settings management
  static async getCategories(params = {}) {
    try {
      const response = await api.get('/gift.api.get_settings_categories', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Get settings categories error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  }

  // Create category
  static async createCategory(categoryData) {
    try {
      const response = await api.post('/gift.api.create_category', categoryData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Create category error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category'
      }
    }
  }

  // Update category
  static async updateCategory(name, categoryData) {
    try {
      const response = await api.post('/gift.api.update_category', {
        name,
        ...categoryData
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Update category error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category'
      }
    }
  }

  // Delete category
  static async deleteCategory(name) {
    try {
      const response = await api.post('/gift.api.delete_category', { name })
      return {
        success: true,
        message: response.data.message || 'Category deleted successfully'
      }
    } catch (error) {
      console.error('Delete category error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category'
      }
    }
  }

  // Get users for settings management
  static async getUsers(params = {}) {
    try {
      const response = await api.get('/gift.api.get_settings_users', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Get settings users error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      }
    }
  }

  // Create user
  static async createUser(userData) {
    try {
      const response = await api.post('/gift.api.create_user', userData)
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Create user error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      }
    }
  }

  // Update user
  static async updateUser(name, userData) {
    try {
      const response = await api.post('/gift.api.update_user', {
        name,
        ...userData
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Update user error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      }
    }
  }

  // Update user password
  static async updateUserPassword(name, newPassword) {
    try {
      const response = await api.post('/gift.api.update_user_password', {
        name,
        new_password: newPassword
      })
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Update user password error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update password'
      }
    }
  }

  // Delete user
  static async deleteUser(name) {
    try {
      const response = await api.post('/gift.api.delete_user', { name })
      return {
        success: true,
        message: response.data.message || 'User disabled successfully'
      }
    } catch (error) {
      console.error('Delete user error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable user'
      }
    }
  }

  // Get available roles
  static async getAvailableRoles() {
    try {
      const response = await api.get('/gift.api.get_available_roles')
      return {
        success: true,
        data: response.data.message || []
      }
    } catch (error) {
      console.error('Get available roles error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch roles'
      }
    }
  }

  // Get current user role for authorization
  static async getCurrentUserRole() {
    try {
      const response = await api.get('/gift.api.get_current_user_role')
      return {
        success: true,
        data: response.data.message || {}
      }
    } catch (error) {
      console.error('Get current user role error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user role'
      }
    }
  }
  // Gift Recipient Management Methods
  
  // Get gift recipients for settings management
  static async getGiftRecipients(params = {}) {
    try {
      const response = await api.get('/gift.api.get_settings_gift_recipients', { params })
      const message = response.data.message || {}
      return {
        success: true,
        data: message.data || [],
        total: message.total || 0,
        page: message.page || 1,
        totalPages: message.total_pages || 1
      }
    } catch (error) {
      console.error('Get settings gift recipients error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gift recipients'
      }
    }
  }

  // Create gift recipient
  static async createGiftRecipient(recipientData) {
    try {
      const formData = new FormData()
      
      // Add all form fields to FormData
      Object.keys(recipientData).forEach(key => {
        if (recipientData[key] !== null && recipientData[key] !== undefined) {
          if (key === 'person_photo' && recipientData[key] instanceof File) {
            formData.append(key, recipientData[key])
          } else if (key !== 'person_photo') {
            formData.append(key, recipientData[key])
          }
        }
      })
      
      const response = await api.post('/gift.api.create_gift_recipient', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Create gift recipient error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create gift recipient'
      }
    }
  }

  // Update gift recipient
  static async updateGiftRecipient(name, recipientData) {
    try {
      const formData = new FormData()
      formData.append('name', name)
      
      // Add all form fields to FormData
      Object.keys(recipientData).forEach(key => {
        if (recipientData[key] !== null && recipientData[key] !== undefined) {
          if (key === 'person_photo' && recipientData[key] instanceof File) {
            formData.append(key, recipientData[key])
          } else if (key !== 'person_photo') {
            formData.append(key, recipientData[key])
          }
        }
      })
      
      const response = await api.post('/gift.api.update_gift_recipient', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response.data.message
      }
    } catch (error) {
      console.error('Update gift recipient error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update gift recipient'
      }
    }
  }

  // Delete gift recipient
  static async deleteGiftRecipient(name) {
    try {
      const response = await api.post('/gift.api.delete_gift_recipient', { name })
      return {
        success: true,
        message: response.data.message || 'Gift recipient deleted successfully'
      }
    } catch (error) {
      console.error('Delete gift recipient error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete gift recipient'
      }
    }
  }
}
