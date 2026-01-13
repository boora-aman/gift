<template>
	<form @submit.prevent="handleSubmit" class="space-y-8 pb-24 lg:pb-0">
		<!-- Status Warning for Non-Available Gifts -->
		<div v-if="isEditMode && !isFieldEditable" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
			<div class="flex items-start">
				<ExclamationTriangleIcon class="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
				<div>
					<h3 class="text-sm font-medium text-amber-800">Gift Cannot Be Modified</h3>
					<p class="text-sm text-amber-700 mt-1">
						This gift cannot be edited because its status is "{{ getStatusText(form.status) }}".
						Only gifts with "Available" status can be modified.
					</p>
				</div>
			</div>
		</div>

		<!-- Basic Information -->
		<div class="bg-white rounded-xl shadow-card p-6">
			<h2 class="text-xl font-semibold text-charcoal-900 mb-6">Basic Information</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Status Field (Readonly) -->
				<div v-if="isEditMode">
					<label for="status" class="block text-sm font-medium text-charcoal-700 mb-2">
						Status
					</label>
					<input id="status" :value="getStatusText(form.status)" type="text" readonly :class="[
						'w-full px-3 py-2 border rounded-lg text-charcoal-900 bg-charcoal-50 cursor-not-allowed',
						getStatusClasses(form.status, true)
					]" />
					<p v-if="!isFieldEditable" class="mt-1 text-xs text-amber-600">
						<ExclamationTriangleIcon class="w-3 h-3 inline mr-1" />
						Information can only be edited when status is "Available"
					</p>
				</div>

				<div>
					<label for="gift_name" class="block text-sm font-medium text-charcoal-700 mb-2">
						Gift Name *
					</label>
					<input id="gift_name" v-model="form.gift_name" type="text" required :disabled="!isFieldEditable"
						class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
						placeholder="Enter gift name" />
					<p v-if="errors.gift_name" class="mt-1 text-sm text-red-600">{{ errors.gift_name }}</p>
				</div>

				<div>
          <label for="gift_id" class="block text-sm font-medium text-charcoal-700 mb-2">
            UAE Ring (رقم الحلقة) *
					</label>
					<input id="gift_id" v-model="form.gift_id" type="text" :disabled="!isFieldEditable"
						class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
						placeholder="Enter UAE Ring" />
					<p v-if="errors.gift_id" class="mt-1 text-sm text-red-600">{{ errors.gift_id }}</p>
				</div>

				<!-- Breed (below Gender) -->
				<div>
          <label for="breed" class="block text-sm font-medium text-charcoal-700 mb-2">
            Breed (الجبر)
          </label>
					<input id="breed" v-model="form.breed" type="text" :disabled="!isFieldEditable"
          class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
          placeholder="Enter breed (optional)" />
					<p v-if="errors.breed" class="mt-1 text-sm text-red-600">{{ errors.breed }}</p>
				</div>

				<div>
          <label for="weight" class="block text-sm font-medium text-charcoal-700 mb-2">
            Weight (الوزن)
					</label>
					<input id="weight" v-model="form.weight" type="number" step="0.01" min="0"
          :disabled="!isFieldEditable"
          class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
          placeholder="Enter weight (optional)" />
					<p v-if="errors.weight" class="mt-1 text-sm text-red-600">{{ errors.weight }}</p>
				</div>

          <!-- Gender (below UAE Ring) -->
				<div>
					<label for="gender" class="block text-sm font-medium text-charcoal-700 mb-2">
				    Gender (الجنس)
					</label>
					<CustomDropdown v-model="form.gender" :options="genderOptions"
						placeholder="Select gender (optional)" :disabled="!isFieldEditable" :show-badge="false"
						label="gender" />
				</div>

				<div>
          <label for="category" class="block text-sm font-medium text-charcoal-700 mb-2">
            Category  (النوع)
					</label>
					<CustomDropdown v-model="form.category" :options="categoryOptions"
          placeholder="Select category (optional)" :disabled="categoriesLoading || !isFieldEditable"
          :loading="categoriesLoading" :show-badge="false" label="categories" />
					<p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
				</div>

        <div>
          <label for="farm_name" class="block text-sm font-medium text-charcoal-700 mb-2">
           Farm Name (المزرعة)
          </label>
          <input id="farm_name" v-model="form.farm_name" type="text" :disabled="!isFieldEditable"
            class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
            placeholder="Enter farm name (optional)" />
          <p v-if="errors.farm_name" class="mt-1 text-sm text-red-600">{{ errors.farm_name }}</p>
        </div>

			</div>

			<div class="mt-6">
				<label for="description" class="block text-sm font-medium text-charcoal-700 mb-2">
					Description
				</label>
				<textarea id="description" v-model="form.description" rows="4" :disabled="!isFieldEditable"
					class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
					placeholder="Enter gift description"></textarea>
				<p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
			</div>
		</div>



		<!-- Images -->
		<div class="bg-white rounded-xl shadow-card p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-charcoal-900">Images</h2>
				<button type="button" @click="$refs.fileInput.click()" :disabled="!isFieldEditable"
					class="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:text-charcoal-500 disabled:border-charcoal-200">
					Upload Images
				</button>
			</div>

			<input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileUpload" class="hidden"
				:disabled="!isFieldEditable" />

			<div v-if="form.gift_images.length === 0"
				class="text-center py-8 text-charcoal-500 border-2 border-dashed border-charcoal-200 rounded-lg">
				<div class="mx-auto w-12 h-12 text-charcoal-400 mb-4">
					<PhotoIcon class="w-full h-full" />
				</div>
				<p class="text-sm">No images uploaded yet.</p>
				<p class="text-xs mt-1">Click "Upload Images" to add photos of this gift.</p>
			</div>

			<div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				<div v-for="(image, index) in form.gift_images" :key="index" class="relative group">
					<div class="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
						<img :src="getImageUrl(image.image)" :alt="`Gift image ${index + 1}`"
							class="w-full h-full object-cover" />
					</div>
					<button type="button" @click="removeImage(index)" :disabled="!isFieldEditable"
						class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-400">
						<XMarkIcon class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>

		<!-- Import Barcode Section (only shown in create mode) -->
		<div v-if="!isEditMode" class="bg-white rounded-xl shadow-card p-6">
			<h2 class="text-xl font-semibold text-charcoal-900 mb-6">Barcode Configuration</h2>

			<div class="space-y-4">
				<div class="flex items-center">
					<input id="import_barcode" v-model="form.import_barcode" type="checkbox"
						:disabled="!isFieldEditable"
						class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-charcoal-300 rounded disabled:opacity-50 disabled:cursor-not-allowed" />
					<label for="import_barcode" class="ml-2 block text-sm text-charcoal-900">
						Import Barcode
					</label>
				</div>
				<p class="text-sm text-charcoal-600">
					Check this if you want to specify a custom barcode id. Otherwise, a barcode will be auto-generated.
				</p>

				<div v-if="form.import_barcode" class="space-y-2">
					<label for="barcode_value" class="block text-sm font-medium text-charcoal-700">
						Barcode ID *
					</label>
					<input id="barcode_value" v-model="form.barcode_value" type="text" :required="form.import_barcode"
						:disabled="!isFieldEditable"
						class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-charcoal-50 disabled:cursor-not-allowed"
						placeholder="Enter barcode ID" />
					<p v-if="errors.barcode_value" class="mt-1 text-sm text-red-600">{{ errors.barcode_value }}</p>
				</div>
			</div>
		</div>

		<!-- Form Actions - Sticky at bottom for PWA -->
		<div class="lg:flex lg:justify-end">
			<!-- Desktop version -->
			<div class="hidden lg:block">
				<button type="submit" :disabled="loading || (isEditMode && !isFieldEditable)"
					class="px-8 py-3 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-400">
					<ArrowPathIcon v-if="saving === 'submit'" class="inline w-4 h-4 mr-2 animate-spin" />
					{{ isEditMode ? (saving === 'submit' ? 'Updating Gift...' : 'Update Gift') : (loading ? 'Creating Gift...' : 'Create Gift') }}
				</button>
			</div>

			<!-- Mobile PWA version - Fixed at bottom -->
			<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-200 p-4 z-[9999]"
				style="padding-bottom: max(1rem, env(safe-area-inset-bottom));">
				<button type="submit" :disabled="loading || (isEditMode && !isFieldEditable)"
					class="w-full px-8 py-4 text-base font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-400 shadow-lg">
					<ArrowPathIcon v-if="saving === 'submit'" class="inline w-4 h-4 mr-2 animate-spin" />
					{{ isEditMode ? (saving === 'submit' ? 'Updating Gift...' : 'Update Gift') : (loading ? 'Creating Gift...' : 'Create Gift') }}
				</button>
			</div>
		</div>
	</form>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useNotifications } from '@composables/useNotifications'
