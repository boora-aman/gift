<template>
	<div class="min-h-full bg-desert-sand-50">
		<!-- Mobile Header -->
		<div class="lg:hidden bg-white shadow-card">
			<div class="flex items-center justify-between px-4 py-2">
				<div class="flex items-center space-x-3">
					<!-- Back Button -->
					<button
						@click="$router.go(-1)"
						class="p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
						title="Go back"
					>
						<ArrowLeftIcon class="w-5 h-5" />
					</button>

					<div class="flex items-center space-x-2">
						<GiftIcon class="w-5 h-5 text-gray-700" />
						<div>
							<h1 class="text-lg font-semibold text-charcoal-900">Gift Inventory</h1>
							<p v-if="!loading && gifts.length > 0" class="text-xs text-charcoal-600">
								{{ gifts.length }} gift{{ gifts.length !== 1 ? 's' : '' }}
							</p>
						</div>
					</div>
				</div>

				<div class="flex items-center space-x-1">
					<!-- Search Toggle -->
					<button @click="showSearch = !showSearch"
						class="p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
						:class="{ 'bg-gray-100 text-gray-700': showSearch || searchQuery }">
						<MagnifyingGlassIcon class="w-4 h-4" />
					</button>

					<!-- Filter Toggle -->
					<button @click="showFilters = !showFilters"
						class="relative p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100 transition-colors"
						:class="{ 'bg-gray-100 text-gray-700': showFilters || activeFilterCount > 0 }">
						<FunnelIcon class="w-4 h-4" />
						<span v-if="activeFilterCount > 0"
							class="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-gray-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
							{{ activeFilterCount }}
						</span>
					</button>

					<!-- Add Gift Button -->
					<button v-if="authStore.canCreateGifts" @click="router.push('/gifts/new')"
						class="p-1.5 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors">
						<PlusIcon class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>

		<!-- Desktop Header -->
		<div class="hidden lg:block bg-white shadow-card">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<GiftIcon class="w-6 h-6 text-gray-700" />
						<div>
							<h1 class="text-xl font-bold text-charcoal-900">Gift Inventory</h1>
							<p class="text-sm text-charcoal-600">Manage your gift inventory and track status</p>
						</div>
					</div>

					<button v-if="authStore.canCreateGifts" @click="router.push('/gifts/new')"
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
						<PlusIcon class="w-4 h-4 mr-2" />
						Add New Gift
					</button>
				</div>
			</div>
		</div>

		<!-- Search Bar (Mobile Expandable) -->
		<div v-if="showSearch || !isMobile" class="bg-white border-b border-desert-sand-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
				<div class="relative">
					<MagnifyingGlassIcon
						class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-400" />
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search gifts by name, code, or description..."
						class="w-full pl-9 pr-10 py-2 text-sm border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
						@input="debouncedSearch"
					/>
					<!-- Clear Search Button -->
					<button
						v-if="searchQuery"
						@click="clearSearch"
						class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-600 transition-colors"
						title="Clear search"
					>
						<XMarkIcon class="w-3 h-3" />
					</button>
				</div>

				<!-- Search Results Summary -->
				<div v-if="searchQuery && !loading" class="mt-1.5 text-xs text-charcoal-600">
					{{ gifts.length }} result{{ gifts.length !== 1 ? 's' : '' }} for "{{ searchQuery }}"
				</div>
			</div>
		</div>

		<!-- Filters (Expandable) -->
		<div v-if="showFilters || !isMobile" class="bg-white border-b border-desert-sand-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
				<!-- Filter Header with Active Count -->
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm font-medium text-charcoal-700">
						Filters
						<span v-if="activeFilterCount > 0" class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							{{ activeFilterCount }}
						</span>
					</h3>
					<button
						v-if="hasActiveFilters"
						@click="clearFilters"
						class="text-xs text-gray-700 hover:text-gray-800 font-medium transition-colors"
					>
						Clear all
					</button>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					<!-- Status Filter -->
					<div>
						<label class="block text-xs font-medium text-charcoal-700 mb-1">Status</label>
						<CustomDropdown
							v-model="filters.status"
							:options="statusOptions"
							placeholder="All Status"
							:icon="FlagIcon"
							:show-badge="true"
							label="status"
						/>
					</div>

					<!-- Category Filter -->
					<div>
						<label class="block text-xs font-medium text-charcoal-700 mb-1">Category</label>
						<CustomDropdown
							v-model="filters.category"
							:options="categoryOptions"
							placeholder="All Categories"
							:icon="TagIcon"
							:loading="categoriesLoading"
							:searchable="true"
							:show-badge="true"
							label="categories"
						/>
					</div>

					<!-- Sort Order -->
					<div>
						<label class="block text-xs font-medium text-charcoal-700 mb-1">Sort By</label>
						<CustomDropdown
							v-model="sortBy"
							:options="sortOptions"
							placeholder="Sort Order"
							:icon="ArrowsUpDownIcon"
							:show-badge="false"
							label="sort options"
						/>
					</div>
				</div>

				<!-- Active Filters Display -->
				<div v-if="hasActiveFilters" class="mt-3 flex flex-wrap gap-1.5">
					<span class="text-xs text-charcoal-600">Active:</span>

					<span v-if="searchQuery" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
						Search: "{{ searchQuery }}"
						<button @click="clearSearch" class="ml-1 text-gray-700 hover:text-gray-800">
							<XMarkIcon class="w-3 h-3" />
						</button>
					</span>

					<span v-if="filters.status" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
						Status: {{ filters.status }}
						<button @click="filters.status = ''" class="ml-1 text-blue-600 hover:text-blue-800">
							<XMarkIcon class="w-3 h-3" />
						</button>
					</span>

					<span v-if="filters.category" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
						Category: {{ filters.category }}
						<button @click="filters.category = ''" class="ml-1 text-purple-600 hover:text-purple-800">
							<XMarkIcon class="w-3 h-3" />
						</button>
					</span>
				</div>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-card p-6 animate-pulse">
					<div class="flex items-center space-x-4 mb-4">
						<div class="w-12 h-12 bg-charcoal-200 rounded-xl"></div>
						<div class="flex-1">
							<div class="h-4 bg-charcoal-200 rounded w-3/4 mb-2"></div>
							<div class="h-3 bg-charcoal-200 rounded w-1/2"></div>
						</div>
					</div>
					<div class="space-y-3">
						<div class="h-3 bg-charcoal-200 rounded"></div>
						<div class="h-3 bg-charcoal-200 rounded w-5/6"></div>
						<div class="h-8 bg-charcoal-200 rounded w-24"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error State -->
		<div v-else-if="error && !loading" class="max-w-md mx-auto text-center py-12">
			<ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
			<h3 class="text-lg font-semibold text-charcoal-900 mb-2">Something went wrong</h3>
			<p class="text-charcoal-600 mb-6">{{ error }}</p>
			<button
				@click="retryLoad"
				class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors"
			>
				<ArrowPathIcon class="w-5 h-5 mr-2" />
				Try Again
			</button>
		</div>

		<!-- Empty State -->
		<div v-else-if="!gifts.length && !loading && !error" class="max-w-md mx-auto text-center py-12">
			<GiftIcon class="w-16 h-16 text-charcoal-400 mx-auto mb-4" />
			<h3 class="text-lg font-semibold text-charcoal-900 mb-2">
				{{ searchQuery || hasActiveFilters ? 'No gifts found' : 'No gifts yet' }}
			</h3>
			<p class="text-charcoal-600 mb-6">
				{{ emptyStateMessage }}
			</p>

			<!-- Different actions based on state -->
			<div class="space-y-3">
				<button
					v-if="!searchQuery && !hasActiveFilters && authStore.canCreateGifts"
					@click="router.push('/gifts/new')"
					class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors"
				>
					<PlusIcon class="w-5 h-5 mr-2" />
					Create Your First Gift
				</button>

				<!-- Message for Event Coordinators who can't create gifts -->
				<div
					v-else-if="!searchQuery && !hasActiveFilters && !authStore.canCreateGifts"
					class="text-center p-6 bg-amber-50 border border-amber-200 rounded-xl"
				>
					<p class="text-amber-800 font-medium">Contact your Event Manager or Admin to create gifts</p>
					<p class="text-amber-600 text-sm mt-1">Event Coordinators can view and manage existing gifts</p>
				</div>

				<button
					v-else
					@click="clearFilters"
					class="inline-flex items-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-xl text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
				>
					<XMarkIcon class="w-5 h-5 mr-2" />
					Clear Filters
				</button>
			</div>
		</div>

		<!-- Gift List -->
		<div v-else class="max-w-7xl mx-auto py-8">

			<!-- Desktop List View -->
			<div v-if="!isMobile" class="px-4 md:px-0">
				<div class="bg-white rounded-xl shadow-card overflow-hidden">
				<!-- Table Header -->
				<div class="bg-charcoal-50 border-b border-charcoal-200">
					<div class="grid grid-cols-12 gap-1 px-6 py-4 text-sm font-medium text-charcoal-700">
						<div class="col-span-1">Image</div>
						<div class="col-span-3">Gift Name</div>
						<div class="col-span-2">UAE Ring</div>
						<div class="col-span-2">Barcode ID</div>
						<div class="col-span-2">Status</div>
						<div class="col-span-1">Issued To</div>
						<div class="col-span-1">Actions</div>
					</div>
				</div>

				<!-- Table Body -->
				<div class="divide-y divide-charcoal-100">
					<div v-for="gift in gifts" :key="gift.name"
						class="grid grid-cols-12 gap-1 px-6 py-4 items-center hover:bg-charcoal-50 transition-colors cursor-pointer"
						@click="router.push(`/gifts/${gift.name}`)">
						<!-- Image -->
						<div class="col-span-1">
							<div class="w-12 h-12 rounded-xl overflow-hidden">
								<!-- Show actual gift image if available -->
								<AppImage
									v-if="getFirstGiftImage(gift)"
									:src="getFirstGiftImage(gift)"
									:alt="gift.gift_name"
									image-class="w-full h-full object-cover"
									container-class="w-full h-full"
									placeholder-class="w-full h-full"
								/>
								<!-- Fallback to category icon -->
								<div
									v-else
									class="w-full h-full bg-gray-100 flex items-center justify-center"
								>
									<component :is="getCategoryIcon(gift.category)" class="w-6 h-6 text-gray-700" />
								</div>
							</div>
						</div>

						<!-- Gift Name -->
						<div class="col-span-3">
							<h3 class="font-semibold text-charcoal-900 mb-1 truncate">
								{{ gift.gift_name }}
							</h3>
							<p class="text-sm text-charcoal-600 line-clamp-1">
								{{ gift.description || 'No description available' }}
							</p>
						</div>

						<!-- Gift No (Gift ID) -->
						<div class="col-span-2">
							<span class="font-mono text-sm text-charcoal-800 block truncate">
								{{ gift.gift_id || gift.name }}
							</span>
						</div>

						<!-- UAE Ring (Barcode Value) -->
						<div class="col-span-2">
							<span class="font-mono text-sm text-charcoal-800 block truncate">
								{{ gift.barcode_value || '-' }}
							</span>
						</div>

						<!-- Status -->
						<div class="col-span-2">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
								:class="getStatusClasses(gift.status)">
								<span class="w-2 h-2 rounded-full mr-1.5"
									:class="getStatusDotClasses(gift.status)"></span>
								{{ getStatusText(gift.status) }}
							</span>
						</div>

						<!-- Issued To -->
						<div class="col-span-1">
							<span class="text-sm text-charcoal-800 block truncate">
								{{ gift.owner_full_name || '-' }}
							</span>
						</div>

						<!-- Actions -->
						<div class="col-span-1">
							<div class="flex items-center space-x-1">
								<button @click.stop="router.push(`/gifts/${gift.name}`)"
									class="p-2 text-charcoal-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
									title="View Details">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</button>
								<button v-if="authStore.canEditGifts" @click.stop="router.push(`/gifts/${gift.name}/edit`)"
									class="p-2 text-charcoal-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									title="Edit Gift">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
				</div>
			</div>

			<!-- Mobile Card View -->
			<div v-else class="px-4 space-y-4 pb-safe-navbar">
				<GiftCard v-for="gift in gifts" :key="gift.name" :gift="gift" :can-edit="authStore.canEditGifts" :can-dispatch="authStore.canDispatchGifts"
					@click="router.push(`/gifts/${gift.name}`)" @issue="router.push(`/scan/gift/${gift.name}`)"
					@edit="router.push(`/gifts/${gift.name}/edit`)" @delete="handleDelete(gift)" />
			</div>

			<!-- Load More -->
			<div v-if="hasMore" class="text-center mt-8">
				<button @click="loadMore" :disabled="loadingMore"
					class="inline-flex items-center px-6 py-3 border border-charcoal-300 text-base font-medium rounded-xl text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
					<ArrowPathIcon v-if="loadingMore" class="w-5 h-5 mr-2 animate-spin" />
					{{ loadingMore ? 'Loading...' : 'Load More' }}
				</button>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<ConfirmDialog v-if="showDeleteDialog" title="Delete Gift"
			:message="`Are you sure you want to delete '${selectedGift?.gift_name}'? This action cannot be undone.`"
			confirm-text="Delete" confirm-class="bg-red-600 hover:bg-red-700" @confirm="confirmDelete"
			@cancel="showDeleteDialog = false" />
	</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBreakpoints } from '@composables/useBreakpoints'
