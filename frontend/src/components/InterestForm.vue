<template>
	<!-- Interest Form Modal -->
	<div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
			<!-- Background overlay -->
			<div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
				<div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
			</div>

			<!-- Modal panel -->
			<div
				class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
				<div class="bg-white px-4 sm:px-6 pt-6 pb-4">
					<!-- Form Header -->
					<div class="flex justify-between items-center mb-6">
						<div>
							<h3 class="text-xl font-semibold text-charcoal-900">Express Interest</h3>
							<p class="text-sm text-charcoal-600 mt-1">
								Add your interest for this gift. We'll keep your details for future reference.
							</p>
						</div>
						<button @click="closeModal" class="text-charcoal-400 hover:text-charcoal-600 transition-colors">
							<XMarkIcon class="w-6 h-6" />
						</button>
					</div>

					<!-- Interest Form -->
					<form @submit.prevent="submitInterest" class="space-y-6">

						<!-- Recipient Selection Mode -->
						<div class="mb-6">
							<label class="block text-sm font-medium text-charcoal-700 mb-3">
								Choose how to add recipient information:
							</label>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<button
									type="button"
									@click="recipientMode = 'existing'"
									:class="[
										'flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[60px] touch-manipulation relative overflow-hidden',
										recipientMode === 'existing' 
											? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
											: 'border-charcoal-200 hover:border-blue-300 hover:bg-blue-25 text-charcoal-700'
									]"
								>
									<div class="flex items-center">
										<div class="mr-3 flex-shrink-0">
											<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
											</svg>
										</div>
										<div class="text-left">
											<div class="font-semibold text-sm">Select Existing</div>
											<div class="text-xs mt-1 opacity-75">Choose from saved recipients</div>
										</div>
									</div>
									<!-- Selected indicator -->
									<div v-if="recipientMode === 'existing'" class="absolute top-2 right-2">
										<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
										</svg>
									</div>
								</button>
								
								<button
									type="button"
									@click="selectCreateNewMode"
									:class="[
										'flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[60px] touch-manipulation relative overflow-hidden',
										recipientMode === 'new' 
											? 'border-green-500 bg-green-50 text-green-900 shadow-md' 
											: 'border-charcoal-200 hover:border-green-300 hover:bg-green-25 text-charcoal-700'
									]"
								>
									<div class="flex items-center">
										<div class="mr-3 flex-shrink-0">
											<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
											</svg>
										</div>
										<div class="text-left">
											<div class="font-semibold text-sm">Create New</div>
											<div class="text-xs mt-1 opacity-75">Add new recipient details</div>
										</div>
									</div>
									<!-- Selected indicator -->
									<div v-if="recipientMode === 'new'" class="absolute top-2 right-2">
										<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
										</svg>
									</div>
								</button>
							</div>
						</div>

						<!-- Existing Recipient Selection -->
						<div v-if="recipientMode === 'existing'" class="mb-6">
							<label class="block text-sm font-medium text-charcoal-700 mb-2">
								Search and Select Recipient <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<input
									v-model="recipientSearch"
									@input="searchRecipients"
									@focus="showRecipientDropdown = true"
									type="text"
									placeholder="Search by name, mobile number, or Emirates ID..."
									class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
									:class="{ 'border-red-500': errors.selectedRecipient }"
								/>
								
								<!-- Clear Selected Recipient -->
								<button
									v-if="selectedRecipient"
									type="button"
									@click="clearSelectedRecipient"
									class="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
								>
									<XMarkIcon class="w-4 h-4" />
								</button>
								
								<!-- Recipient Dropdown -->
								<div v-if="showRecipientDropdown && searchResults.length > 0 && !selectedRecipient" 
										class="absolute z-20 w-full mt-1 bg-white border border-charcoal-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
									<div
										v-for="recipient in searchResults"
										:key="recipient.name"
										@click="selectRecipient(recipient)"
										class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
									>
										<div class="font-medium text-charcoal-900 text-sm">{{ recipient.owner_full_name }}</div>
										<div class="text-xs text-charcoal-600">Coordinator: {{ recipient.coordinator_full_name }}</div>
										<div class="text-xs text-charcoal-500">{{ recipient.coordinator_mobile_no }}</div>
									</div>
								</div>
							</div>
							
							<!-- Selected Recipient Info -->
							<div v-if="selectedRecipient" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
								<div class="flex items-center justify-between">
									<div>
										<div class="font-medium text-green-900 text-sm">{{ selectedRecipient.owner_full_name }}</div>
										<div class="text-xs text-green-700">Coordinator: {{ selectedRecipient.coordinator_full_name }}</div>
										<div class="text-xs text-green-600">{{ selectedRecipient.coordinator_mobile_no }}</div>
									</div>
									<button
										type="button"
										@click="clearSelectedRecipient"
										class="text-green-600 hover:text-green-800"
									>
										<XMarkIcon class="w-4 h-4" />
									</button>
								</div>
							</div>
							
							<p v-if="errors.selectedRecipient" class="mt-1 text-sm text-red-600">{{ errors.selectedRecipient }}</p>
						</div>

						<!-- Create New Recipient Section -->
						<div v-if="recipientMode === 'new'" class="mb-6">
							<!-- Show recipient info if created, otherwise show instruction -->
							<div v-if="newlyCreatedRecipient" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div class="flex items-center justify-between">
									<div>
										<div class="font-medium text-blue-900 text-sm">{{ newlyCreatedRecipient.owner_full_name }}</div>
										<div class="text-xs text-blue-700">Coordinator: {{ newlyCreatedRecipient.coordinator_full_name }}</div>
										<div class="text-xs text-blue-600">{{ newlyCreatedRecipient.coordinator_mobile_no }}</div>
									</div>
									<div class="flex space-x-2">
										<button
											type="button"
											@click="editNewRecipient"
											class="text-blue-600 hover:text-blue-800 text-xs font-medium"
										>
											Edit
										</button>
										<button
											type="button"
											@click="clearNewRecipient"
											class="text-red-600 hover:text-red-800 text-xs font-medium"
										>
											Clear
										</button>
									</div>
								</div>
							</div>
							
							<div v-else class="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
								<p class="text-sm text-gray-600 mb-2">
									No recipient created yet. The create recipient form will open automatically.
								</p>
								<button
									type="button"
									@click="showCreateRecipientModal = true"
									class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
								>
									Open Create Recipient Form
								</button>
							</div>
							
							<p v-if="errors.newRecipient" class="mt-1 text-sm text-red-600">{{ errors.newRecipient }}</p>
						</div>

						<!-- Form Actions -->
						<div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-charcoal-200">
							<button
								type="button"
								@click="closeModal"
								class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-charcoal-700 bg-charcoal-100 border border-charcoal-300 rounded-lg hover:bg-charcoal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-500 transition-colors min-h-[44px] touch-manipulation"
							>
								Cancel
							</button>
							<button
								type="submit"
								:disabled="submitting"
								class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
							>
								<span v-if="submitting" class="flex items-center justify-center">
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Submitting...
								</span>
								<span v-else>Express Interest</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

	<!-- Create Recipient Modal -->
	<CreateRecipientModal
		:show="showCreateRecipientModal"
		:edit-data="newlyCreatedRecipient"
		@close="showCreateRecipientModal = false"
		@created="handleRecipientCreated"
	/>
