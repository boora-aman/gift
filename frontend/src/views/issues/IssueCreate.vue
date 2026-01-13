<template>
  <div class="min-h-full bg-desert-sand-50">
    <!-- Header -->
    <div class="bg-white shadow-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.push('/issues')"
              class="p-2 rounded-lg text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-charcoal-900">
                Dispatch New Gift
              </h1>
              <p class="text-charcoal-600">Create a new gift dispatch for a recipient</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 safe-area-padding">
      <form @submit.prevent="createIssue" class="space-y-8">
        <!-- Gift Selection -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Gift Selection</h2>
          
          <div v-if="preselectedGift" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <GiftIcon class="w-6 h-6 text-gray-700" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-charcoal-900">{{ preselectedGift.gift_name }}</h3>
                <p class="text-sm text-charcoal-600">
                  {{ preselectedGift.barcode_value || preselectedGift.name }}
                </p>
              </div>
              <button
                type="button"
                @click="clearGiftSelection"
                class="text-charcoal-500 hover:text-charcoal-700"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-else>
            <div class="space-y-4">
              <!-- Search Gifts -->
              <div>
                <label for="gift_search" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Search Gifts
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon class="w-5 h-5 text-charcoal-400" />
                  </div>
                  <input
                    id="gift_search"
                    v-model="giftSearch"
                    type="text"
                    class="w-full pl-10 pr-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Search by name, code, or category..."
                  />
                </div>
              </div>

              <!-- Gift List -->
              <div class="max-h-64 overflow-y-auto border border-charcoal-200 rounded-lg">
                <div v-if="availableGifts.length === 0" class="p-4 text-center text-charcoal-600">
                  No available gifts found
                </div>
                <div v-else>
                  <div
                    v-for="gift in filteredGifts"
                    :key="gift.name"
                    @click="selectGift(gift)"
                    class="p-4 border-b border-charcoal-200 last:border-b-0 hover:bg-desert-sand-50 cursor-pointer transition-colors"
                  >
                    <div class="flex items-center space-x-4">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <GiftIcon class="w-5 h-5 text-gray-700" />
                      </div>
                      <div class="flex-1">
                        <h4 class="font-medium text-charcoal-900">{{ gift.gift_name }}</h4>
                        <div class="flex items-center space-x-2 text-sm text-charcoal-600">
                          <span>{{ gift.barcode_value || gift.name }}</span>
                          <span>•</span>
                          <span class="capitalize">{{ gift.category }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-if="errors.gift" class="mt-2 text-sm text-red-600">{{ errors.gift }}</p>
        </div>

        <!-- Recipient Information -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Recipient Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="recipient_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                Full Name *
              </label>
              <input
                id="recipient_name"
                v-model="form.recipient_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter recipient's full name"
              />
              <p v-if="errors.recipient_name" class="mt-1 text-sm text-red-600">{{ errors.recipient_name }}</p>
            </div>

            <div>
              <label for="recipient_email" class="block text-sm font-medium text-charcoal-700 mb-2">
                Email Address *
              </label>
              <input
                id="recipient_email"
                v-model="form.recipient_email"
                type="email"
                required
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter recipient's email"
              />
              <p v-if="errors.recipient_email" class="mt-1 text-sm text-red-600">{{ errors.recipient_email }}</p>
            </div>

            <div>
              <label for="recipient_phone" class="block text-sm font-medium text-charcoal-700 mb-2">
                Phone Number
              </label>
              <input
                id="recipient_phone"
                v-model="form.recipient_phone"
                type="tel"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="+971 50 123 4567"
              />
              <p v-if="errors.recipient_phone" class="mt-1 text-sm text-red-600">{{ errors.recipient_phone }}</p>
            </div>

            <div>
              <label for="recipient_organization" class="block text-sm font-medium text-charcoal-700 mb-2">
                Organization
              </label>
              <input
                id="recipient_organization"
                v-model="form.recipient_organization"
                type="text"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter organization name (optional)"
              />
              <p v-if="errors.recipient_organization" class="mt-1 text-sm text-red-600">{{ errors.recipient_organization }}</p>
            </div>
          </div>

          <div class="mt-6">
            <label for="delivery_address" class="block text-sm font-medium text-charcoal-700 mb-2">
              Delivery Address
            </label>
            <textarea
              id="delivery_address"
              v-model="form.delivery_address"
              rows="3"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter delivery address (optional)"
            ></textarea>
            <p v-if="errors.delivery_address" class="mt-1 text-sm text-red-600">{{ errors.delivery_address }}</p>
          </div>
        </div>

        <!-- Dispatch Details -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Dispatch Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="issue_date" class="block text-sm font-medium text-charcoal-700 mb-2">
                Dispatch Date *
              </label>
              <input
                id="issue_date"
                v-model="form.issue_date"
                type="date"
                required
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p v-if="errors.issue_date" class="mt-1 text-sm text-red-600">{{ errors.issue_date }}</p>
            </div>

            <div>
              <label for="reference_id" class="block text-sm font-medium text-charcoal-700 mb-2">
                Reference ID
              </label>
              <input
                id="reference_id"
                v-model="form.reference_id"
                type="text"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter reference ID (optional)"
              />
              <p v-if="errors.reference_id" class="mt-1 text-sm text-red-600">{{ errors.reference_id }}</p>
            </div>
          </div>

          <div class="mt-6">
            <label for="notes" class="block text-sm font-medium text-charcoal-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter any notes about this gift dispatch (optional)"
            ></textarea>
            <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes }}</p>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Notification Settings</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-charcoal-900">Send Email Notification</h3>
                <p class="text-sm text-charcoal-600">Send gift details to recipient's email</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="form.send_email"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>

            <div v-if="form.send_email" class="pl-4 border-l-2 border-gray-200">
              <label for="email_message" class="block text-sm font-medium text-charcoal-700 mb-2">
                Custom Message
              </label>
              <textarea
                id="email_message"
                v-model="form.email_message"
                rows="3"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Add a personal message to the email (optional)"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            @click="$router.push('/issues')"
            class="px-6 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <ArrowPathIcon class="w-4 h-4 mr-2 animate-spin" />
              Creating Dispatch...
            </span>
            <span v-else>Dispatch Gift</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'
