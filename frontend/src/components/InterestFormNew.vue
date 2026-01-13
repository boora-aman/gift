<template>
  <!-- Interest Form Modal -->
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 transition-opacity" 
        aria-hidden="true"
        @click="closeModal"
      >
        <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-6 pt-6 pb-4">
          <!-- Form Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-semibold text-charcoal-900">Express Interest</h3>
              <p class="text-sm text-charcoal-600 mt-1">
                Add your interest for this gift. We'll keep your details for future reference.
              </p>
            </div>
            <button
              @click="closeModal"
              class="text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Interest Form -->
          <form @submit.prevent="submitInterest" class="space-y-6">
            
            <!-- Owner Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Owner Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="owner_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="owner_full_name"
                    v-model="form.owner_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                    :class="{ 'border-red-500': errors.owner_full_name }"
                  />
                  <p v-if="errors.owner_full_name" class="mt-1 text-sm text-red-600">{{ errors.owner_full_name }}</p>
                </div>
                
                <div>
                  <label for="owner_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Last Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="owner_full_name"
                    v-model="form.owner_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                    :class="{ 'border-red-500': errors.owner_full_name }"
                  />
                  <p v-if="errors.owner_full_name" class="mt-1 text-sm text-red-600">{{ errors.owner_full_name }}</p>
                </div>
              </div>
            </div>

            <!-- Coordinator Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Coordinator Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="coordinator_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="coordinator_full_name"
                    v-model="form.coordinator_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter coordinator first name"
                    :class="{ 'border-red-500': errors.coordinator_full_name }"
                  />
                  <p v-if="errors.coordinator_full_name" class="mt-1 text-sm text-red-600">{{ errors.coordinator_full_name }}</p>
                </div>
                
                <div>
                  <label for="coordinator_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Last Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="coordinator_full_name"
                    v-model="form.coordinator_full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter coordinator last name"
                    :class="{ 'border-red-500': errors.coordinator_full_name }"
                  />
                  <p v-if="errors.coordinator_full_name" class="mt-1 text-sm text-red-600">{{ errors.coordinator_full_name }}</p>
                </div>
              </div>
            </div>

            <!-- Contact Details -->
            <div class="bg-charcoal-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-charcoal-900 mb-4">Contact Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="mobile_number" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Mobile Number <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-charcoal-500 text-sm">🇦🇪</span>
                    </div>
                    <input
                      id="mobile_number"
                      v-model="form.mobile_number"
                      type="tel"
                      required
                      class="w-full pl-10 pr-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50 123 4567 or +971 50 123 4567"
                      :class="{ 'border-red-500': errors.mobile_number }"
                      @input="validateMobileNumber"
                    />
                  </div>
                  <p v-if="errors.mobile_number" class="mt-1 text-sm text-red-600">{{ errors.mobile_number }}</p>
                  <p class="mt-1 text-xs text-charcoal-500">
                    UAE mobile number with or without country code (+971)
                  </p>
                </div>
                
                <div>
                  <label for="emirates_id" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Emirates ID
                  </label>
                  <input
                    id="emirates_id"
                    v-model="form.emirates_id"
                    type="text"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="784-1234-1234567-1"
                    :class="{ 'border-red-500': errors.emirates_id }"
                    @input="validateEmiratesId"
                    maxlength="18"
                  />
                  <p v-if="errors.emirates_id" class="mt-1 text-sm text-red-600">{{ errors.emirates_id }}</p>
                  <p class="mt-1 text-xs text-charcoal-500">
                    15-digit Emirates ID (with or without dashes)
                  </p>
                </div>
              </div>
              
              <div class="mt-4">
                <label for="address" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  v-model="form.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter address (optional)"
                  :class="{ 'border-red-500': errors.address }"
                ></textarea>
                <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
              </div>
            </div>
          </form>
        </div>
        
        <!-- Form Actions -->
        <div class="bg-charcoal-50 px-6 py-4 sm:flex sm:flex-row-reverse">
          <button
            @click="submitInterest"
            :disabled="submitting || !isFormValid"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="flex items-center justify-center">
              <ArrowPathIcon class="w-4 h-4 mr-2 animate-spin" />
              Saving Interest...
            </span>
            <span v-else class="flex items-center">
              <StarIcon class="w-4 h-4 mr-2" />
              Save Interest
            </span>
          </button>
          <button
            @click="resetForm"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-charcoal-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-charcoal-700 hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
            :disabled="submitting"
          >
            Reset
          </button>
          <button
            @click="closeModal"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-charcoal-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-charcoal-700 hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
            :disabled="submitting"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { GiftInterestAPI } from '@/services/api'