</template>
<script>
import { ref, reactive, computed, watch } from 'vue'
import { GiftInterestAPI } from '@services/api'
import { useNotifications } from '@composables/useNotifications'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import CreateRecipientModal from './CreateRecipientModal.vue'

export default {
	name: 'InterestForm',
	components: {
		XMarkIcon,
		CreateRecipientModal
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

		// Recipient selection state
		const recipientMode = ref('existing') // 'existing' or 'new'
		const selectedRecipient = ref(null)
		const newlyCreatedRecipient = ref(null)
		const showCreateRecipientModal = ref(false)
		
		// Recipient search state
		const recipientSearch = ref('')
		const searchResults = ref([])
		const showRecipientDropdown = ref(false)

		// Form state
		const errors = reactive({})
		const submitting = ref(false)

		// Recipient search functionality
		const searchRecipients = async () => {
			if (recipientSearch.value.length < 2) {
				searchResults.value = []
				showRecipientDropdown.value = false
				return
			}

			try {
				const response = await fetch('/api/method/gift.api_v2.search_recipients', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Frappe-CSRF-Token': window.csrf_token || '',
					},
					body: JSON.stringify({
						search_term: recipientSearch.value
					})
				})

				const data = await response.json()
				if (data.message && data.message.success) {
					searchResults.value = data.message.data || []
					showRecipientDropdown.value = searchResults.value.length > 0
				} else {
					searchResults.value = []
					showRecipientDropdown.value = false
				}
			} catch (error) {
				console.error('Error searching recipients:', error)
				searchResults.value = []
				showRecipientDropdown.value = false
			}
		}

		const selectRecipient = (recipient) => {
			selectedRecipient.value = recipient
			recipientSearch.value = `${recipient.owner_full_name} - ${recipient.coordinator_full_name}`
			showRecipientDropdown.value = false
			
			// Clear any existing recipient error
			delete errors.selectedRecipient
		}

		const clearSelectedRecipient = () => {
			selectedRecipient.value = null
			recipientSearch.value = ''
			showRecipientDropdown.value = false
		}

		// Handle Create New mode selection
		const selectCreateNewMode = () => {
			recipientMode.value = 'new'
			// Clear any existing recipient selections
			clearSelectedRecipient()
			clearNewRecipient()
			// Automatically open the create recipient modal
			showCreateRecipientModal.value = true
		}

		// Create Recipient Modal handlers
		const handleRecipientCreated = (recipient) => {
			newlyCreatedRecipient.value = recipient
			showCreateRecipientModal.value = false
			
			// Clear any existing new recipient error
			delete errors.newRecipient
		}

		const editNewRecipient = () => {
			showCreateRecipientModal.value = true
		}

		const clearNewRecipient = () => {
			newlyCreatedRecipient.value = null
			
			// Clear any existing errors
			delete errors.newRecipient
		}

		// Watch for clicks outside dropdown to close it
		const handleClickOutside = (event) => {
			if (!event.target.closest('.relative')) {
				showRecipientDropdown.value = false
			}
		}

		// Form validation - simplified since we only check recipient selection
		const validateForm = () => {
			// Clear previous errors
			Object.keys(errors).forEach(key => delete errors[key])

			let isValid = true

			// Check recipient selection
			if (recipientMode.value === 'existing' && !selectedRecipient.value) {
				errors.selectedRecipient = 'Please select an existing recipient'
				isValid = false
			}

			if (recipientMode.value === 'new' && !newlyCreatedRecipient.value) {
				errors.newRecipient = 'Please create a new recipient first'
				isValid = false
			}

			return isValid
		}

		// Form submission
		const submitInterest = async () => {
			if (!validateForm()) {
				showNotification('Please fix the errors in the form', 'error')
				return
			}

			try {
				submitting.value = true

				let interestData = {
					gift: props.giftId
				}

				// Use selected recipient data or newly created recipient data
				if (recipientMode.value === 'existing' && selectedRecipient.value) {
					interestData.gift_recipient = selectedRecipient.value.name
				} else if (recipientMode.value === 'new' && newlyCreatedRecipient.value) {
					interestData.gift_recipient = newlyCreatedRecipient.value.name
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
			Object.keys(errors).forEach(key => delete errors[key])
			selectedRecipient.value = null
			newlyCreatedRecipient.value = null
			recipientSearch.value = ''
			recipientMode.value = 'existing'
		}

		// Close modal
		const closeModal = () => {
			resetForm()
			emit('close')
		}

		// Watch for show prop changes to reset form
		watch(() => props.show, (newVal) => {
			if (newVal) {
				resetForm()
			}
		})

		return {
			// Recipient selection
			recipientMode,
			selectedRecipient,
			newlyCreatedRecipient,
			showCreateRecipientModal,
			recipientSearch,
			searchResults,
			showRecipientDropdown,
			searchRecipients,
			selectRecipient,
			clearSelectedRecipient,
			selectCreateNewMode,
			handleRecipientCreated,
			editNewRecipient,
			clearNewRecipient,
			// Form state
			errors,
			submitting,
			submitInterest,
			resetForm,
			closeModal
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
</style>