import { GiftAPI, GiftIssueAPI } from '../../services/api.js'

// Icons
import {
  ArrowLeftIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'IssueCreate',
  components: {
    ArrowLeftIcon,
    GiftIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ArrowPathIcon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { showNotification } = useNotifications()

    // State
    const loading = ref(false)
    const errors = ref({})
    const giftSearch = ref('')
    const availableGifts = ref([])
    const preselectedGift = ref(null)
    
    const form = reactive({
      gift: '',
      recipient_name: '',
      recipient_email: '',
      recipient_phone: '',
      recipient_organization: '',
      delivery_address: '',
      issue_date: new Date().toISOString().split('T')[0],
      reference_id: '',
      notes: '',
      send_email: true,
      email_message: ''
    })

    // Computed
    const filteredGifts = computed(() => {
      if (!giftSearch.value) return availableGifts.value
      
      const search = giftSearch.value.toLowerCase()
      return availableGifts.value.filter(gift =>
        gift.gift_name.toLowerCase().includes(search) ||
        (gift.barcode_value && gift.barcode_value.toLowerCase().includes(search)) ||
        gift.category.toLowerCase().includes(search)
      )
    })

    // Methods
    const loadAvailableGifts = async () => {
      try {
        // Fetch available gifts from API
        const response = await GiftAPI.list({ status: 'Available' }, 1, 100)
        
        if (response.success) {
          availableGifts.value = response.data
        } else {
          showNotification(response.error || 'Failed to load available gifts', 'error')
          return
        }

        // Check for preselected gift from URL
        const preselectedId = route.query.gift
        if (preselectedId) {
          let gift = availableGifts.value.find(g => g.name === preselectedId)
          
          // If gift not found in available gifts, try to fetch it directly
          if (!gift) {
            const giftResponse = await GiftAPI.get(preselectedId)
            if (giftResponse.success && giftResponse.data.status === 'Available') {
              gift = giftResponse.data
              // Add it to the available gifts list
              availableGifts.value.unshift(gift)
            }
          }
          
          if (gift) {
            selectGift(gift)
          } else {
            showNotification('Selected gift is not available for dispatch', 'warning')
          }
        }

      } catch (error) {
        console.error('Failed to load gifts:', error)
        showNotification('Failed to load available gifts', 'error')
      }
    }

    const selectGift = (gift) => {
      preselectedGift.value = gift
      form.gift = gift.name
      errors.value.gift = ''
    }

    const clearGiftSelection = () => {
      preselectedGift.value = null
      form.gift = ''
    }

    const validateForm = () => {
      errors.value = {}

      if (!form.gift) {
        errors.value.gift = 'Please select a gift to dispatch'
      }

      if (!form.recipient_name.trim()) {
        errors.value.recipient_name = 'Recipient name is required'
      }

      if (!form.recipient_email.trim()) {
        errors.value.recipient_email = 'Recipient email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipient_email)) {
        errors.value.recipient_email = 'Please enter a valid email address'
      }

      if (!form.issue_date) {
        errors.value.issue_date = 'Dispatch date is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const createIssue = async () => {
      if (!validateForm()) return

      try {
        loading.value = true

        // Prepare issue data for API
        const issueData = {
          gift: form.gift,
          recipient_name: form.recipient_name,
          recipient_email: form.recipient_email,
          recipient_phone: form.recipient_phone || '',
          recipient_organization: form.recipient_organization || '',
          delivery_address: form.delivery_address || '',
          issue_date: form.issue_date,
          reference_id: form.reference_id || '',
          notes: form.notes || '',
          send_email: form.send_email,
          email_message: form.email_message || ''
        }

        const response = await GiftIssueAPI.create(issueData)
        
        if (response.success) {
          showNotification('Gift dispatched successfully', 'success')
          router.push('/issues')
        } else {
          showNotification(response.error || 'Failed to dispatch gift', 'error')
        }

      } catch (error) {
        console.error('Failed to create issue:', error)
        showNotification('Failed to dispatch gift. Please try again.', 'error')
      } finally {
        loading.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      loadAvailableGifts()
    })

    return {
      form,
      errors,
      loading,
      giftSearch,
      availableGifts,
      preselectedGift,
      filteredGifts,
      selectGift,
      clearGiftSelection,
      createIssue
    }
  }
}
</script>

<style scoped>
/* Form styling */
input:focus,
select:focus,
textarea:focus {
  outline: none !important;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Toggle switch styling */
.peer:checked ~ .peer-checked\:bg-gray-600 {
  background-color: #10b981;
}

.peer:focus ~ .peer-focus\:ring-emerald-300 {
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
}

/* Transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
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
  
  input, select, textarea {
    border-width: 2px;
  }
}
</style>
