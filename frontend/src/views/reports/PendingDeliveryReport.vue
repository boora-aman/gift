<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Search Pending Deliveries</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Gift ID Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gift ID</label>
            <input
              v-model="filters.giftId"
              type="text"
              placeholder="Enter Gift ID..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Gift Name Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gift Name</label>
            <input
              v-model="filters.giftName"
              type="text"
              placeholder="Enter Gift Name..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Persona Details Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Persona Details</label>
            <input
              v-model="filters.personaDetails"
              type="text"
              placeholder="Name, Emirates ID, Phone..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <button
            @click="applyFilters"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-50"
          >
            Search
          </button>
          <button
            @click="clearFilters"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Clear Search
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- Results Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Pending Deliveries ({{ totalRecords }} total)
            </h3>
            <div class="flex items-center space-x-4">
              <!-- Export Button -->
              <button
                @click="exportReport"
                :disabled="isExporting || reportData.length === 0"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-50"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                {{ isExporting ? 'Exporting...' : 'Export' }}
              </button>
              
              <!-- Sort -->
              <select
                v-model="sortBy"
                @change="applyFilters"
                class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="creation">Sort by Created Date</option>
                <option value="date">Sort by Dispatch Date</option>
                <option value="gift_name">Sort by Gift Name</option>
                <option value="owner_full_name">Sort by Owner Name</option>
              </select>
              
              <!-- Sort Direction -->
              <button
                @click="toggleSortOrder"
                class="p-1 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowUpIcon v-if="sortOrder === 'asc'" class="h-4 w-4" />
                <ArrowDownIcon v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>



        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gift Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gift</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coordinator</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dispatch Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days Pending</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                  </div>
                  <div class="mt-2">Loading...</div>
                </td>
              </tr>
              <tr v-else-if="reportData.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No pending deliveries found
                </td>
              </tr>
              <tr v-else v-for="record in reportData" :key="record.dispatch_id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.gift_id || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.gift_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ record.category }}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">{{ record.barcode_value }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400" v-if="record.gift_value">
                      Value: {{ record.gift_value }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.owner_full_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400" v-if="record.emirates_id">{{ record.emirates_id }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ record.coordinator_full_name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm text-gray-900 dark:text-white">{{ record.mobile_number }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400" v-if="record.address">{{ record.address }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(record.dispatch_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.days_since_dispatch }} days</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm text-gray-900 dark:text-white">{{ record.creator_name || 'Unknown' }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDateTime(record.created_date) }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }} entries
            </div>
            <div class="flex space-x-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium',
                  page === currentPage
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'
import { ReportsAPI } from '../../services/api'
import { useToast } from '../../composables/useToast'
import { exportToExcel } from '../../utils/exportUtils'

export default {
  name: 'PendingDeliveryReport',
  components: {
    ArrowDownTrayIcon,
    ArrowUpIcon,
    ArrowDownIcon
  },
  setup() {
    const { showToast } = useToast()
    return { showToast }
  },
  data() {
    return {
      loading: false,
      isExporting: false,
      reportData: [],
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      sortBy: 'creation',
      sortOrder: 'desc',
      filters: {
        giftId: '',
        giftName: '',
        personaDetails: ''
      }
    }
  },
  computed: {
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    this.loadReport()
  },
  methods: {

    async loadReport() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          order_by: this.sortBy,
          sort_order: this.sortOrder,
          gift_id: this.filters.giftId,
          gift_name: this.filters.giftName,
          persona_details: this.filters.personaDetails
        }

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const result = await ReportsAPI.getPendingDeliveryReport(params)
        
        if (result.success) {
          this.reportData = result.data
          this.totalRecords = result.total
          this.totalPages = result.totalPages
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('Error loading report:', error)
        this.showToast('Failed to load report: ' + error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    async exportReport() {
      this.isExporting = true
      try {
        const params = {
          limit: 10000, // Get all data for export
          order_by: this.sortBy,
          sort_order: this.sortOrder,
          gift_id: this.filters.giftId,
          gift_name: this.filters.giftName,
          persona_details: this.filters.personaDetails
        }

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const result = await ReportsAPI.getPendingDeliveryReport(params)
        
        if (!result.success) {
          throw new Error(result.error)
        }

        const columns = [
          { key: 'gift_id', title: 'Gift Code' },
          { key: 'gift_name', title: 'Gift Name' },
          { key: 'category', title: 'Category' },
          { key: 'barcode_value', title: 'Barcode' },
          { key: 'gift_value', title: 'Gift Value' },
          { key: 'owner_full_name', title: 'Owner Name' },
          { key: 'coordinator_full_name', title: 'Coordinator Name' },
          { key: 'emirates_id', title: 'Emirates ID' },
          { key: 'mobile_number', title: 'Mobile Number' },
          { key: 'address', title: 'Address' },
          { key: 'dispatch_date', title: 'Dispatch Date' },
          { key: 'days_since_dispatch', title: 'Days Since Dispatch' },
          { key: 'creator_name', title: 'Created By' },
          { key: 'created_date', title: 'Created Date & Time', formatter: this.formatDateTime }
        ]

        exportToExcel(result.data, columns, 'Pending_Delivery_Report')
        this.showToast('Report exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        this.showToast('Failed to export report: ' + error.message, 'error')
      } finally {
        this.isExporting = false
      }
    },

    applyFilters() {
      this.currentPage = 1
      this.loadReport()
    },

    clearFilters() {
      this.filters = {
        giftId: '',
        giftName: '',
        personaDetails: ''
      }
      this.applyFilters()
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.applyFilters()
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadReport()
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }
}
</script>