import { useDebounce } from '@composables/useDebounce'
import { useAuthStore } from '../stores/auth'
import { GiftAPI } from '@services/api'
import { useNotifications } from '@composables/useNotifications'
import { getImageUrl } from '@utils/imageUtils'

// Components
import GiftCard from '../components/GiftCard.vue'
import AppImage from '../components/AppImage.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import CustomDropdown from '../components/CustomDropdown.vue'

// Icons
import {
	GiftIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	PlusIcon,
	ArrowPathIcon,
	XMarkIcon,
	ArrowLeftIcon,
	ExclamationTriangleIcon,
	FlagIcon,
	TagIcon,
	ArrowsUpDownIcon
} from '@heroicons/vue/24/outline'

export default {
	name: 'GiftList',
	components: {
		GiftCard,
		AppImage,
		ConfirmDialog,
		CustomDropdown,
		GiftIcon,
		MagnifyingGlassIcon,
		FunnelIcon,
		PlusIcon,
		ArrowPathIcon,
		XMarkIcon,
		ArrowLeftIcon,
		ExclamationTriangleIcon,
		FlagIcon,
		TagIcon,
		ArrowsUpDownIcon
	},
	emits: [],
	setup() {
		const router = useRouter()
		const route = useRoute()
		const authStore = useAuthStore()
		const { isMobile } = useBreakpoints()
		const { showNotification } = useNotifications()

		// State
		const gifts = ref([])
		const categories = ref([])
		const loading = ref(true)
		const categoriesLoading = ref(true)
		const loadingMore = ref(false)
		const hasMore = ref(true)
		const currentPage = ref(1)
		const pageSize = 20
		const error = ref(null)

		// UI State
		const showSearch = ref(false)
		const showFilters = ref(false)
		const showDeleteDialog = ref(false)
		const selectedGift = ref(null)

		// Search and Filters
		const searchQuery = ref('')
		const filters = ref({
			status: route.query.status || '',
			category: route.query.category || ''
		})
		const sortBy = ref('creation_desc')

		// Dropdown options
		const statusOptions = ref([
			{
				value: 'Available',
				label: 'Available',
				badge: '●',
				badgeClass: 'bg-green-100 text-green-800'
			},
			{
				value: 'Issued',
				label: 'Dispatched',
				badge: '●',
				badgeClass: 'bg-blue-100 text-blue-800'
			}
		])

		const sortOptions = ref([
			{
				value: 'creation_desc',
				label: 'Newest First'
			},
			{
				value: 'creation_asc',
				label: 'Oldest First'
			}
		])

		// Computed options for categories
		const categoryOptions = computed(() => {
			return categories.value.map(category => ({
				value: category.category_name,
				label: category.category_name,
				badge: `${gifts.value.filter(g => g.category === category.category_name).length}`,
				badgeClass: 'bg-gray-100 text-gray-700'
			}))
		})

		// Helper functions for list view
		const getCategoryIcon = (category) => {
			const icons = {
				'Electronics': 'GiftIcon',
				'Jewelry': 'GiftIcon',
				'Books': 'GiftIcon',
				'Other': 'GiftIcon',
				'Experience': 'GiftIcon'
			}
			return icons[category] || 'GiftIcon'
		}

		const getCategoryColor = (category) => {
			const colors = {
				'Electronics': 'bg-blue-500',
				'Jewelry': 'bg-purple-500',
				'Books': 'bg-green-500',
				'Other': 'bg-gray-500',
				'Experience': 'bg-orange-500'
			}
			return colors[category] || 'bg-gray-500'
		}

		const formatCategory = (category) => {
			return category || 'Other'
		}

		const getStatusClasses = (status) => {
			const classes = {
				'Available': 'bg-gray-100 text-gray-800',
				'Issued': 'bg-gold-100 text-gold-800'
			}
			return classes[status] || 'bg-gray-100 text-gray-800'
		}

		const getStatusDotClasses = (status) => {
			const classes = {
				'Available': 'bg-gray-600',
				'Issued': 'bg-gold-500'
			}
			return classes[status] || 'bg-gray-500'
		}

		const getStatusText = (status) => {
			return status || 'Unknown'
		}

		const getFirstGiftImage = (gift) => {
			if (!gift.images || !Array.isArray(gift.images) || gift.images.length === 0) {
				return null
			}

			const firstImageObj = gift.images[0]
			if (!firstImageObj || !firstImageObj.image) return null

			// Use the image utility to get the proper URL
			return getImageUrl(firstImageObj.image)
		}

		// Computed
		const hasActiveFilters = computed(() => {
			return searchQuery.value ||
				filters.value.status ||
				filters.value.category
		})

		const activeFilterCount = computed(() => {
			let count = 0
			if (searchQuery.value) count++
			if (filters.value.status) count++
			if (filters.value.category) count++
			return count
		})

		const emptyStateMessage = computed(() => {
			if (error.value) return 'Please try again or contact support if the problem persists'
			if (searchQuery.value && hasActiveFilters.value) return 'Try different search terms or adjust your filters'
			if (searchQuery.value) return 'Try different search terms'
			if (hasActiveFilters.value) return 'Try adjusting your filters or clear them to see all gifts'
			return 'Get started by creating your first gift to begin managing your inventory'
		})

		// Debounced search
		const debouncedSearch = useDebounce(() => {
			currentPage.value = 1
			loadGifts(true)
		}, 300)

		// Methods
		const loadGifts = async (reset = false) => {
			try {
				if (reset) {
					loading.value = true
					currentPage.value = 1
					error.value = null
				} else {
					loadingMore.value = true
				}

				// Build filters object for API
				const apiFilters = {}

				// Search query
				if (searchQuery.value) {
					apiFilters.search = searchQuery.value.trim()
				}

				// Status filter
				if (filters.value.status) {
					apiFilters.status = filters.value.status
				}

				// Category filter
				if (filters.value.category) {
					apiFilters.category = filters.value.category
				}

				// Parse sort order
				const [field, order] = sortBy.value.split('_')
				if (field && order) {
					apiFilters.order_by = field === 'creation' ? 'creation' : field
					apiFilters.sort_order = order
				}

				// Call the API
				const response = await GiftAPI.list(apiFilters, currentPage.value, pageSize)

				if (response && response.success && response.data) {
					const newGifts = response.data || []

					if (reset) {
						gifts.value = newGifts
					} else {
						gifts.value = [...gifts.value, ...newGifts]
					}

					hasMore.value = newGifts.length === pageSize
				} else {
					throw new Error(response?.error || 'Invalid response format')
				}

			} catch (err) {
				console.error('Failed to load gifts:', err)
				error.value = err.message || 'Failed to load gifts. Please try again.'

				if (reset) {
					gifts.value = []
				}

				showNotification('Failed to load gifts', 'error')
			} finally {
				loading.value = false
				loadingMore.value = false
			}
		}

		const loadCategories = async () => {
			try {
				categoriesLoading.value = true
				const response = await GiftAPI.getCategories()
				if (response && response.success && response.data) {
					// Handle the response format: [{"name": "cat-001", "category_name": "Mobile"}]
					categories.value = response.data || []
				} else {
					console.warn('Failed to load categories:', response?.error)
				}
			} catch (error) {
				console.error('Failed to load categories:', error)
				showNotification('Failed to load categories', 'error')
			} finally {
				categoriesLoading.value = false
			}
		}

		const loadMore = () => {
			if (hasMore.value && !loadingMore.value) {
				currentPage.value++
				loadGifts()
			}
		}

		const clearFilters = () => {
			searchQuery.value = ''
			filters.value = {
				status: '',
				category: ''
			}
			sortBy.value = 'creation_desc'
			currentPage.value = 1
			loadGifts(true)
		}

		const clearSearch = () => {
			searchQuery.value = ''
			currentPage.value = 1
			loadGifts(true)
		}

		const retryLoad = () => {
			error.value = null
			loadGifts(true)
		}

		const handleDelete = (gift) => {
			selectedGift.value = gift
			showDeleteDialog.value = true
		}

		const confirmDelete = async () => {
			try {
				const response = await GiftAPI.delete(selectedGift.value.name)

				if (response.success) {
					// Remove from local list
					gifts.value = gifts.value.filter(g => g.name !== selectedGift.value.name)
					showNotification('Gift deleted successfully', 'success')
				} else {
					showNotification(response.error || 'Failed to delete gift', 'error')
				}

				showDeleteDialog.value = false
				selectedGift.value = null
			} catch (error) {
				console.error('Failed to delete gift:', error)
				showNotification('Failed to delete gift', 'error')
			}
		}

		// Watchers
		watch(() => route.query, (newQuery) => {
			// Update filters when route query changes
			filters.value.status = newQuery.status || ''
			filters.value.category = newQuery.category || ''
		})

		watch([() => filters.value.status, () => filters.value.category, sortBy], () => {
			currentPage.value = 1
			loadGifts(true)
		})

		// Lifecycle
		onMounted(() => {
			// Show filters panel if there are active filters from URL
			if (route.query.status || route.query.category) {
				showFilters.value = true
			}

			// Check for access denied notification
			if (route.query.access_denied === 'true') {
				const message = route.query.message || 'Access denied: Insufficient permissions'
				showNotification({
					type: 'error',
					title: 'Access Denied',
					message: message
				})

				// Clean up the URL by removing the query parameters
				router.replace({ name: 'Gifts' })
			}

			// Load user role for authorization checks
			if (authStore.isAuthenticated && !authStore.userRole) {
				authStore.loadUserRole()
			}

			loadGifts(true)
			loadCategories()
		})

		return {
			// Stores
			authStore,
			// State
			gifts,
			categories,
			loading,
			categoriesLoading,
			loadingMore,
			hasMore,
			error,

			// UI State
			showSearch,
			showFilters,
			showDeleteDialog,
			selectedGift,

			// Search and Filters
			searchQuery,
			filters,
			sortBy,
			hasActiveFilters,
			activeFilterCount,
			emptyStateMessage,

			// Dropdown Options
			statusOptions,
			sortOptions,
			categoryOptions,

			// Computed
			isMobile,

			// Router
			router,

			// Helper functions
			getCategoryIcon,
			getCategoryColor,
			formatCategory,
			getStatusClasses,
			getStatusDotClasses,
			getStatusText,
			getFirstGiftImage,

			// Methods
			loadMore,
			clearFilters,
			clearSearch,
			retryLoad,
			handleDelete,
			confirmDelete,
			debouncedSearch,

			// Icons
			FlagIcon,
			TagIcon,
			ArrowsUpDownIcon
		}
	}
}
</script>

