<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Search Barcode Print Report</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Gift ID Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gift No</label>
            <input v-model="filters.giftNo" type="text" placeholder="Enter Gift No..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" />
          </div>

          <!-- Ring Number Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ring Number</label>
            <input v-model="filters.ringNumber" type="text" placeholder="Enter Ring Number..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" />
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <button @click="applyFilters" :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black disabled:opacity-50">
            Search
          </button>
          <button @click="clearFilters" class="text-sm text-gray-500 hover:text-gray-700">
            Clear Search
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Results Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              Barcode Print Report ({{ totalRecords }} total)
            </h3>
            <div class="flex items-center space-x-4">
              <!-- Print Button -->
              <button @click="printSelectedRecords" :disabled="reportData.length === 0"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50">
                <PrinterIcon class="h-4 w-4 mr-2" />
                Print All
              </button>

              <!-- Sort -->
              <select v-model="sortBy" @change="applyFilters"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option value="creation">Sort by Created Date</option>
                <option value="gift_name">Sort by Gift Name</option>
                <option value="barcode_value">Sort by Ring Number</option>
                <option value="status">Sort by Status</option>
              </select>

              <!-- Sort Direction -->
              <button @click="toggleSortOrder"
                class="p-1 rounded text-gray-400 hover:text-gray-600">
                <ArrowUpIcon v-if="sortOrder === 'asc'" class="h-4 w-4" />
                <ArrowDownIcon v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" 
                    class="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr. No</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gift No</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ring Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued To</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                  </div>
                  <div class="mt-2">Loading...</div>
                </td>
              </tr>
              <tr v-else-if="reportData.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  No records found
                </td>
              </tr>
              <tr v-else v-for="(record, index) in reportData" :key="record.gift_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" v-model="selectedRecords" :value="record.gift_id"
                    class="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ ((currentPage - 1) * pageSize) + index + 1 }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ record.gift_id || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ record.barcode_value || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ record.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ record.owner_full_name || 'Not Assigned' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="record.barcode_image" class="flex items-center">
                    <img :src="record.barcode_image" :alt="record.barcode_value" 
                      class="h-8 w-auto border border-gray-200 rounded" />
                  </div>
                  <div v-else class="text-sm text-gray-400">No barcode</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="printSingleRecord(record)" :disabled="!record.barcode_image"
                    class="text-gray-700 hover:text-gray-900 disabled:text-gray-400">
                    Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }}
              of {{ totalRecords }} entries
            </div>
            <div class="flex space-x-2">
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="[
                'px-3 py-2 border border-gray-300 rounded-md text-sm font-medium',
                page === currentPage
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              ]">
                {{ page }}
              </button>
              <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
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
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'
import { ReportsAPI } from '../../services/api'
import { useToast } from '../../composables/useToast'
import { exportToExcel } from '../../utils/exportUtils'