import { GiftAPI, FileAPI } from '@services/api'

// Components
import CustomDropdown from './CustomDropdown.vue'

// Icons
import {
	TrashIcon,
	PhotoIcon,
	XMarkIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
	name: 'GiftForm',
	components: {
		TrashIcon,
		PhotoIcon,
		XMarkIcon,
		ArrowPathIcon,
		ExclamationTriangleIcon,
		CustomDropdown
	},
	props: {
		initialData: {
			type: Object,
			default: () => ({})
		},
		isEditMode: {
			type: Boolean,
			default: false
		},
		giftStatus: {
			type: String,
			default: 'Available'
		}
	},
	emits: ['submit'],
	setup(props, { emit }) {
		const { showNotification } = useNotifications()

		// Form data
		const form = reactive({
			gift_name: '',
			gift_id: '',
			gender: '',
			breed: '',
			category: '',
			description: '',
			status: 'Available',
			farm_name: '',
			weight: '',
			import_barcode: false,
			barcode_value: '',
			gift_additional_attributes: [],
			gift_images: []
		})

		// UI state
		const errors = ref({})
		const loading = ref(false)
		const saving = ref('')
		const categories = ref([])
		const categoriesLoading = ref(false)
		const fileInput = ref(null)

		// Computed properties
		const isFieldEditable = computed(() => {
			return !props.isEditMode || props.giftStatus === 'Available'
		})

		const categoryOptions = computed(() => {
			return categories.value.map(category => ({
				value: category.name,
				label: category.category_name
			}))
		})

		// Static options for gender dropdown
		const genderOptions = [
			{ value: 'Male', label: 'Male' },
			{ value: 'Female', label: 'Female' }
		]

		// Methods
		const loadCategories = async () => {
			try {
				categoriesLoading.value = true
				const response = await GiftAPI.getCategories()

				if (response.success) {
					// Transform the API response to match template expectations
					// API returns [{"name": "cat-001", "category_name": "Mobile"}] format
					// We use category_name for both value and display
					const rawCategories = response.data || []
					categories.value = rawCategories.map(category => ({
						name: category.category_name, // Use category_name for value to match gift data
						category_name: category.category_name // Use category_name for display
					}))
				} else {
					console.error('Failed to load categories:', response.error)
					// Fallback to hardcoded categories
					categories.value = [
						{ name: 'Watch', category_name: 'Watch' },
						{ name: 'Mobile', category_name: 'Mobile' },
						{ name: 'Product', category_name: 'Product' },
						{ name: 'Service', category_name: 'Service' },
						{ name: 'Digital', category_name: 'Digital' }
					]
				}
			} catch (error) {
				console.error('Error loading categories:', error)
				// Fallback to hardcoded categories
				categories.value = [
					{ name: 'Watch', category_name: 'Watch' },
					{ name: 'Mobile', category_name: 'Mobile' },
					{ name: 'Product', category_name: 'Product' },
					{ name: 'Service', category_name: 'Service' },
					{ name: 'Digital', category_name: 'Digital' }
				]
			} finally {
				categoriesLoading.value = false
			}
		}

		const addAttribute = () => {
			form.gift_additional_attributes.push({
				attribute_name: '',
				attribute_value: ''
			})
		}

		const removeAttribute = (index) => {
			form.gift_additional_attributes.splice(index, 1)
		}

		const handleFileUpload = async (event) => {
			const files = Array.from(event.target.files)

			for (const file of files) {
				try {
					const response = await FileAPI.upload(file)
					if (response.success) {
						form.gift_images.push({
							image: response.data.file_url
						})
					} else {
						showNotification(`Failed to upload ${file.name}`, 'error')
					}
				} catch (error) {
					console.error('File upload error:', error)
					showNotification(`Failed to upload ${file.name}`, 'error')
				}
			}

			// Clear the input
			event.target.value = ''
		}

		const removeImage = (index) => {
			form.gift_images.splice(index, 1)
		}

		const getImageUrl = (imagePath) => {
			if (!imagePath) return ''

			// If it's already a full URL, return as is
			if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
				return imagePath
			}

			// Get base URL from API configuration or fallback to window origin
			const getBaseUrl = () => {
				// In production, this should be the actual server URL
				// For development, we need to use the proxy target
				if (import.meta.env.DEV) {
					// During development, use the proxy target from vite config
					return 'http://localhost:8008'
				}
				// In production, use the current origin
				return window.location.origin
			}

			const baseUrl = getBaseUrl()

			// If it starts with /files/, assume it's a Frappe file URL and add the base URL
			if (imagePath.startsWith('/files/')) {
				return `${baseUrl}${imagePath}`
			}

			// If it's a relative path, add the base URL
			if (imagePath.startsWith('/')) {
				return `${baseUrl}${imagePath}`
			}

			// If it doesn't start with / or http, assume it needs /files/ prefix
			return `${baseUrl}/files/${imagePath}`
		}

		// Status utility functions
		const getStatusClasses = (status, isInput = false) => {
			const classes = {
				available: isInput ? 'border-emerald-300' : 'bg-gray-100 text-gray-800',
				issued: isInput ? 'border-blue-300' : 'bg-blue-100 text-blue-800',
				expired: isInput ? 'border-red-300' : 'bg-red-100 text-red-800',
				cancelled: isInput ? 'border-charcoal-300' : 'bg-charcoal-100 text-charcoal-800',
				redeemed: isInput ? 'border-purple-300' : 'bg-purple-100 text-purple-800'
			}
			return classes[status?.toLowerCase()] || (isInput ? 'border-emerald-300' : 'bg-gray-100 text-gray-800')
		}

		const getStatusText = (status) => {
			const texts = {
				available: 'Available',
				issued: 'Issued',
				expired: 'Expired',
				cancelled: 'Cancelled',
				redeemed: 'Redeemed'
			}
			return texts[status?.toLowerCase()] || 'Available'
		}

		const validateForm = () => {
			errors.value = {}

			if (!form.gift_name.trim()) {
				errors.value.gift_name = 'Gift name is required'
			}

			if (!form.gift_id.trim()) {
				errors.value.gift_id = 'Gift Code is required'
			}

			// Category is now optional - no validation needed

			// Only validate barcode fields in create mode
			if (!props.isEditMode && form.import_barcode && !form.barcode_value?.trim()) {
				errors.value.barcode_value = 'Barcode ID is required when Import Barcode is checked'
			}

			return Object.keys(errors.value).length === 0
		}

		const handleSubmit = () => {
			if (!validateForm()) return

			saving.value = 'submit'

			// Create a copy of form data
			const formData = { ...form }

			// Remove barcode fields in edit mode since they shouldn't be changed
			if (props.isEditMode) {
				delete formData.import_barcode
				delete formData.barcode_value
			}

			emit('submit', formData)
		}

		const resetSaving = () => {
			saving.value = ''
		}

		// Update form when initialData changes (for edit mode)
		watch(() => props.initialData, (newData) => {
			if (newData && Object.keys(newData).length > 0) {
				form.gift_name = newData.gift_name || ''
				form.gift_id = newData.gift_id || ''
				form.gender = newData.gender || ''
				form.breed = newData.breed || ''
				form.category = newData.category || ''
				form.description = newData.description || ''
				form.status = newData.status || 'Available'
				form.farm_name = newData.farm_name || ''
				form.weight = newData.weight || ''
				form.import_barcode = newData.import_barcode || false
				form.barcode_value = newData.barcode_value || ''
				form.gift_additional_attributes = newData.gift_additional_attributes || []
				form.gift_images = newData.gift_images || []
			}
		}, { deep: true, immediate: true })

		// Lifecycle
		onMounted(() => {
			loadCategories()
		})

		return {
			form,
			errors,
			loading,
			saving,
			categories,
			categoriesLoading,
			categoryOptions,
			genderOptions,
			fileInput,
			isFieldEditable,
			addAttribute,
			removeAttribute,
			handleFileUpload,
			removeImage,
			getImageUrl,
			getStatusClasses,
			getStatusText,
			handleSubmit,
			resetSaving
		}
	}
}
</script>

