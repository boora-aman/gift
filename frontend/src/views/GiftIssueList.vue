<template>
  <div class="min-h-full bg-desert-sand-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white shadow-card">
      <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-3">
          <!-- Back Button -->
          <button
            @click="$router.go(-1)"
            class="p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            title="Go back"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>

          <div class="flex items-center space-x-2">
            <DocumentCheckIcon class="w-5 h-5 text-gray-700" />
            <div>
              <h1 class="text-lg font-semibold text-charcoal-900">Gift Dispatch</h1>
              <p v-if="!loading && issues.length > 0" class="text-xs text-charcoal-600">
                {{ issues.length }} dispatch{{ issues.length !== 1 ? 'es' : '' }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-1">
          <!-- Search Toggle -->
          <button @click="showSearch = !showSearch"
            class="p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            :class="{ 'bg-gray-100 text-gray-700': showSearch || searchQuery }">
            <MagnifyingGlassIcon class="w-4 h-4" />
          </button>

          <!-- Filter Toggle -->
          <button @click="showFilters = !showFilters"
            class="relative p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            :class="{ 'bg-gray-100 text-gray-700': showFilters || activeFilterCount > 0 }">
            <FunnelIcon class="w-4 h-4" />
            <span v-if="activeFilterCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-gray-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:block bg-white shadow-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <DocumentCheckIcon class="w-6 h-6 text-gray-700" />
            <div>
              <h1 class="text-xl font-bold text-charcoal-900">Gift Dispatch</h1>
              <p class="text-sm text-charcoal-600">Track dispatched gifts and manage recipients</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Bar (Mobile Expandable) -->
    <div v-if="showSearch || !isMobile" class="bg-white border-b border-desert-sand-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by recipient name, gift, or Emirates ID..."
            class="w-full pl-9 pr-10 py-2 text-sm border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
            @input="debouncedSearch"
          />
          <!-- Clear Search Button -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-600 transition-colors"
            title="Clear search"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </div>

        <!-- Search Results Summary -->
        <div v-if="searchQuery && !loading" class="mt-1.5 text-xs text-charcoal-600">
          {{ issues.length }} result{{ issues.length !== 1 ? 's' : '' }} for "{{ searchQuery }}"
        </div>
      </div>
    </div>

    <!-- Filters (Expandable) -->
    <div v-if="showFilters || !isMobile" class="bg-white border-b border-desert-sand-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <!-- Filter Header with Active Count -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-charcoal-700">
            Filters
            <span v-if="activeFilterCount > 0" class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ activeFilterCount }}
            </span>
          </h3>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-xs text-gray-700 hover:text-gray-800 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Category Filter -->
          <div>
            <label class="block text-xs font-medium text-charcoal-700 mb-1">Category</label>
            <CustomDropdown
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="All Categories"
              :disabled="categoriesLoading"
              size="sm"
              icon="TagIcon"
            />
            <div v-if="categoriesLoading" class="mt-0.5 text-xs text-charcoal-500">Loading categories...</div>
          </div>

          <!-- Dispatch Date Filter -->
          <div>
            <label class="block text-xs font-medium text-charcoal-700 mb-1">Dispatched</label>
            <CustomDropdown
              v-model="filters.dateRange"
              :options="dateRangeOptions"
              placeholder="All Time"
              size="sm"
              icon="CalendarIcon"
            />
          </div>

          <!-- Emirates ID Search -->
          <div>
            <label class="block text-xs font-medium text-charcoal-700 mb-1">Emirates ID</label>
            <input
              v-model="filters.emiratesId"
              type="text"
              placeholder="Search by Emirates ID"
              class="w-full px-2.5 py-1.5 text-sm border border-charcoal-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
              :class="{ 'border-emerald-500 bg-gray-50': filters.emiratesId }"
            />
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-xs font-medium text-charcoal-700 mb-1">Sort By</label>
            <CustomDropdown
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Sort Order"
              size="sm"
              icon="BarsArrowDownIcon"
            />
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mt-3 flex flex-wrap gap-1.5">
          <span class="text-xs text-charcoal-600">Active:</span>

          <span v-if="searchQuery" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Search: "{{ searchQuery }}"
            <button @click="clearSearch" class="ml-1 text-gray-700 hover:text-gray-800">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>

          <span v-if="filters.category" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Category: {{ filters.category }}
            <button @click="filters.category = ''" class="ml-1 text-blue-600 hover:text-blue-800">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>

          <span v-if="filters.dateRange" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Date: {{ formatDateRangeLabel(filters.dateRange) }}
            <button @click="filters.dateRange = ''" class="ml-1 text-purple-600 hover:text-purple-800">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>

          <span v-if="filters.emiratesId" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            Emirates ID: {{ filters.emiratesId }}
            <button @click="filters.emiratesId = ''" class="ml-1 text-orange-600 hover:text-orange-800">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-card p-6 animate-pulse">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-12 h-12 bg-charcoal-200 rounded-xl"></div>
            <div class="flex-1">
              <div class="h-4 bg-charcoal-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-charcoal-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-3 bg-charcoal-200 rounded"></div>
            <div class="h-3 bg-charcoal-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !loading" class="max-w-md mx-auto text-center py-12">
      <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-charcoal-900 mb-2">Something went wrong</h3>
      <p class="text-charcoal-600 mb-6">{{ error }}</p>
      <button
        @click="retryLoad"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors"
      >
        <ArrowPathIcon class="w-5 h-5 mr-2" />
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!issues.length && !loading && !error" class="max-w-md mx-auto text-center py-12">
      <DocumentCheckIcon class="w-16 h-16 text-charcoal-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-charcoal-900 mb-2">
        {{ searchQuery || hasActiveFilters ? 'No gift dispatches found' : 'No gift dispatches yet' }}
      </h3>
      <p class="text-charcoal-600 mb-6">
        {{ emptyStateMessage }}
      </p>

      <!-- Different actions based on state -->
      <div class="space-y-3">
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="inline-flex items-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-xl text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
        >
          <XMarkIcon class="w-5 h-5 mr-2" />
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Issues List -->
    <div v-else class="max-w-7xl mx-auto py-8">

      <!-- Desktop List View -->
      <div v-if="!isMobile" class="px-4 md:px-0">
        <div class="bg-white rounded-xl shadow-card overflow-hidden">
          <!-- Table Header -->
          <div class="bg-charcoal-50 border-b border-charcoal-200">
            <div class="grid grid-cols-12 gap-2 px-6 py-4 text-sm font-medium text-charcoal-700">
              <div class="col-span-1">Photo</div>
              <div class="col-span-3">Recipient</div>
              <div class="col-span-2">Gift Name</div>
              <div class="col-span-1">Category</div>
              <div class="col-span-2">Emirates ID</div>
              <div class="col-span-2">Dispatch Date</div>
              <div class="col-span-1">Actions</div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-charcoal-100">
            <div v-for="issue in issues" :key="issue.name"
              class="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-charcoal-50 transition-colors cursor-pointer"
              @click="router.push(`/issues/${issue.name}`)">

              <!-- Photo -->
              <div class="col-span-1">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-charcoal-100 flex items-center justify-center">
                  <img
                    v-if="issue.person_photo"
                    :src="getFullImageUrl(issue.person_photo)"
                    :alt="`${issue.owner_full_name || ''} ${issue.owner_full_name || ''}`.trim()"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                  <UserIcon
                    v-else
                    class="w-6 h-6 text-charcoal-400"
                  />
                </div>
              </div>

              <!-- Recipient -->
              <div class="col-span-3">
                <h3 class="font-semibold text-charcoal-900 truncate">
                  {{ `${issue.owner_full_name || ''} ${issue.owner_full_name || ''}`.trim() }}
                </h3>
                <p v-if="issue.mobile_number" class="text-sm text-charcoal-600 truncate">
                  {{ issue.mobile_number }}
                </p>
              </div>

              <!-- Gift Name -->
              <div class="col-span-2">
                <span class="text-sm text-charcoal-900 truncate block">
                  {{ issue.gift_name }}
                </span>
              </div>

              <!-- Category -->
              <div class="col-span-">
                <span class="text-sm text-charcoal-700 truncate block">
                  {{ formatCategory(issue.category) }}
                </span>
              </div>

              <!-- Emirates ID -->
              <div class="col-span-2">
                <span class="font-mono text-sm text-charcoal-800 block truncate">
                  {{ issue.emirates_id }}
                </span>
              </div>

              <!-- Dispatch Date -->
              <div class="col-span-2">
                <span class="text-sm text-charcoal-900">
                  {{ formatDate(issue.date) }}
                </span>
              </div>

              <!-- Actions -->
              <div class="col-span-1">
                <div class="flex items-center space-x-2">
                  <button @click.stop="router.push(`/issues/${issue.name}`)"
                    class="p-2 text-charcoal-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    title="View Details">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div v-else class="px-4 space-y-4">
        <GiftIssueCard v-for="issue in issues" :key="issue.name" :issue="issue"
          @click="router.push(`/issues/${issue.name}`)" />
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center mt-8">
        <button @click="loadMore" :disabled="loadingMore"
          class="inline-flex items-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-xl text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ArrowPathIcon v-if="loadingMore" class="w-5 h-5 mr-2 animate-spin" />
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBreakpoints } from '@composables/useBreakpoints'
import { useDebounce } from '@composables/useDebounce'
import { GiftIssueAPI, GiftAPI } from '@services/api'
import { useNotifications } from '@composables/useNotifications'