export default {
  name: 'BarcodeReport',
  components: {
    PrinterIcon,
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
      selectedRecords: [],
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      sortBy: 'creation',
      sortOrder: 'desc',
      filters: {
        giftNo: '',
        ringNumber: ''
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
    },
    allSelected() {
      return this.reportData.length > 0 && this.selectedRecords.length === this.reportData.length
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
          gift_no: this.filters.giftNo,
          ring_number: this.filters.ringNumber
        }

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const result = await ReportsAPI.getBarcodeReportData(params)

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
          gift_no: this.filters.giftNo,
          ring_number: this.filters.ringNumber
        }

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const result = await ReportsAPI.getBarcodeReportData(params)

        if (!result.success) {
          throw new Error(result.error)
        }

        const columns = [
          { key: 'serial_no', title: 'Sr. No' },
          { key: 'gift_id', title: 'Gift No' },
          { key: 'barcode_value', title: 'Ring Number' },
          { key: 'status', title: 'Status' },
          { key: 'owner_full_name', title: 'Issued To' },
          { key: 'gift_name', title: 'Gift Name' },
          { key: 'category', title: 'Category' },
          { key: 'created_date', title: 'Created Date' }
        ]

        // Add serial numbers to data for export
        const exportData = result.data.map((item, index) => ({
          ...item,
          serial_no: index + 1
        }))

        exportToExcel(exportData, columns, 'Barcode_Print_Report')
        this.showToast('Report exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        this.showToast('Failed to export report: ' + error.message, 'error')
      } finally {
        this.isExporting = false
      }
    },

    printSelectedRecords() {
      const recordsToPrint = this.selectedRecords.length > 0 
        ? this.reportData.filter(record => this.selectedRecords.includes(record.gift_id))
        : this.reportData

      if (recordsToPrint.length === 0) {
        this.showToast('No records to print', 'error')
        return
      }

      this.openPrintWindow(recordsToPrint)
    },

    printSingleRecord(record) {
      this.openPrintWindow([record])
    },

    openPrintWindow(records) {
      try {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          this.showToast('Please allow pop-ups to print the report', 'error')
          return
        }

        // Generate print content with 6 records per page
        const printContent = this.generatePrintContent(records)
        
        printWindow.document.write(printContent)
        printWindow.document.close()
        
        // Wait for images to load before printing
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print()
          }, 1000)
        })
        
      } catch (error) {
        console.error('Print error:', error)
        this.showToast('Failed to open print window', 'error')
      }
    },

    generatePrintContent(records) {
      const recordsPerPage = 6
      const pages = []
      
      // Split records into pages of 6
      for (let i = 0; i < records.length; i += recordsPerPage) {
        pages.push(records.slice(i, i + recordsPerPage))
      }

      const pageContents = pages.map((pageRecords, pageIndex) => `
        <div class="print-page">
          <div class="page-header">
            <h2>Barcode Print Report - Page ${pageIndex + 1}</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Gift No</th>
                <th>Ring Number</th>
                <th>Status</th>
                <th>Issued To</th>
                <th>Barcode</th>
              </tr>
            </thead>
            <tbody>
              ${pageRecords.map((record, index) => `
                <tr>
                  <td>${(pageIndex * recordsPerPage) + index + 1}</td>
                  <td>${record.gift_id || 'N/A'}</td>
                  <td>${record.barcode_value || 'N/A'}</td>
                  <td>${record.status}</td>
                  <td>${record.owner_full_name || 'Not Assigned'}</td>
                  <td class="barcode-cell">
                    ${record.barcode_image ? 
                      `<img src="${record.barcode_image}" alt="${record.barcode_value}" class="barcode-image" />` : 
                      'No barcode'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Barcode Print Report</title>
            <meta charset="utf-8">
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              
              body {
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.2;
                margin: 0;
                padding: 0;
              }
              
              .print-page {
                page-break-after: always;
                page-break-inside: avoid;
                width: 100%;
                display: block;
                padding: 10mm 0;
                min-height: calc(100vh - 20mm);
              }
              
              .print-page:last-child {
                page-break-after: auto;
              }
              
              .page-header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #333;
                padding-bottom: 8px;
              }
              
              .page-header h2 {
                margin: 0 0 3px 0;
                font-size: 14pt;
                font-weight: bold;
              }
              
              .page-header p {
                margin: 0;
                font-size: 9pt;
                color: #666;
              }
              
              .page-spacer {
                height: 15px;
              }
              
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
              }
              
              .print-table th,
              .print-table td {
                border: 1px solid #333;
                padding: 6px 3px;
                text-align: left;
                vertical-align: middle;
                page-break-inside: avoid;
              }
              
              .print-table th {
                background-color: #f0f0f0;
                font-weight: bold;
                font-size: 8pt;
                text-align: center;
                height: 18px;
              }
              
              .print-table td {
                font-size: 9pt;
                height: 3.2cm;
                max-height: 3.2cm;
                min-height: 3.2cm;
                vertical-align: middle;
              }
              
              .barcode-cell {
                text-align: center;
                width: 120px;
                padding: 5px;
              }
              
              .barcode-image {
                width: 6cm;
                height: 2.8cm;
                object-fit: contain;
                border: 1px solid #ddd;
                background: white;
              }
              
              /* Column widths */
              .print-table th:nth-child(1),
              .print-table td:nth-child(1) { width: 60px; }
              .print-table th:nth-child(2),
              .print-table td:nth-child(2) { width: 90px; }
              .print-table th:nth-child(3),
              .print-table td:nth-child(3) { width: 90px; }
              .print-table th:nth-child(4),
              .print-table td:nth-child(4) { width: 80px; }
              .print-table th:nth-child(5),
              .print-table td:nth-child(5) { width: 140px; }
              .print-table th:nth-child(6),
              .print-table td:nth-child(6) { width: 120px; }
            </style>
          </head>
          <body>
            ${pageContents}
          </body>
        </html>
      `
    },

    applyFilters() {
      this.currentPage = 1
      this.selectedRecords = []
      this.loadReport()
    },

    clearFilters() {
      this.filters = {
        giftNo: '',
        ringNumber: ''
      }
      this.selectedRecords = []
      this.applyFilters()
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.applyFilters()
    },

    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedRecords = []
      } else {
        this.selectedRecords = this.reportData.map(record => record.gift_id)
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.selectedRecords = []
        this.loadReport()
      }
    }
  }
}
</script>