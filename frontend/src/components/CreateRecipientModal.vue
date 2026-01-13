<template>
  <!-- Create Recipient Modal -->
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
        <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-6 pt-6 pb-4">
          <!-- Form Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-semibold text-charcoal-900">Create New Recipient</h3>
              <p class="text-sm text-charcoal-600 mt-1">
                Add recipient details that can be reused for future gifts
              </p>
            </div>
            <button @click="closeModal" class="text-charcoal-400 hover:text-charcoal-600 transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Create Recipient Form -->
          <form @submit.prevent="createRecipient" class="space-y-6">

            <!-- Owner Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Owner Details</h4>
              <div>
                <label for="owner_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Owner Full Name <span class="text-red-500">*</span>
                </label>
                <input 
                  id="owner_full_name" 
                  v-model="form.owner_full_name" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter owner full name"
                  :class="{ 'border-red-500': errors.owner_full_name }" 
                />
                <p v-if="errors.owner_full_name" class="mt-1 text-sm text-red-600">{{ errors.owner_full_name }}</p>
              </div>
            </div>

            <!-- Coordinator Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Coordinator Details</h4>
              <div class="space-y-4">
                <div>
                  <label for="coordinator_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Coordinator Full Name <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="coordinator_full_name" 
                    v-model="form.coordinator_full_name" 
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter coordinator full name"
                    :class="{ 'border-red-500': errors.coordinator_full_name }" 
                  />
                  <p v-if="errors.coordinator_full_name" class="mt-1 text-sm text-red-600">{{ errors.coordinator_full_name }}</p>
                </div>

                <div>
                  <label for="mobile_number" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Mobile Number <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="mobile_number" 
                    v-model="form.mobile_number" 
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter mobile number"
                    :class="{ 'border-red-500': errors.mobile_number }" 
                  />
                  <p v-if="errors.mobile_number" class="mt-1 text-sm text-red-600">{{ errors.mobile_number }}</p>
                </div>

                <div>
                  <label for="emirates_id" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Emirates ID
                  </label>
                  <input 
                    id="emirates_id" 
                    v-model="form.emirates_id" 
                    type="text"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter Emirates ID (optional)"
                    :class="{ 'border-red-500': errors.emirates_id }" 
                  />
                  <p v-if="errors.emirates_id" class="mt-1 text-sm text-red-600">{{ errors.emirates_id }}</p>
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Additional Details</h4>
              <div>
                <label for="address" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Address
                </label>
                <textarea 
                  id="address" 
                  v-model="form.address" 
                  rows="3"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter address (optional)"
                  :class="{ 'border-red-500': errors.address }" 
                ></textarea>
                <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-charcoal-200">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-charcoal-700 bg-charcoal-100 border border-charcoal-300 rounded-lg hover:bg-charcoal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
                <span v-else>Create Recipient</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useNotifications } from '@composables/useNotifications'
import { XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CreateRecipientModal',
  components: {
    XMarkIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const { showNotification } = useNotifications()

    // Form state
    const form = reactive({
      owner_full_name: '',
      coordinator_full_name: '',
      mobile_number: '',
      emirates_id: '',
      address: '',
      person_photo: ''
    })

    const errors = reactive({})
    const submitting = ref(false)

    // Watch for edit data
    watch(() => props.editData, (newData) => {
      if (newData) {
        Object.assign(form, newData)
      }
    }, { immediate: true })

    // Reset form when modal is closed
    watch(() => props.show, (show) => {
      if (!show) {
        resetForm()
      }
    })

    const resetForm = () => {
      Object.assign(form, {
        owner_full_name: '',
        coordinator_full_name: '',
        mobile_number: '',
        emirates_id: '',
        address: '',
        person_photo: ''
      })
      Object.keys(errors).forEach(key => delete errors[key])
      submitting.value = false
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])

      // Owner name validation
      if (!form.owner_full_name.trim()) {
        errors.owner_full_name = 'Owner full name is required'
      }

      // Coordinator name validation
      if (!form.coordinator_full_name.trim()) {
        errors.coordinator_full_name = 'Coordinator full name is required'
      }

      // Mobile number validation
      if (!form.mobile_number.trim()) {
        errors.mobile_number = 'Mobile number is required'
      } else {
        // Enhanced UAE mobile number validation
        const cleanMobile = form.mobile_number.replace(/[\s\-\+\(\)]/g, '')
        
        // Check patterns for UAE mobile numbers
        const patterns = [
          /^971(50|51|52|54|55|56|58)\d{7}$/, // With country code 971
          /^(50|51|52|54|55|56|58)\d{7}$/,    // Without country code
        ]
        
        const isValid = patterns.some(pattern => pattern.test(cleanMobile))
        if (!isValid) {
          errors.mobile_number = 'Please enter a valid UAE mobile number (e.g., 971501234567 or 501234567)'
        }
      }

      // Emirates ID validation (optional)
      if (form.emirates_id && form.emirates_id.trim()) {
        const cleanEmiratesId = form.emirates_id.replace(/[\s\-]/g, '')
        if (!/^\d{15}$/.test(cleanEmiratesId)) {
          errors.emirates_id = 'Emirates ID must be 15 digits'
        } else if (!cleanEmiratesId.startsWith('784')) {
          errors.emirates_id = 'Emirates ID should start with 784'
        }
      }

      return Object.keys(errors).length === 0
    }

    const createRecipient = async () => {
      if (!validateForm()) {
        return
      }

      submitting.value = true

      try {
        // Normalize mobile number before sending
        let normalizedMobile = form.mobile_number.replace(/[\s\-\+\(\)]/g, '')
        // Add country code if not present
        if (!normalizedMobile.startsWith('971') && normalizedMobile.length === 9) {
          normalizedMobile = '971' + normalizedMobile
        }

        // Call API to create recipient
        const response = await fetch('/api/method/gift.api_v2.create_or_get_recipient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': window.csrf_token || ''
          },
          body: JSON.stringify({
            owner_full_name: form.owner_full_name.trim(),
            coordinator_full_name: form.coordinator_full_name.trim(),
            mobile_number: normalizedMobile,
            emirates_id: form.emirates_id.trim() || null,
            address: form.address.trim() || null,
            person_photo: form.person_photo || null
          })
        })

        const data = await response.json()

        if (data.message && data.message.success) {
          showNotification('Recipient created successfully', 'success')
          // Emit the created recipient data
          emit('created', data.message.data)
          closeModal()
        } else if (data.exc && data.exc.includes('already registered')) {
          // Handle duplicate mobile number error
          errors.mobile_number = 'This mobile number is already registered with different names. Please use a different number or select the existing recipient.'
        } else {
          throw new Error(data.exc || data.message || 'Failed to create recipient')
        }
      } catch (err) {
        console.error('Error creating recipient:', err)
        if (err.message.includes('already registered')) {
          errors.mobile_number = 'This mobile number is already registered'
        } else {
          showNotification(`Failed to create recipient: ${err.message}`, 'error')
        }
      } finally {
        submitting.value = false
      }
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      form,
      errors,
      submitting,
      createRecipient,
      closeModal,
      validateForm
    }
  }
}
</script>

<style scoped>
/* Mobile optimizations */
@media (max-width: 640px) {
  .sm\:max-w-2xl {
    max-width: calc(100vw - 2rem);
  }
}
</style>