import { useNotifications } from '@composables/useNotifications'
import { ArrowPathIcon, XMarkIcon, StarIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'InterestForm',
  components: {
    ArrowPathIcon,
    XMarkIcon,
    StarIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    giftId: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const { showNotification } = useNotifications()

    // Form state
    const form = reactive({
      owner_full_name: '',
      owner_full_name: '',
      coordinator_full_name: '',
      coordinator_full_name: '',
      mobile_number: '',
      emirates_id: '',
      address: ''
    })

    const errors = reactive({})
    const submitting = ref(false)

    // UAE-specific validation functions
    const validateMobileNumber = () => {
      const mobile = form.mobile_number.trim()
      if (!mobile) {
        errors.mobile_number = 'Mobile number is required'
        return false
      }

      // Remove all non-digit characters
      const cleanedMobile = mobile.replace(/[\s\-\+\(\)]/g, '')
      
      // UAE mobile number patterns
      // With country code: +971501234567 or 971501234567
      // Without country code: 501234567
      const patterns = [
        /^971(50|51|52|54|55|56|58)\d{7}$/, // With country code 971
        /^(50|51|52|54|55|56|58)\d{7}$/,    // Without country code
      ]

      const isValid = patterns.some(pattern => pattern.test(cleanedMobile))
      
      if (!isValid) {
        errors.mobile_number = 'Please enter a valid UAE mobile number'
        return false
      }

      delete errors.mobile_number
      return true
    }

    const validateEmiratesId = () => {
      const emiratesId = form.emirates_id.trim()
      if (!emiratesId) {
        errors.emirates_id = 'Emirates ID is required'
        return false
      }

      // Remove dashes and spaces
      const cleanedId = emiratesId.replace(/[\s\-]/g, '')
      
      // Emirates ID should be exactly 15 digits
      if (!/^\d{15}$/.test(cleanedId)) {
        errors.emirates_id = 'Emirates ID must be exactly 15 digits'
        return false
      }

      // Basic pattern validation (784 is common prefix for UAE)
      if (!cleanedId.startsWith('784')) {
        errors.emirates_id = 'Emirates ID should start with 784'
        return false
      }

      delete errors.emirates_id
      return true
    }

    // Form validation
    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach(key => delete errors[key])
      
      let isValid = true

      // Required fields validation
      if (!form.owner_full_name.trim()) {
        errors.owner_full_name = 'Owner first name is required'
        isValid = false
      }

      if (!form.owner_full_name.trim()) {
        errors.owner_full_name = 'Owner last name is required'
        isValid = false
      }

      if (!form.coordinator_full_name.trim()) {
        errors.coordinator_full_name = 'Coordinator first name is required'
        isValid = false
      }

      if (!form.coordinator_full_name.trim()) {
        errors.coordinator_full_name = 'Coordinator last name is required'
        isValid = false
      }

      // Validate mobile number
      if (!validateMobileNumber()) {
        isValid = false
      }

      // Validate Emirates ID
      if (!validateEmiratesId()) {
        isValid = false
      }

      return isValid
    }

    // Computed property for form validity
    const isFormValid = computed(() => {
      return form.owner_full_name.trim() &&
             form.owner_full_name.trim() &&
             form.coordinator_full_name.trim() &&
             form.coordinator_full_name.trim() &&
             form.mobile_number.trim() &&
             form.emirates_id.trim() &&
             Object.keys(errors).length === 0
    })

    // Form submission
    const submitInterest = async () => {
      if (!validateForm()) {
        showNotification('Please fix the errors in the form', 'error')
        return
      }

      try {
        submitting.value = true

        // Normalize mobile number and Emirates ID
        const normalizedMobile = form.mobile_number.replace(/[\s\-\+\(\)]/g, '')
        const normalizedEmiratesId = form.emirates_id.replace(/[\s\-]/g, '')

        const interestData = {
          gift: props.giftId,
          owner_full_name: form.owner_full_name.trim(),
          owner_full_name: form.owner_full_name.trim(),
          coordinator_full_name: form.coordinator_full_name.trim(),
          coordinator_full_name: form.coordinator_full_name.trim(),
          mobile_number: normalizedMobile.startsWith('971') ? normalizedMobile : `971${normalizedMobile}`,
          emirates_id: normalizedEmiratesId,
          address: form.address.trim() || null
        }

        const response = await GiftInterestAPI.create(interestData)

        if (response.success) {
          showNotification('Interest recorded successfully', 'success')
          emit('success', response.data)
          closeModal()
        } else {
          showNotification(response.error || 'Failed to record interest', 'error')
        }

      } catch (error) {
        console.error('Failed to submit interest:', error)
        showNotification('Failed to record interest. Please try again.', 'error')
      } finally {
        submitting.value = false
      }
    }

    // Reset form
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      Object.keys(errors).forEach(key => delete errors[key])
    }

    // Close modal
    const closeModal = () => {
      emit('close')
    }

    return {
      form,
      errors,
      submitting,
      isFormValid,
      submitInterest,
      resetForm,
      closeModal,
      validateMobileNumber,
      validateEmiratesId
    }
  }
}
</script>

<style scoped>
/* Form styles */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
input:focus,
textarea:focus {
  outline: none;
}

/* Error state styles */
.border-red-500 {
  border-color: #ef4444;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Modal overlay styles */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Enhanced UX styles */
.shadow-xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Form validation feedback */
.border-green-500 {
  border-color: #10b981;
}

/* Disabled state */
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
