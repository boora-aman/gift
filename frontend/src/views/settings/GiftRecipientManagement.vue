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
              <span>Gift Recipient Management</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-charcoal-800">
              Gift Recipient Management
            </h1>
            <p class="text-charcoal-600 mt-1">
              Manage gift recipients and their information
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
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Recipient
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
                placeholder="Search recipients..."
                class="w-full pl-10 pr-4 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="sortOrder"
              @change="loadRecipients"
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

      <!-- Recipients Table -->
      <div class="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
        <div v-if="loading && recipients.length === 0" class="p-8 text-center">
          <ArrowPathIcon class="w-8 h-8 text-charcoal-400 mx-auto mb-4 animate-spin" />
          <p class="text-charcoal-500">Loading recipients...</p>
        </div>

        <div v-else-if="recipients.length === 0" class="p-8 text-center">
          <UserGroupIcon class="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-charcoal-800 mb-2">No recipients found</h3>
          <p class="text-charcoal-500 mb-4">
            {{ searchQuery ? 'No recipients match your search.' : 'Get started by creating your first recipient.' }}
          </p>
          <button
            v-if="!searchQuery"
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Add First Recipient
          </button>
        </div>

        <div v-else>
          <!-- Table Header -->
          <div class="bg-charcoal-50 border-b border-charcoal-200">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-3">
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Owner Name
              </div>
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Coordinator
              </div>
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Mobile No
              </div>
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Emirates ID
              </div>
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Address
              </div>
              <div class="md:col-span-2 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Actions
              </div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-charcoal-200">
            <div
              v-for="recipient in recipients"
              :key="recipient.name"
              class="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
            >
              <div class="md:col-span-2">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <UserIcon class="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-charcoal-800">
                      {{ recipient.owner_full_name }}
                    </div>
                    <div class="text-xs text-charcoal-500">
                      {{ recipient.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="md:col-span-2">
                <div class="text-sm text-charcoal-800">
                  {{ recipient.coordinator_full_name || '-' }}
                </div>
              </div>
              <div class="md:col-span-2">
                <div class="text-sm text-charcoal-800">
                  {{ recipient.coordinator_mobile_no || '-' }}
                </div>
              </div>
              <div class="md:col-span-2">
                <div class="text-sm text-charcoal-800">
                  {{ recipient.coordinator_emirates_id || '-' }}
                </div>
              </div>
              <div class="md:col-span-2">
                <div class="text-sm text-charcoal-800">
                  {{ truncateText(recipient.address, 30) || '-' }}
                </div>
              </div>
              <div class="md:col-span-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(recipient)"
                    class="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Edit recipient"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteModal(recipient)"
                    class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                    title="Delete recipient"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="border-t border-charcoal-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-charcoal-500">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 border rounded text-sm',
                    page === currentPage
                      ? 'border-gray-500 bg-gray-500 text-white'
                      : 'border-charcoal-300 text-charcoal-600 hover:bg-charcoal-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 text-center">
        <div class="fixed inset-0 bg-black opacity-30" @click="closeModal"></div>
        
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto z-50">
          <!-- Modal Header -->
          <div class="border-b border-charcoal-200 px-6 py-4">
            <h3 class="text-lg font-semibold text-charcoal-800">
              {{ isEditMode ? 'Edit Recipient' : 'Add New Recipient' }}
            </h3>
          </div>
          
          <!-- Modal Body -->
          <div class="px-6 py-4">
            <form @submit.prevent="saveRecipient" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Owner Full Name -->
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Owner Full Name *
                  </label>
                  <input
                    v-model="formData.owner_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter owner full name"
                  />
                </div>
                
                <!-- Coordinator Full Name -->
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Coordinator Full Name *
                  </label>
                  <input
                    v-model="formData.coordinator_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter coordinator full name"
                  />
                </div>
                
                <!-- Coordinator Mobile No -->
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Coordinator Mobile No *
                  </label>
                  <input
                    v-model="formData.coordinator_mobile_no"
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter mobile number"
                  />
                </div>
                
                <!-- Coordinator Emirates ID -->
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Coordinator Emirates ID
                  </label>
                  <input
                    v-model="formData.coordinator_emirates_id"
                    type="text"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter Emirates ID"
                  />
                </div>
              </div>
              
              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-charcoal-700 mb-2">
                  Address
                </label>
                <textarea
                  v-model="formData.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter address"
                ></textarea>
              </div>
              
              <!-- Person Photo -->
              <div>
                <label class="block text-sm font-medium text-charcoal-700 mb-2">
                  Person Photo
                </label>
                <input
                  @change="handleFileUpload"
                  type="file"
                  accept="image/*"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <p class="text-sm text-charcoal-500 mt-1">
                  Upload a photo of the person (optional)
                </p>
              </div>
            </form>
          </div>
          
          <!-- Modal Footer -->
          <div class="border-t border-charcoal-200 px-6 py-4 flex justify-end space-x-3">
            <button
              @click="closeModal"
              type="button"
              class="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              @click="saveRecipient"
              :disabled="saving"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 text-center">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-50">
          <div class="p-6">
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-charcoal-800 mb-2">Delete Recipient</h3>
            <p class="text-charcoal-600 mb-6">
              Are you sure you want to delete <strong>{{ recipientToDelete?.owner_full_name }}</strong>? 
              This action cannot be undone and may affect related gift interests and issues.
            </p>
            <div class="flex justify-center space-x-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-50"
              >
                Cancel
              </button>
              <button
                @click="deleteRecipient"
                :disabled="deleting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../composables/useToast'
import { useDebounce } from '../../composables/useDebounce'
import { SettingsAPI } from '../../services/api'

// Import icons
import {
  ChevronRightIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GiftRecipientManagement',
  components: {
    ChevronRightIcon,
    ArrowPathIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    UserIcon,
    PencilIcon,
    TrashIcon,
    ExclamationTriangleIcon
  },
  setup() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    
    // Reactive state
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const recipients = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const totalPages = ref(0)
    const limit = ref(20)
    const searchQuery = ref('')
    const sortOrder = ref('asc')
    
    // Modal state
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditMode = ref(false)
    const editingRecipient = ref(null)
    const recipientToDelete = ref(null)
    
    // Form data
    const formData = ref({
      owner_full_name: '',
      coordinator_full_name: '',
      coordinator_mobile_no: '',
      coordinator_emirates_id: '',
      address: '',
      person_photo: null
    })
    
    // Computed
    const paginationInfo = computed(() => {
      if (total.value === 0) return 'No recipients found'
      const start = ((currentPage.value - 1) * limit.value) + 1
      const end = Math.min(currentPage.value * limit.value, total.value)
      return `${start}-${end} of ${total.value} recipients`
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const startPage = Math.max(1, currentPage.value - 2)
      const endPage = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    // Methods
    const loadRecipients = async () => {
      try {
        loading.value = true
        
        const params = {
          page: currentPage.value,
          limit: limit.value,
          order_by: 'owner_full_name',
          sort_order: sortOrder.value
        }
        
        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }
        
        const response = await SettingsAPI.getGiftRecipients(params)
        
        if (response.success) {
          recipients.value = response.data || []
          total.value = response.total || 0
          totalPages.value = response.totalPages || 0
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error loading recipients:', error)
        showError('Failed to load recipients')
      } finally {
        loading.value = false
      }
    }

    const debouncedSearch = useDebounce(() => {
      currentPage.value = 1
      loadRecipients()
    }, 300)
    
    const refreshData = () => {
      loadRecipients()
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadRecipients()
      }
    }
    
    const openCreateModal = () => {
      isEditMode.value = false
      editingRecipient.value = null
      formData.value = {
        owner_full_name: '',
        coordinator_full_name: '',
        coordinator_mobile_no: '',
        coordinator_emirates_id: '',
        address: '',
        person_photo: null
      }
      showModal.value = true
    }
    
    const openEditModal = (recipient) => {
      isEditMode.value = true
      editingRecipient.value = recipient
      formData.value = {
        owner_full_name: recipient.owner_full_name,
        coordinator_full_name: recipient.coordinator_full_name || '',
        coordinator_mobile_no: recipient.coordinator_mobile_no || '',
        coordinator_emirates_id: recipient.coordinator_emirates_id || '',
        address: recipient.address || '',
        person_photo: null // File input will be empty for edit
      }
      showModal.value = true
    }
    
    const closeModal = () => {
      showModal.value = false
      isEditMode.value = false
      editingRecipient.value = null
      formData.value = {
        owner_full_name: '',
        coordinator_full_name: '',
        coordinator_mobile_no: '',
        coordinator_emirates_id: '',
        address: '',
        person_photo: null
      }
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      formData.value.person_photo = file || null
    }
    
    const saveRecipient = async () => {
      try {
        saving.value = true
        
        let response
        if (isEditMode.value) {
          response = await SettingsAPI.updateGiftRecipient(editingRecipient.value.name, formData.value)
        } else {
          response = await SettingsAPI.createGiftRecipient(formData.value)
        }
        
        if (response.success) {
          showSuccess(isEditMode.value ? 'Recipient updated successfully' : 'Recipient created successfully')
          closeModal()
          loadRecipients()
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error saving recipient:', error)
        showError(error.response?.data?.message || 'Failed to save recipient')
      } finally {
        saving.value = false
      }
    }
    
    const openDeleteModal = (recipient) => {
      recipientToDelete.value = recipient
      showDeleteModal.value = true
    }
    
    const deleteRecipient = async () => {
      try {
        deleting.value = true
        
        const response = await SettingsAPI.deleteGiftRecipient(recipientToDelete.value.name)
        
        if (response.success) {
          showSuccess('Recipient deleted successfully')
          showDeleteModal.value = false
          recipientToDelete.value = null
          loadRecipients()
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error deleting recipient:', error)
        showError(error.response?.data?.message || 'Failed to delete recipient')
      } finally {
        deleting.value = false
      }
    }
    
    const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    // Lifecycle
    onMounted(() => {
      loadRecipients()
    })

    return {
      loading,
      saving,
      deleting,
      recipients,
      total,
      currentPage,
      totalPages,
      searchQuery,
      sortOrder,
      showModal,
      showDeleteModal,
      isEditMode,
      editingRecipient,
      recipientToDelete,
      formData,
      paginationInfo,
      visiblePages,
      loadRecipients,
      debouncedSearch,
      refreshData,
      goToPage,
      openCreateModal,
      openEditModal,
      closeModal,
      handleFileUpload,
      saveRecipient,
      openDeleteModal,
      deleteRecipient,
      truncateText
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

/* Animation classes */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-12 {
    grid-template-columns: 1fr;
  }
  
  .md\:col-span-2 {
    grid-column: span 1;
  }
}
</style>