<style scoped>
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

.animate-pulse {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Line clamp utility */
.line-clamp-1 {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

/* Smooth transitions */
.transition-colors {
	transition-property: color, background-color, border-color;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 200ms;
}

/* Focus styles */
button:focus,
input:focus,
select:focus {
	outline: 2px solid #006C57;
	outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
	.animate-pulse {
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

	.border-desert-sand-200 {
		border-color: #6B7280 !important;
	}
}

/* PWA bottom navbar safe area */
.pb-safe-navbar {
	/* Default padding bottom for desktop */
	padding-bottom: 2rem;
}

/* Mobile PWA bottom navbar spacing */
@media (max-width: 1024px) {
	.pb-safe-navbar {
		/* Account for bottom tab bar (64px) + extra spacing (32px) */
		padding-bottom: 6rem;
	}
}

/* iOS safe area support for PWA */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
	@media (max-width: 1024px) {
		.pb-safe-navbar {
			/* Account for bottom tab bar + safe area + extra spacing */
			padding-bottom: calc(6rem + env(safe-area-inset-bottom));
		}
	}
}

/* Standalone PWA mode (when installed) */
@media (display-mode: standalone) {
	.pb-safe-navbar {
		/* Extra padding for standalone PWA mode */
		padding-bottom: calc(6rem + 1rem);
	}
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
	@media (display-mode: standalone) {
		.pb-safe-navbar {
			/* Comprehensive spacing for standalone PWA with safe area */
			padding-bottom: calc(6rem + 1rem + env(safe-area-inset-bottom));
		}
	}
}
</style>
