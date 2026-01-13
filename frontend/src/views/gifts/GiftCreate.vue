<template>
	<div class="min-h-full bg-desert-sand-50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 safe-area-padding">
			<!-- Back Button -->
			<div class="mb-6">
				<button @click="$router.push('/gifts')"
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-charcoal-600 bg-white border border-charcoal-300 rounded-lg hover:bg-charcoal-50 transition-colors">
					<ArrowLeftIcon class="w-4 h-4 mr-2" />
					Back to Gift Inventory
				</button>
			</div>

			<GiftForm ref="giftFormRef" :is-edit-mode="false" @submit="createGift" />
		</div>
	</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@composables/useNotifications'
import { GiftAPI } from '@services/api'
import GiftForm from '@/components/GiftForm.vue'

// Icons
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

export default {
	name: 'GiftCreate',
	components: {
		ArrowLeftIcon,
		GiftForm
	},
	setup() {
		const router = useRouter()
		const authStore = useAuthStore()
		const { showNotification } = useNotifications()

		// State
		const loading = ref(false)
		const giftFormRef = ref(null)

		// Check permission on component mount (defense in depth)
		onMounted(async () => {
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
					message: 'You do not have permission to create gifts'
				})
				router.push('/gifts')
				return
			}
		})

		// Methods
		const createGift = async (formData) => {
			try {
				loading.value = true

				const giftData = {
					gift_name: formData.gift_name,
					gift_id: formData.gift_id,
					gender: formData.gender,
					breed: formData.breed,
					category: formData.category,
					description: formData.description,
					status: formData.status,
					farm_name: formData.farm_name,
					weight: formData.weight,
					import_barcode: formData.import_barcode,
					barcode_value: formData.import_barcode ? formData.barcode_value : null,
					gift_additional_attributes: formData.gift_additional_attributes?.filter(attr =>
						attr.attribute_name && attr.attribute_value
					) || [],
					gift_images: formData.gift_images || []
				}

				const response = await GiftAPI.create(giftData)

				if (response.success) {
					showNotification('Gift created successfully', 'success')
					// Redirect to the detail view of the created gift
					router.push(`/gifts/${response.data.name}`)
				} else {
					showNotification(response.error || 'Failed to create gift', 'error')
				}

			} catch (error) {
				console.error('Failed to create gift:', error)
				showNotification('Failed to create gift. Please try again.', 'error')
			} finally {
				loading.value = false
				if (giftFormRef.value) {
					giftFormRef.value.resetSaving()
				}
			}
		}

		return {
			loading,
			giftFormRef,
			createGift
		}
	}
}
</script>

<style scoped>
/* Transitions */
.transition-colors {
	transition-property: color, background-color, border-color;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 200ms;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
	.transition-colors {
		transition: none !important;
	}
}

/* High contrast mode */
@media (prefers-contrast: high) {
	.shadow-card {
		border: 1px solid #374151;
	}
}
</style>
