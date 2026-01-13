<template>
	<div class="min-h-full bg-desert-sand-50">
		<!-- Loading State -->
		<div v-if="loading && !gift.name" class="flex items-center justify-center min-h-screen">
			<div class="animate-pulse text-center">
				<div class="w-.peer:checked~.peer-checked\:bg-gray-600 {
	background-color: #4B5563;
}h-16 bg-gray-100 rounded-xl mx-auto mb-4"></div>
				<div class="h-4 bg-charcoal-200 rounded w-32 mx-auto mb-2"></div>
				<div class="h-3 bg-charcoal-200 rounded w-24 mx-auto"></div>
			</div>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-charcoal-900 mb-2">Gift Not Found</h3>
				<p class="text-charcoal-600 mb-4">{{ error }}</p>
				<button @click="$router.push('/gifts')"
					class="inline-flex items-center px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors">
					<ArrowLeftIcon class="w-4 h-4 mr-2" />
					Back to Gifts
				</button>
			</div>
		</div>

		<!-- Edit Form -->
		<div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 safe-area-padding">
			<!-- Back Button -->
			<div class="mb-6">
				<button @click="$router.go(-1)"
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors">
					<ArrowLeftIcon class="w-4 h-4 mr-2" />
					Back
				</button>
			</div>

			<GiftForm ref="giftFormRef" :initial-data="gift" :is-edit-mode="true" :gift-status="gift.status"
				@submit="updateGift" />
		</div>
	</div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'
import { useAuthStore } from '@stores/auth'
import { GiftAPI } from '@services/api'
import GiftForm from '@/components/GiftForm.vue'

// Icons
import {
	ArrowLeftIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
	name: 'GiftEdit',
	components: {
		ArrowLeftIcon,
		ArrowPathIcon,
		ExclamationTriangleIcon,
		GiftForm
	},
	setup() {
		const router = useRouter()
		const route = useRoute()
		const authStore = useAuthStore()
		const { showNotification } = useNotifications()

		// State
		const loading = ref(false)
		const error = ref(null)
		const giftFormRef = ref(null)

		const gift = reactive({})

		// Check permission on component mount (defense in depth)
		const checkPermissions = async () => {
			// Ensure user role is loaded
			if (!authStore.userRole) {
				await authStore.loadUserRole()
			}

			// Double-check permissions (should be caught by router guard, but extra safety)
			// Allow access if no role assigned, otherwise check specific roles
			if (authStore.userRole && !authStore.isAdmin && !authStore.isEventManager) {
				showNotification({
					type: 'error',
					title: 'Access Denied', 
					message: 'You do not have permission to edit gifts'
				})
				router.push('/gifts')
				return false
			}
			return true
		}

		// Methods
		const loadGift = async () => {
			try {
				loading.value = true
				error.value = null
				const giftId = route.params.id

				const response = await GiftAPI.get(giftId)

				if (response.success) {
					Object.assign(gift, response.data)
				} else {
					error.value = response.error || 'Failed to load gift details'
				}

			} catch (err) {
				console.error('Failed to load gift:', err)
				error.value = 'Failed to load gift details. Please try again.'
			} finally {
				loading.value = false
			}
		}

		const updateGift = async (formData) => {
			try {
				loading.value = true

				const response = await GiftAPI.update(gift.name, {
					...formData,
					gender: formData.gender,
					docstatus: gift.docstatus
				})

				if (response.success) {
					showNotification('Gift updated successfully', 'success')
					router.push(`/gifts/${gift.name}`)
				} else {
					showNotification(response.error || 'Failed to update gift', 'error')
				}

			} catch (error) {
				console.error('Failed to update gift:', error)
				showNotification('Failed to update gift. Please try again.', 'error')
			} finally {
				loading.value = false
				if (giftFormRef.value) {
					giftFormRef.value.resetSaving()
				}
			}
		}

		const updateStatus = async (newStatus) => {
			try {
				loading.value = true

				// TODO: Replace with actual API call
				// await giftApi.updateGiftStatus(gift.name, newStatus)

				// Mock success
				await new Promise(resolve => setTimeout(resolve, 1000))

				gift.status = newStatus
				showNotification(`Gift ${newStatus === 'expired' ? 'marked as expired' : 'cancelled'}`, 'success')

			} catch (error) {
				console.error('Failed to update status:', error)
				showNotification('Failed to update gift status', 'error')
			} finally {
				loading.value = false
			}
		}

		// Utility functions
		const getStatusClasses = (status) => {
			const classes = {
				available: 'bg-gray-100 text-gray-800',
				issued: 'bg-blue-100 text-blue-800',
				expired: 'bg-red-100 text-red-800',
				cancelled: 'bg-charcoal-100 text-charcoal-800',
				redeemed: 'bg-purple-100 text-purple-800'
			}
			return classes[status] || classes.available
		}

		const getStatusText = (status) => {
			const texts = {
				available: 'Available',
				issued: 'Issued',
				expired: 'Expired',
				cancelled: 'Cancelled',
				redeemed: 'Redeemed'
			}
			return texts[status] || 'Available'
		}

		// Lifecycle
		onMounted(async () => {
			// Check permissions first
			const hasPermission = await checkPermissions()
			if (!hasPermission) return

			// Load gift data if permissions are OK
			loadGift()
		})

		return {
			loading,
			error,
			gift,
			giftFormRef,
			updateGift,
			updateStatus,
			getStatusClasses,
			getStatusText
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
@keyframes pulse {

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.animate-pulse {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
	animation: spin 1s linear infinite;
}

/* Toggle switch styling */
.peer:checked~.peer-checked\:bg-gray-600 {
	background-color: #10b981;
}

.peer:focus~.peer-focus\:ring-emerald-300 {
	box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
}

/* Transitions */
.transition-colors {
	transition-property: color, background-color, border-color;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 200ms;
}

/* Disabled state */
input:disabled,
select:disabled,
textarea:disabled {
	background-color: #f9fafb;
	cursor: not-allowed;
}

button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {

	.animate-pulse,
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

	input,
	select,
	textarea {
		border-width: 2px;
	}
}
</style>