// Components
import GiftIssueCard from '../components/GiftIssueCard.vue'
import CustomDropdown from '../components/CustomDropdown.vue'

// Icons
import {
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GiftIssueList',
  components: {
    GiftIssueCard,
    CustomDropdown,
    DocumentCheckIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    XMarkIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    UserIcon
  },
  emits: [],
  setup() {
    const router = useRouter()
    const { isMobile } = useBreakpoints()
    const { showNotification } = useNotifications()

    // State
    const issues = ref([])
    const categories = ref([])
    const loading = ref(true)
    const categoriesLoading = ref(true)
    const loadingMore = ref(false)
    const hasMore = ref(true)
    const currentPage = ref(1)
    const pageSize = 20
    const error = ref(null)

    // UI State
    const showSearch = ref(false)
    const showFilters = ref(false)

    // Search and Filters
    const searchQuery = ref('')
    const filters = ref({
      category: '',
      dateRange: '',
      emiratesId: ''
    })
    const sortBy = ref('creation_desc')

    // Computed
    const hasActiveFilters = computed(() => {
      return searchQuery.value ||
        filters.value.category ||
        filters.value.dateRange ||
        filters.value.emiratesId
    })

    const activeFilterCount = computed(() => {
      let count = 0
      if (searchQuery.value) count++
      if (filters.value.category) count++
      if (filters.value.dateRange) count++
      if (filters.value.emiratesId) count++
      return count
    })

    const emptyStateMessage = computed(() => {
      if (error.value) return 'Please try again or contact support if the problem persists'
      if (searchQuery.value && hasActiveFilters.value) return 'Try different search terms or adjust your filters'
      if (searchQuery.value) return 'Try different search terms'
      if (hasActiveFilters.value) return 'Try adjusting your filters or clear them to see all gift dispatches'
      return 'Gift dispatches will appear here when gifts are dispatched to recipients'
    })

    // Dropdown options
    const categoryOptions = computed(() => [
      ...categories.value.map(cat => ({
        value: cat.category_name,
        label: cat.category_name
      }))
    ])

    const dateRangeOptions = computed(() => [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' }
    ])

    const sortOptions = computed(() => [
      { value: 'creation_desc', label: 'Newest First' },
      { value: 'creation_asc', label: 'Oldest First' }
    ])

    // Debounced search
    const debouncedSearch = useDebounce(() => {
      currentPage.value = 1
      loadIssues(true)
    }, 300)

    // Methods
    const loadIssues = async (reset = false) => {
      try {
        if (reset) {
          loading.value = true
          currentPage.value = 1
          error.value = null
        } else {
          loadingMore.value = true
        }

        // Build filters object for API
        const apiFilters = {}

        // Search query
        if (searchQuery.value) {
          apiFilters.search = searchQuery.value.trim()
        }

        // Category filter
        if (filters.value.category) {
          apiFilters.category = filters.value.category
        }

        // Emirates ID filter
        if (filters.value.emiratesId) {
          apiFilters.emirates_id = filters.value.emiratesId
        }

        // Parse sort order
        const [field, order] = sortBy.value.split('_')
        if (field && order) {
          apiFilters.order_by = field === 'creation' ? 'creation' : field
          apiFilters.sort_order = order
        }

        // Call the API
        const response = await GiftIssueAPI.list({
          ...apiFilters,
          page: currentPage.value,
          limit: pageSize
        })

        // console.log('API Response:', response)

        if (response.success && response.data) {
          const newIssues = response.data || []

        //   console.log('New Issues:', newIssues)
        //   console.log('Issues length:', newIssues.length)

          if (reset) {
            issues.value = newIssues
          } else {
            issues.value = [...issues.value, ...newIssues]
          }

        //   console.log('Final issues array:', issues.value)
          hasMore.value = newIssues.length === pageSize
        } else {
          throw new Error(response.error || 'Invalid response format')
        }

      } catch (err) {
        console.error('Failed to load gift dispatches:', err)
        error.value = err.message || 'Failed to load gift dispatches. Please try again.'

        if (reset) {
          issues.value = []
        }

        showNotification('Failed to load gift dispatches', 'error')
      } finally {
        loading.value = false
        loadingMore.value = false
      }
    }

    const loadCategories = async () => {
      try {
        categoriesLoading.value = true
        const response = await GiftAPI.getCategories()
        if (response.success) {
          categories.value = response.data || []
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        showNotification('Failed to load categories', 'error')
      } finally {
        categoriesLoading.value = false
      }
    }

    const loadMore = () => {
      if (hasMore.value && !loadingMore.value) {
        currentPage.value++
        loadIssues()
      }
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        category: '',
        dateRange: '',
        emiratesId: ''
      }
      sortBy.value = 'creation_desc'
      currentPage.value = 1
      loadIssues(true)
    }

    const clearSearch = () => {
      searchQuery.value = ''
      currentPage.value = 1
      loadIssues(true)
    }

    const retryLoad = () => {
      error.value = null
      loadIssues(true)
    }

    const formatCategory = (category) => {
      return category || 'Other'
    }

    const formatDate = (date) => {
      if (!date) return ''

      const dateObj = new Date(date)
      return dateObj.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatDateRangeLabel = (range) => {
      const labels = {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        quarter: 'This Quarter'
      }
      return labels[range] || range
    }

    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return ''

      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // Handle private files
      if (imagePath.startsWith('/private/') || imagePath.startsWith('private/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return `/api/method/frappe.core.doctype.file.file.download_file?file_url=${cleanPath}`
      }

      // Handle public files
      if (imagePath.startsWith('/files/') || imagePath.startsWith('files/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return cleanPath
      }

      // Default case
      return `/files/${imagePath}`
    }

    const handleImageError = (event) => {
      // Hide the broken image and show the fallback icon
      event.target.style.display = 'none'
      const parent = event.target.parentElement
      if (parent) {
        const icon = parent.querySelector('.fallback-icon')
        if (icon) {
          icon.style.display = 'block'
        }
      }
    }

    // Watchers
    watch([() => filters.value.category, () => filters.value.dateRange, () => filters.value.emiratesId, sortBy], () => {
      currentPage.value = 1
      loadIssues(true)
    })

    // Lifecycle
    onMounted(() => {
      loadIssues(true)
      loadCategories()
    })

    return {
      // State
      issues,
      categories,
      loading,
      categoriesLoading,
      loadingMore,
      hasMore,
      error,

      // UI State
      showSearch,
      showFilters,

      // Search and Filters
      searchQuery,
      filters,
      sortBy,
      hasActiveFilters,
      activeFilterCount,
      emptyStateMessage,
      categoryOptions,
      dateRangeOptions,
      sortOptions,

      // Computed
      isMobile,

      // Router
      router,

      // Methods
      loadMore,
      clearFilters,
      clearSearch,
      retryLoad,
      formatCategory,
      formatDate,
      formatDateRangeLabel,
      getFullImageUrl,
      handleImageError,
      debouncedSearch
    }
  }
}
</script>

<style scoped>
/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none !important;
  }

  .transition-colors {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }

  .border-desert-sand-200 {
    border-color: #6B7280 !important;
  }
}
</style>
