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
              <span>Category Management</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-charcoal-800">
              Category Management
            </h1>
            <p class="text-charcoal-600 mt-1">
              Manage gift categories and organization
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
              Add Category
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
                placeholder="Search categories..."
                class="w-full pl-10 pr-4 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <select
              v-model="sortOrder"
              @change="loadCategories"
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

      <!-- Categories Table -->
      <div class="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
        <div v-if="loading && categories.length === 0" class="p-8 text-center">
          <ArrowPathIcon class="w-8 h-8 text-charcoal-400 mx-auto mb-4 animate-spin" />
          <p class="text-charcoal-500">Loading categories...</p>
        </div>

        <div v-else-if="categories.length === 0" class="p-8 text-center">
          <TagIcon class="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-charcoal-800 mb-2">No categories found</h3>
          <p class="text-charcoal-500 mb-4">
            {{ searchQuery ? 'No categories match your search.' : 'Get started by creating your first category.' }}
          </p>
          <button
            v-if="!searchQuery"
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Add First Category
          </button>
        </div>

        <div v-else>
          <!-- Table Header -->
          <div class="bg-charcoal-50 border-b border-charcoal-200">
            <div class="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-charcoal-700">
              <div class="col-span-4">Category Name</div>
              <div class="col-span-4">Description</div>
              <div class="col-span-2">Created</div>
              <div class="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-charcoal-200">
            <div
              v-for="category in categories"
              :key="category.name"
              class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
            >
              <div class="col-span-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TagIcon class="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p class="font-medium text-charcoal-800">{{ category.category_name }}</p>
                  </div>
                </div>
              </div>
              <div class="col-span-4">
                <p class="text-charcoal-600 text-sm">
                  {{ category.description || 'No description' }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-charcoal-600 text-sm">{{ formatDate(category.creation) }}</p>
                <p class="text-charcoal-500 text-xs">by {{ category.creator_name || 'System' }}</p>
              </div>
              <div class="col-span-2 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="openEditModal(category)"
                    class="p-2 text-charcoal-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(category)"
                    class="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
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
          Showing {{ ((currentPage - 1) * limit) + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }} categories
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

    <!-- Create/Edit Category Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-charcoal-800">
            {{ isEditMode ? 'Edit Category' : 'Create New Category' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 text-charcoal-500 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label for="categoryName" class="block text-sm font-medium text-charcoal-700 mb-2">
              Category Name *
            </label>
            <input
              id="categoryName"
              v-model="formData.category_name"
              type="text"
              required
              maxlength="100"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-charcoal-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              maxlength="500"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter category description"
            ></textarea>
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
              <span v-else>{{ isEditMode ? 'Update Category' : 'Create Category' }}</span>
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
            <h2 class="text-lg font-semibold text-charcoal-800">Delete Category</h2>
            <p class="text-sm text-charcoal-600">This action cannot be undone</p>
          </div>
        </div>

        <p class="text-charcoal-700 mb-6">
          Are you sure you want to delete the category "<strong>{{ categoryToDelete?.category_name }}</strong>"?
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
            @click="deleteCategory"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete Category</span>
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
import { api } from '../../services/api'
import { SettingsAPI } from '../../services/api'

// Import icons
import {
  ChevronRightIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'CategoryManagement',
  components: {
    ChevronRightIcon,
    ArrowPathIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    TagIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon
  },
  setup() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    
    // Reactive state
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const categories = ref([])
    const searchQuery = ref('')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const limit = ref(20)
    const total = ref(0)
    const totalPages = ref(0)
    
    // Modal state
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditMode = ref(false)
    const editingCategory = ref(null)
    const categoryToDelete = ref(null)
    
    // Form data
    const formData = ref({
      category_name: '',
      description: ''
    })
    
    // Computed
    const paginationInfo = computed(() => {
      if (total.value === 0) return 'No categories found'
      const start = ((currentPage.value - 1) * limit.value) + 1
      const end = Math.min(currentPage.value * limit.value, total.value)
      return `${start}-${end} of ${total.value} categories`
    })
    
    // Methods
    const loadCategories = async () => {
      try {
        loading.value = true
        
        const params = {
          page: currentPage.value,
          limit: limit.value,
          order_by: 'category_name',
          sort_order: sortOrder.value
        }
        
        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }
        
        const response = await SettingsAPI.getCategories(params)
        
        if (response.success) {
          categories.value = response.data || []
          total.value = response.total || 0
          totalPages.value = response.totalPages || 0
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error loading categories:', error)
        showError('Failed to load categories')
      } finally {
        loading.value = false
      }
    }

    const debouncedSearch = useDebounce(() => {
      currentPage.value = 1
      loadCategories()
    }, 300)
    
    const refreshData = () => {
      loadCategories()
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadCategories()
      }
    }
    
    const openCreateModal = () => {
      isEditMode.value = false
      editingCategory.value = null
      formData.value = {
        category_name: '',
        description: ''
      }
      showModal.value = true
    }
    
    const openEditModal = (category) => {
      isEditMode.value = true
      editingCategory.value = category
      formData.value = {
        category_name: category.category_name,
        description: category.description || ''
      }
      showModal.value = true
    }
    
    const closeModal = () => {
      showModal.value = false
      isEditMode.value = false
      editingCategory.value = null
      formData.value = {
        category_name: '',
        description: ''
      }
    }
    
    const saveCategory = async () => {
      try {
        saving.value = true
        
        let response
        if (isEditMode.value) {
          response = await SettingsAPI.updateCategory(editingCategory.value.name, {
            category_name: formData.value.category_name,
            description: formData.value.description
          })
        } else {
          response = await SettingsAPI.createCategory({
            category_name: formData.value.category_name,
            description: formData.value.description
          })
        }
        
        if (response.success) {
          showSuccess(isEditMode.value ? 'Category updated successfully' : 'Category created successfully')
          closeModal()
          loadCategories()
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error saving category:', error)
        showError(error.response?.data?.message || 'Failed to save category')
      } finally {
        saving.value = false
      }
    }
    
    const confirmDelete = (category) => {
      categoryToDelete.value = category
      showDeleteModal.value = true
    }
    
    const closeDeleteModal = () => {
      showDeleteModal.value = false
      categoryToDelete.value = null
    }
    
    const deleteCategory = async () => {
      try {
        deleting.value = true
        
        const response = await SettingsAPI.deleteCategory(categoryToDelete.value.name)
        
        if (response.success) {
          showSuccess('Category deleted successfully')
          closeDeleteModal()
          loadCategories()
        } else {
          showError(response.error)
        }
        
      } catch (error) {
        console.error('Error deleting category:', error)
        showError('Failed to delete category')
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
      loadCategories()
    })
    
    return {
      loading,
      saving,
      deleting,
      categories,
      searchQuery,
      sortOrder,
      currentPage,
      limit,
      total,
      totalPages,
      showModal,
      showDeleteModal,
      isEditMode,
      editingCategory,
      categoryToDelete,
      formData,
      paginationInfo,
      loadCategories,
      debouncedSearch,
      refreshData,
      goToPage,
      openCreateModal,
      openEditModal,
      closeModal,
      saveCategory,
      confirmDelete,
      closeDeleteModal,
      deleteCategory,
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
  
  .col-span-4,
  .col-span-2 {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .text-right {
    text-align: left;
  }
}
</style>