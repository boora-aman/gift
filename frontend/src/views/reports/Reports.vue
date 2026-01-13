<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->


    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Reports Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Barcode Print Report Card -->
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <PrinterIcon class="h-8 w-8 text-gray-600" />
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Barcode Print Report</h3>
                <p class="text-sm text-gray-500">Print barcodes for gifts with A4 formatting</p>
              </div>
            </div>
            <div class="mt-6 flex space-x-3">
              <router-link to="/reports/barcode-print"
                class="flex-1 bg-gray-900 hover:bg-black text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
                View Report
              </router-link>
              <button @click="exportReport('barcode-print')" :disabled="isExporting"
                class="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50">
                <ArrowDownTrayIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Interest Shows Report Card -->
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <HeartIcon class="h-8 w-8 text-gray-600" />
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Interest Shows Report</h3>
                <p class="text-sm text-gray-500">View gifts with interest records, including who created them and when
                </p>
              </div>
            </div>
            <div class="mt-6 flex space-x-3">
              <router-link to="/reports/interest-shows"
                class="flex-1 bg-gray-900 hover:bg-black text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
                View Report
              </router-link>
              <button @click="exportReport('interest-shows')" :disabled="isExporting"
                class="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50">
                <ArrowDownTrayIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Dispatched Gifts Report Card -->
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <TruckIcon class="h-8 w-8 text-gray-600" />
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Dispatched Gifts Report</h3>
                <p class="text-sm text-gray-500">Complete report of all dispatched gifts with delivery details</p>
              </div>
            </div>
            <div class="mt-6 flex space-x-3">
              <router-link to="/reports/dispatched-gifts"
                class="flex-1 bg-gray-900 hover:bg-black text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
                View Report
              </router-link>
              <button @click="exportReport('dispatched-gifts')" :disabled="isExporting"
                class="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50">
                <ArrowDownTrayIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pending Delivery Report Card -->
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-8 w-8 text-gray-600" />
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Pending Delivery Report</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Dispatched gifts that are yet to be delivered</p>
              </div>
            </div>
            <div class="mt-6 flex space-x-3">
              <router-link to="/reports/pending-delivery"
                class="flex-1 bg-gray-900 hover:bg-black text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200">
                View Report
              </router-link>
              <button @click="exportReport('pending-delivery')" :disabled="isExporting"
                class="flex-shrink-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50">
                <ArrowDownTrayIcon class="h-4 w-4" />
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
  DocumentChartBarIcon,
  HeartIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'
import { ReportsAPI } from '../../services/api'
import { useToast } from '../../composables/useToast'
import { exportToExcel } from '../../utils/exportUtils'

export default {
  name: 'Reports',
  components: {
    DocumentChartBarIcon,
    HeartIcon,
    TruckIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    PrinterIcon
  },
  setup() {
    const { showToast } = useToast()
    return { showToast }
  },
  data() {
    return {
      isExporting: false
    }
  },
  methods: {

    async exportReport(reportType) {
      this.isExporting = true
      try {
        const result = await ReportsAPI.exportToExcel(reportType)

        if (!result.success) {
          throw new Error(result.error)
        }

        let fileName = ''
        let columns = []

        switch (reportType) {
          case 'barcode-print':
            fileName = 'Barcode_Print_Report'
            columns = [
              { key: 'gift_id', title: 'Gift No' },
              { key: 'barcode_value', title: 'Ring Number' },
              { key: 'status', title: 'Status' },
              { key: 'owner_full_name', title: 'Issued To' },
              { key: 'gift_name', title: 'Gift Name' },
              { key: 'category', title: 'Category' },
              { key: 'created_date', title: 'Created Date' }
            ]
            break
          case 'interest-shows':
            fileName = 'Interest_Shows_Report'
            columns = [
              { key: 'gift_name', title: 'Gift Name' },
              { key: 'category', title: 'Category' },
              { key: 'barcode_value', title: 'Barcode' },
              { key: 'owner_full_name', title: 'Owner Name' },
              { key: 'coordinator_full_name', title: 'Coordinator Name' },
              { key: 'emirates_id', title: 'Emirates ID' },
              { key: 'mobile_number', title: 'Mobile Number' },
              { key: 'address', title: 'Address' },
              { key: 'interest_date', title: 'Interest Date' },
              { key: 'creator_name', title: 'Created By' },
              { key: 'created_date', title: 'Created Date & Time' }
            ]
            break
          case 'dispatched-gifts':
            fileName = 'Dispatched_Gifts_Report'
            columns = [
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
              { key: 'delivery_status', title: 'Delivery Status' },
              { key: 'delivery_date', title: 'Delivery Date' },
              { key: 'delivery_note', title: 'Delivery Note' },
              { key: 'creator_name', title: 'Created By' },
              { key: 'created_date', title: 'Created Date & Time' }
            ]
            break
          case 'pending-delivery':
            fileName = 'Pending_Delivery_Report'
            columns = [
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
              { key: 'urgency', title: 'Urgency' },
              { key: 'creator_name', title: 'Created By' },
              { key: 'created_date', title: 'Created Date & Time' }
            ]
            break
        }

        exportToExcel(result.data, columns, fileName)
        this.showToast('Report exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        this.showToast('Failed to export report: ' + error.message, 'error')
      } finally {
        this.isExporting = false
      }
    }
  }
}
</script>
