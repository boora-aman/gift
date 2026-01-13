<template>
  <div class="min-h-screen bg-off-white">
    <!-- Page Header -->
    <div class="bg-white border-b border-charcoal-200">
      <div class="container-responsive py-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center space-x-2 text-sm text-charcoal-500 mb-2">
              <router-link to="/settings" class="hover:text-gray-600">Settings</router-link>
              <ChevronRightIcon class="w-4 h-4" />
              <span>User Management</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-charcoal-800">
              User Management
            </h1>
            <p class="text-charcoal-600 mt-1">
              Create and manage system users with full access
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="refreshData"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50"
            >
              <ArrowPathIcon
                class="w-4 h-4 mr-2"
                :class="{ 'animate-spin': loading }"
              />
              Refresh
            </button>
            <button
              @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              <UserPlusIcon class="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="container-responsive py-6">
      <div class="bg-white rounded-lg border border-charcoal-200 p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div class="flex-1 max-w-md">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search users..."
                class="w-full pl-10 pr-4 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="sortOrder"
              @change="loadUsers"
              class="px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
            <span class="text-sm text-charcoal-500">
              {{ paginationInfo }}
            </span>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
        <div v-if="loading && users.length === 0" class="p-8 text-center">
          <ArrowPathIcon class="w-8 h-8 text-charcoal-400 mx-auto mb-4 animate-spin" />
          <p class="text-charcoal-500">Loading users...</p>
        </div>

        <div v-else-if="users.length === 0" class="p-8 text-center">
          <UsersIcon class="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-charcoal-800 mb-2">No users found</h3>
          <p class="text-charcoal-500 mb-4">
            {{ searchQuery ? 'No users match your search.' : 'Get started by creating your first user.' }}
          </p>
          <button
            v-if="!searchQuery"
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            <UserPlusIcon class="w-4 h-4 mr-2" />
            Add First User
          </button>
        </div>

        <div v-else>
          <!-- Table Header -->
          <div class="bg-charcoal-50 border-b border-charcoal-200">
            <div class="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-charcoal-700">
              <div class="col-span-3">User</div>
              <div class="col-span-2">Email</div>
              <div class="col-span-2">User Role</div>
              <div class="col-span-2">Status</div>
              <div class="col-span-1">Last Login</div>
              <div class="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-charcoal-200">
            <div
              v-for="user in users"
              :key="user.name"
              class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
            >
              <div class="col-span-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {{ getUserInitials(user.full_name || user.email) }}
                  </div>
                  <div>
                    <p class="font-medium text-charcoal-800">{{ user.full_name || `${user.first_name} ${user.last_name}` }}</p>
                    <p class="text-charcoal-500 text-sm">{{ user.phone || 'No phone' }}</p>
                  </div>
                </div>
              </div>
              <div class="col-span-2">
                <p class="text-charcoal-800">{{ user.email }}</p>
              </div>
              <div class="col-span-2">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getUserRoleBadgeClass(user.location)"
                >
                  {{ getUserRoleDisplay(user.location) }}
                </span>
              </div>
              <div class="col-span-2">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.enabled ? 'Active' : 'Disabled' }}
                </span>
              </div>
              <div class="col-span-1">
                <p class="text-charcoal-600 text-sm">
                  {{ user.last_login ? formatDate(user.last_login) : 'Never' }}
                </p>
              </div>
              <div class="col-span-2 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="openEditModal(user)"
                    class="p-2 text-charcoal-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openPasswordModal(user)"
                    class="p-2 text-charcoal-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Change password"
                  >
                    <KeyIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    :disabled="user.name === 'Administrator' || user.email === 'administrator@guest.com' || user.name.toLowerCase().includes('guest')"
                    class="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Disable user"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
        <p class="text-sm text-charcoal-600">
          Showing {{ ((currentPage - 1) * limit) + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }} users
        </p>
        <div class="flex items-center space-x-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm font-medium text-charcoal-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-charcoal-800">
            {{ isEditMode ? 'Edit User' : 'Create New User' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 text-charcoal-500 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-charcoal-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                v-model="formData.first_name"
                type="text"
                required
                maxlength="50"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-charcoal-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                v-model="formData.last_name"
                type="text"
                required
                maxlength="50"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label for="userRole" class="block text-sm font-medium text-charcoal-700 mb-2">
              User Role *
            </label>
            <CustomDropdown
              v-model="formData.location"
              :options="userRoleOptions"
              placeholder="Select user role"
              required
              class="w-full"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-charcoal-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :disabled="isEditMode"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-100"
              placeholder="Enter email address"
            />
          </div>

          <div v-if="!isEditMode">
            <label for="password" class="block text-sm font-medium text-charcoal-700 mb-2">
              Password *
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="phone" class="block text-sm font-medium text-charcoal-700 mb-2">
                Phone
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                maxlength="20"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label for="mobile" class="block text-sm font-medium text-charcoal-700 mb-2">
                Mobile
              </label>
              <input
                id="mobile"
                v-model="formData.mobile_no"
                type="tel"
                maxlength="20"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-charcoal-700 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter username (optional)"
            />
          </div>

          <div v-if="isEditMode" class="flex items-center">
            <input
              id="enabled"
              v-model="formData.enabled"
              type="checkbox"
              class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-charcoal-300 rounded"
            />
            <label for="enabled" class="ml-2 block text-sm text-charcoal-700">
              User is active
            </label>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              <span v-if="saving">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
              <span v-else>{{ isEditMode ? 'Update User' : 'Create User' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closePasswordModal"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-charcoal-800">Change Password</h2>
          <button
            @click="closePasswordModal"
            class="p-2 text-charcoal-500 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <p class="text-charcoal-600">
            Change password for <strong>{{ passwordUser?.full_name || passwordUser?.email }}</strong>
          </p>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-charcoal-700 mb-2">
              New Password *
            </label>
            <input
              id="newPassword"
              v-model="passwordData.new_password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closePasswordModal"
              class="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updatingPassword"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
            >
              <span v-if="updatingPassword">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-charcoal-800">Disable User</h2>
            <p class="text-sm text-charcoal-600">This will disable the user account</p>
          </div>
        </div>

        <p class="text-charcoal-700 mb-6">
          Are you sure you want to disable the user "<strong>{{ userToDelete?.full_name || userToDelete?.email }}</strong>"?
          They will not be able to log in anymore.
        </p>

        <div class="flex items-center justify-end space-x-3">
          <button
            type="button"
            @click="closeDeleteModal"
            class="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
          >
            Cancel
          </button>
          <button
            @click="deleteUser"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            <span v-if="deleting">Disabling...</span>
            <span v-else>Disable User</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../composables/useToast'
import { useDebounce } from '../../composables/useDebounce'
import { useAuthStore } from '../../stores/auth'
import { api } from '../../services/api'
import { SettingsAPI } from '../../services/api'

// Import components
import CustomDropdown from '../../components/CustomDropdown.vue'

// Import icons
import {
  ChevronRightIcon,
  ArrowPathIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'UserManagement',
  components: {
    CustomDropdown,
    ChevronRightIcon,
    ArrowPathIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon,
    XMarkIcon,
    ExclamationTriangleIcon
  },
  setup() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const authStore = useAuthStore()

    // Reactive state
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const updatingPassword = ref(false)
    const users = ref([])
    const searchQuery = ref('')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const limit = ref(20)
    const total = ref(0)
    const totalPages = ref(0)

    // Modal state
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const showPasswordModal = ref(false)
    const isEditMode = ref(false)
    const editingUser = ref(null)
    const userToDelete = ref(null)
    const passwordUser = ref(null)

    // Form data
    const formData = ref({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      mobile_no: '',
      username: '',
      location: '', // User Role stored in location field
      enabled: true
    })

    const passwordData = ref({
      new_password: ''
    })

    // User Role options
    const userRoleOptions = [
      { value: 'Admin', label: 'Admin' },
      { value: 'Event Manager', label: 'Event Manager' },
      { value: 'Event Coordinator', label: 'Event Coordinator' }
    ]

    // Computed
    const paginationInfo = computed(() => {
      if (total.value === 0) return 'No users found'
      const start = ((currentPage.value - 1) * limit.value) + 1
      const end = Math.min(currentPage.value * limit.value, total.value)
      return `${start}-${end} of ${total.value} users`
    })

    // Methods
    const loadUsers = async () => {
      try {
        loading.value = true

        const params = {
          page: currentPage.value,
          limit: limit.value,
          order_by: 'full_name',
          sort_order: sortOrder.value
        }

        if (searchQuery.value) {
          params.search = searchQuery.value
        }

        const response = await SettingsAPI.getUsers(params)

        if (response.success) {
          // Filter out guest and administrator users
          const filteredUsers = (response.data || []).filter(user => {
            const userName = user.name || user.email || ''
            const userEmail = user.email || ''
            return !userName.toLowerCase().includes('guest') &&
                   !userName.toLowerCase().includes('administrator') &&
                   !userEmail.toLowerCase().includes('guest') &&
                   !userEmail.toLowerCase().includes('administrator')
          })

          users.value = filteredUsers
          total.value = filteredUsers.length
          totalPages.value = Math.ceil(filteredUsers.length / limit.value)
        } else {
          showError(response.error)
        }

      } catch (error) {
        console.error('Error loading users:', error)
        showError('Failed to load users')
      } finally {
        loading.value = false
      }
    }

    const debouncedSearch = useDebounce(() => {
      currentPage.value = 1
      loadUsers()
    }, 300)

    const refreshData = () => {
      loadUsers()
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadUsers()
      }
    }

    const getUserInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getUserRoleDisplay = (role) => {
      if (!role) return 'No Role'
      return role
    }

    const getUserRoleBadgeClass = (role) => {
      switch (role) {
        case 'Admin':
          return 'bg-red-100 text-red-800'
        case 'Event Manager':
          return 'bg-blue-100 text-blue-800'
        case 'Event Coordinator':
          return 'bg-green-100 text-green-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const openCreateModal = () => {
      isEditMode.value = false
      editingUser.value = null
      formData.value = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        mobile_no: '',
        username: '',
        location: '', // User Role
        enabled: true
      }
      showModal.value = true
    }

    const openEditModal = (user) => {
      isEditMode.value = true
      editingUser.value = user
      formData.value = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        mobile_no: user.mobile_no || '',
        username: user.username || '',
        location: user.location || '', // User Role
        enabled: user.enabled
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      isEditMode.value = false
      editingUser.value = null
      formData.value = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        mobile_no: '',
        username: '',
        location: '', // User Role
        enabled: true
      }
    }

    const saveUser = async () => {
      try {
        saving.value = true

        let response
        if (isEditMode.value) {
          response = await SettingsAPI.updateUser(editingUser.value.name, {
            first_name: formData.value.first_name,
            last_name: formData.value.last_name,
            phone: formData.value.phone,
            mobile_no: formData.value.mobile_no,
            username: formData.value.username,
            location: formData.value.location, // User Role
            enabled: formData.value.enabled ? 1 : 0
          })
        } else {
          response = await SettingsAPI.createUser({
            email: formData.value.email,
            first_name: formData.value.first_name,
            last_name: formData.value.last_name,
            password: formData.value.password,
            phone: formData.value.phone,
            mobile_no: formData.value.mobile_no,
            username: formData.value.username,
            location: formData.value.location // User Role
          })
        }

        if (response.success) {
          showSuccess(isEditMode.value ? 'User updated successfully' : 'User created successfully')
          closeModal()
          loadUsers()
        } else {
          showError(response.error)
        }

      } catch (error) {
        console.error('Error saving user:', error)
        showError('Failed to save user')
      } finally {
        saving.value = false
      }
    }

    const openPasswordModal = (user) => {
      passwordUser.value = user
      passwordData.value = {
        new_password: ''
      }
      showPasswordModal.value = true
    }

    const closePasswordModal = () => {
      showPasswordModal.value = false
      passwordUser.value = null
      passwordData.value = {
        new_password: ''
      }
    }

    const updatePassword = async () => {
      try {
        updatingPassword.value = true

        const response = await SettingsAPI.updateUserPassword(
          passwordUser.value.name,
          passwordData.value.new_password
        )

        if (response.success) {
          showSuccess('Password updated successfully')
          closePasswordModal()
        } else {
          showError(response.error)
        }

      } catch (error) {
        console.error('Error updating password:', error)
        showError('Failed to update password')
      } finally {
        updatingPassword.value = false
      }
    }

    const confirmDelete = (user) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      userToDelete.value = null
    }

    const deleteUser = async () => {
      try {
        deleting.value = true

        const response = await SettingsAPI.deleteUser(userToDelete.value.name)

        if (response.success) {
          showSuccess('User disabled successfully')
          closeDeleteModal()
          loadUsers()
        } else {
          showError(response.error)
        }

      } catch (error) {
        console.error('Error deleting user:', error)
        showError('Failed to disable user')
      } finally {
        deleting.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }

    // Lifecycle
    onMounted(() => {
      loadUsers()
      // Load user role for authorization checks
      authStore.loadUserRole()
    })

    return {
      loading,
      saving,
      deleting,
      updatingPassword,
      users,
      searchQuery,
      sortOrder,
      currentPage,
      limit,
      total,
      totalPages,
      showModal,
      showDeleteModal,
      showPasswordModal,
      isEditMode,
      editingUser,
      userToDelete,
      passwordUser,
      formData,
      passwordData,
      userRoleOptions,
      paginationInfo,
      loadUsers,
      debouncedSearch,
      refreshData,
      goToPage,
      getUserInitials,
      getUserRoleDisplay,
      getUserRoleBadgeClass,
      openCreateModal,
      openEditModal,
      closeModal,
      saveUser,
      openPasswordModal,
      closePasswordModal,
      updatePassword,
      confirmDelete,
      closeDeleteModal,
      deleteUser,
      formatDate
    }
  }
}
</script>

<style scoped>
.container-responsive {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container-responsive {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container-responsive {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-12 {
    display: block;
  }

  .col-span-3,
  .col-span-2 {
    display: block;
    margin-bottom: 0.5rem;
  }

  .text-right {
    text-align: left;
  }
}
</style>