<style scoped>
/* Custom styles if needed */
.shadow-card {
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Better dropdown styling */
select {
	background-image: none;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
}

/* Ensure dropdown options are visible */
select option {
	background-color: white;
	color: #374151;
	padding: 8px 12px;
}

/* PWA-specific adjustments */
@media (max-width: 1023px) {

	/* Ensure form has proper bottom spacing on mobile for fixed button */
	form {
		margin-bottom: 100px;
	}

	/* Ensure dropdowns work properly in PWA */
	select {
		position: relative;
		z-index: 1;
		min-height: 42px;
		font-size: 16px;
		/* Prevent zoom on iOS */
	}

	/* Style the dropdown container */
	.relative {
		z-index: 10;
	}

	/* Better spacing for mobile forms */
	.space-y-8>*+* {
		margin-top: 1.5rem;
	}
}

/* iOS PWA specific fixes */
@supports (-webkit-touch-callout: none) {
	select {
		font-size: 16px;
		/* Prevent zoom on iOS */
		background-color: white;
		border-radius: 8px;
	}

	/* Ensure options are properly styled on iOS */
	select option {
		background-color: white;
		color: #374151;
	}
}

/* Ensure fixed button doesn't interfere with main content */
@media (max-width: 1023px) {
	.fixed.bottom-0 {
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}
}

/* High contrast mode support */
@media (prefers-contrast: high) {
	select {
		border: 2px solid #374151;
	}

	.fixed.bottom-0 {
		border-top: 2px solid #374151;
	}
}
</style>
