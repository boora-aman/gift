import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { api, UserAPI, SettingsAPI } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const userRole = ref(localStorage.getItem('gift-app-user-role'))
  const token = ref(localStorage.getItem('gift-app-token'))
  const refreshToken = ref(localStorage.getItem('gift-app-refresh-token'))
  const isLoading = ref(false)
  const lastLoginTime = ref(localStorage.getItem('gift-app-last-login'))

  // Computed
  const isAuthenticated = computed(() => {
    return !!user.value
  })

  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
  })

  const userInitials = computed(() => {
    if (!user.value) return 'GU'

    // Get the full name or email
    const name = user.value.full_name || user.value.email || 'Guest User'

    // Extract the first word and get its first two characters
    const firstWord = name.trim().split(/\s+/)[0]

    // If first word is an email, use the part before @
    const cleanWord = firstWord.includes('@') ? firstWord.split('@')[0] : firstWord

    // Return first two characters, or pad with 'U' if only one character
    return cleanWord.length >= 2
      ? cleanWord.substring(0, 2).toUpperCase()
      : (cleanWord.charAt(0) + 'U').toUpperCase()
  })

  // User role computed properties
  const isAdmin = computed(() => userRole.value === 'Admin')
  const isEventManager = computed(() => userRole.value === 'Event Manager')
  const isEventCoordinator = computed(() => userRole.value === 'Event Coordinator')
  const hasRole = computed(() => !!userRole.value)

  // Permission-based computed properties
  const canEditGifts = computed(() => {
    // If no role assigned, allow everything
    if (!userRole.value) return true
    return isAdmin.value || isEventManager.value
  })

  const canCreateGifts = computed(() => {
    // If no role assigned, allow everything
    if (!userRole.value) return true
    return isAdmin.value || isEventManager.value
  })

  const canDispatchGifts = computed(() => {
    // If no role assigned, allow everything
    if (!userRole.value) return true
    return isAdmin.value || isEventManager.value
  })

  // Actions
  const login = async (credentials) => {
    isLoading.value = true

    try {
      // Standard Frappe login endpoint - no CSRF needed for login
      const response = await axios.post('/api/method/login', {
        cmd: 'login',
        usr: credentials.usr || credentials.email,
        pwd: credentials.pwd || credentials.password
      }, {
        withCredentials: true
      })

      if (response.data && response.data.message === 'Logged In') {
        // Frappe login successful - store user data
        user.value = {
          email: credentials.usr || credentials.email,
          full_name: response.data.full_name || (credentials.usr || credentials.email)
        }
        lastLoginTime.value = new Date().toISOString()

        // Persist to localStorage
        localStorage.setItem('gift-app-user', JSON.stringify(user.value))
        localStorage.setItem('gift-app-last-login', lastLoginTime.value)

        // Load user role after successful login
        await loadUserRole()

        return { success: true, user: user.value }
      } else {
        throw new Error('Login failed - invalid response')
      }
    } catch (error) {
      console.error('Login error:', error)

      let errorMessage = 'Login failed. Please check your credentials.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email/mobile or password.'
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.'
      }

      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (showMessage = true) => {
    isLoading.value = true

    try {
      // Call Frappe logout API if we have user session
      if (user.value) {
        await axios.post('/api/method/logout', {}, {
          withCredentials: true
        }).catch(() => {
          // Ignore errors on logout API call
        })
      }
    } finally {
      // Clear all auth data regardless of API call success
      clearAuthData()
      isLoading.value = false

      if (showMessage) {
        // Show success message (handled by component)
        return { success: true, message: 'Logged out successfully' }
      }
    }
  }

  const clearAuthData = () => {
    user.value = null
    userRole.value = null
    token.value = null
    refreshToken.value = null
    lastLoginTime.value = null

    // Clear localStorage
    localStorage.removeItem('gift-app-token')
    localStorage.removeItem('gift-app-refresh-token')
    localStorage.removeItem('gift-app-user')
    localStorage.removeItem('gift-app-user-role')
    localStorage.removeItem('gift-app-last-login')

    // Clear API headers - Frappe handles auth through session cookies
    delete api.defaults.headers.common['Authorization']
  }

    const checkAuth = async () => {
    const storedUser = localStorage.getItem('gift-app-user')

    if (!storedUser) {
      clearAuthData()
      return false
    }

    try {
      // Check if session is still valid with Frappe
      const response = await axios.get('/api/method/frappe.auth.get_logged_user', {
        withCredentials: true
      })

      if (response.data && response.data.message && response.data.message !== 'Guest') {
        // Session is valid, restore user data
        user.value = JSON.parse(storedUser)
        lastLoginTime.value = localStorage.getItem('gift-app-last-login')

        // Load user role for the restored session
        await loadUserRole()

        return true
      } else {
        // Session expired, clear data
        clearAuthData()
        return false
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearAuthData()
      return false
    }
  }

  const refreshAuthToken = async () => {
    // Frappe uses session-based auth, so we just check if session is still valid
    return await checkAuth()
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true

    try {
      // Use the new UserAPI to update profile
      const result = await UserAPI.updateProfile(profileData)

      if (result.success) {
        // Update the local user data
        user.value = { ...user.value, ...result.data }
        localStorage.setItem('gift-app-user', JSON.stringify(user.value))
        return { success: true, user: user.value, message: result.message }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)

      let errorMessage = 'Failed to update profile.'
      if (error.message) {
        errorMessage = error.message
      }

      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const loadUserProfile = async () => {
    try {
      const result = await UserAPI.getProfile()

      if (result.success) {
        user.value = { ...user.value, ...result.data }
        localStorage.setItem('gift-app-user', JSON.stringify(user.value))
        return { success: true, user: user.value }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Load user profile error:', error)
      return { success: false, error: error.message || 'Failed to load user profile' }
    }
  }

  const getUserStats = async () => {
    try {
      const result = await UserAPI.getStats()

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return { success: false, error: error.message || 'Failed to fetch user statistics' }
    }
  }

  const changePassword = async (passwordData) => {
    isLoading.value = true

    try {
      const response = await api.post('/frappe.core.doctype.user.user.update_password', {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      if (response.data?.message === 'password updated') {
        return { success: true }
      } else {
        throw new Error('Invalid password change response')
      }
    } catch (error) {
      console.error('Password change error:', error)

      let errorMessage = 'Failed to change password.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.exc) {
        errorMessage = 'Incorrect current password.'
      }

      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (email) => {
    isLoading.value = true

    try {
      const response = await api.post('/frappe.core.doctype.user.user.reset_password', {
        user: email
      })

      if (response.data) {
        return {
          success: true,
          message: 'Password reset instructions have been sent to your email.'
        }
      } else {
        throw new Error('Invalid forgot password response')
      }
    } catch (error) {
      console.error('Forgot password error:', error)

      let errorMessage = 'Failed to send password reset instructions.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Load current user role
  const loadUserRole = async () => {
    try {
      if (!user.value) return { success: false, error: 'User not authenticated' }

      const response = await SettingsAPI.getCurrentUserRole()

      if (response.success && response.data) {
        userRole.value = response.data.role

        // Persist to localStorage
        if (userRole.value) {
          localStorage.setItem('gift-app-user-role', userRole.value)
        } else {
          localStorage.removeItem('gift-app-user-role')
        }

        return { success: true, role: userRole.value }
      } else {
        throw new Error(response.error || 'Failed to load user role')
      }
    } catch (error) {
      // console.error('Load user role error:', error)

      let errorMessage = 'Failed to load user role.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return { success: false, error: errorMessage }
    }
  }

  // Initialize auth on store creation
  const storedUser = localStorage.getItem('gift-app-user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      clearAuthData()
    }
  }

  return {
    // State
    user,
    userRole,
    token,
    refreshToken,
    isLoading,
    lastLoginTime,

    // Computed
    isAuthenticated,
    userFullName,
    userInitials,
    isAdmin,
    isEventManager,
    isEventCoordinator,
    hasRole,
    canEditGifts,
    canCreateGifts,
    canDispatchGifts,

    // Actions
    login,
    logout,
    clearAuthData,
    checkAuth,
    refreshAuthToken,
    updateProfile,
    loadUserProfile,
    getUserStats,
    changePassword,
    forgotPassword,
    loadUserRole
  }
})
