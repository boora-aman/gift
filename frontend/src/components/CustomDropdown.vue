<template>
	<div class="relative" ref="dropdownRef">
		<!-- Trigger Button -->
		<button
			type="button"
			@click="toggleDropdown"
			:class="[
				'w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-all duration-200',
				isOpen ? 'border-gray-500 ring-2 ring-gray-200' : 'border-charcoal-300 hover:border-gray-400',
				isSelected ? 'bg-gray-50 border-gray-500' : 'bg-white',
				disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
			]"
			:disabled="disabled"
		>
			<div class="flex items-center space-x-2 flex-1 min-w-0">
				<!-- Icon -->
				<component 
					v-if="icon" 
					:is="icon" 
					class="w-4 h-4 text-charcoal-500 flex-shrink-0" 
				/>
				
				<!-- Selected Value or Placeholder -->
				<span 
					:class="[
						'truncate text-left',
						isSelected ? 'text-charcoal-900 font-medium' : 'text-charcoal-500'
					]"
				>
					{{ displayText }}
				</span>
			</div>
			
			<!-- Badge for active filter -->
			<div v-if="showBadge && isSelected" class="flex items-center space-x-2">
				<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
					Active
				</span>
			</div>
			
			<!-- Dropdown Arrow -->
			<ChevronDownIcon 
				:class="[
					'w-4 h-4 text-charcoal-400 transition-transform duration-200 flex-shrink-0 ml-2',
					isOpen ? 'rotate-180' : ''
				]" 
			/>
		</button>

		<!-- Dropdown Menu -->
		<Transition
			enter-active-class="transition ease-out duration-200"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition ease-in duration-150"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="isOpen"
				class="absolute z-50 mt-1 w-full bg-white border border-charcoal-200 rounded-lg shadow-lg max-h-60 overflow-auto"
			>
				<!-- Search Input (if searchable) -->
				<div v-if="searchable" class="p-2 border-b border-charcoal-100">
					<div class="relative">
						<MagnifyingGlassIcon class="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-400" />
						<input
							v-model="searchQuery"
							ref="searchInput"
							type="text"
							:placeholder="`Search ${label.toLowerCase()}...`"
							class="w-full pl-8 pr-3 py-2 text-sm border border-charcoal-200 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							@click.stop
						/>
					</div>
				</div>

				<!-- Options List -->
				<div class="py-1">
					<!-- Default Option -->
					<button
						type="button"
						@click="selectOption(null)"
						:class="[
							'w-full text-left px-3 py-2 text-sm transition-colors duration-150 flex items-center space-x-2',
							!modelValue ? 'bg-gray-50 text-gray-900 font-medium' : 'text-charcoal-700 hover:bg-charcoal-50'
						]"
					>
						<component 
							v-if="defaultIcon" 
							:is="defaultIcon" 
							class="w-4 h-4 text-charcoal-400" 
						/>
						<span>{{ placeholder }}</span>
						<CheckIcon 
							v-if="!modelValue" 
							class="w-4 h-4 text-gray-600 ml-auto" 
						/>
					</button>

					<!-- Filtered Options -->
					<button
						type="button"
						v-for="option in filteredOptions"
						:key="getOptionValue(option)"
						@click="selectOption(option)"
						:class="[
							'w-full text-left px-3 py-2 text-sm transition-colors duration-150 flex items-center space-x-2',
							modelValue === getOptionValue(option) ? 'bg-gray-50 text-gray-900 font-medium' : 'text-charcoal-700 hover:bg-charcoal-50'
						]"
					>
						<!-- Option Icon -->
						<component 
							v-if="getOptionIcon(option)" 
							:is="getOptionIcon(option)" 
							class="w-4 h-4 text-charcoal-500" 
						/>
						
						<!-- Option Text -->
						<span class="flex-1">{{ getOptionLabel(option) }}</span>
						
						<!-- Option Badge/Status -->
						<span 
							v-if="getOptionBadge(option)" 
							:class="getOptionBadgeClass(option)"
							class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
						>
							{{ getOptionBadge(option) }}
						</span>
						
						<!-- Check Icon for Selected -->
						<CheckIcon 
							v-if="modelValue === getOptionValue(option)" 
							class="w-4 h-4 text-gray-600" 
						/>
					</button>

					<!-- No Results -->
					<div 
						v-if="searchable && searchQuery && filteredOptions.length === 0" 
						class="px-3 py-2 text-sm text-charcoal-500 text-center"
					>
						No results found
					</div>

					<!-- Loading State -->
					<div 
						v-if="loading" 
						class="px-3 py-2 text-sm text-charcoal-500 text-center flex items-center justify-center space-x-2"
					>
						<ArrowPathIcon class="w-4 h-4 animate-spin" />
						<span>Loading...</span>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
	ChevronDownIcon, 
	CheckIcon, 
	MagnifyingGlassIcon,
	ArrowPathIcon
} from '@heroicons/vue/24/outline'

export default {
	name: 'CustomDropdown',
	components: {
		ChevronDownIcon,
		CheckIcon,
		MagnifyingGlassIcon,
		ArrowPathIcon
	},
	props: {
		modelValue: {
			type: [String, Number, Object],
			default: null
		},
		options: {
			type: Array,
			required: true
		},
		placeholder: {
			type: String,
			default: 'Select option'
		},
		label: {
			type: String,
			default: 'options'
		},
		valueKey: {
			type: String,
			default: 'value'
		},
		labelKey: {
			type: String,
			default: 'label'
		},
		iconKey: {
			type: String,
			default: 'icon'
		},
		badgeKey: {
			type: String,
			default: 'badge'
		},
		badgeClassKey: {
			type: String,
			default: 'badgeClass'
		},
		icon: {
			type: [Object, Function],
			default: null
		},
		defaultIcon: {
			type: [Object, Function],
			default: null
		},
		searchable: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		showBadge: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const isOpen = ref(false)
		const searchQuery = ref('')
		const dropdownRef = ref(null)
		const searchInput = ref(null)

		const isSelected = computed(() => props.modelValue !== null && props.modelValue !== '' && props.modelValue !== undefined)

		const displayText = computed(() => {
			if (!isSelected.value) return props.placeholder
			
			const selectedOption = props.options.find(option => getOptionValue(option) === props.modelValue)
			return selectedOption ? getOptionLabel(selectedOption) : props.modelValue
		})

		const filteredOptions = computed(() => {
			if (!props.searchable || !searchQuery.value) return props.options
			
			const query = searchQuery.value.toLowerCase()
			return props.options.filter(option => 
				getOptionLabel(option).toLowerCase().includes(query)
			)
		})

		const getOptionValue = (option) => {
			return typeof option === 'object' ? option[props.valueKey] : option
		}

		const getOptionLabel = (option) => {
			return typeof option === 'object' ? option[props.labelKey] : option
		}

		const getOptionIcon = (option) => {
			return typeof option === 'object' ? option[props.iconKey] : null
		}

		const getOptionBadge = (option) => {
			return typeof option === 'object' ? option[props.badgeKey] : null
		}

		const getOptionBadgeClass = (option) => {
			return typeof option === 'object' ? option[props.badgeClassKey] : 'bg-gray-100 text-gray-800'
		}

		const toggleDropdown = () => {
			if (props.disabled) return
			isOpen.value = !isOpen.value
			
			if (isOpen.value && props.searchable) {
				nextTick(() => {
					searchInput.value?.focus()
				})
			}
		}

		const selectOption = (option) => {
			const value = option ? getOptionValue(option) : null
			emit('update:modelValue', value)
			emit('change', { value, option })
			isOpen.value = false
			searchQuery.value = ''
		}

		const closeDropdown = (event) => {
			if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
				isOpen.value = false
				searchQuery.value = ''
			}
		}

		// Close dropdown on outside click
		onMounted(() => {
			document.addEventListener('click', closeDropdown)
		})

		onUnmounted(() => {
			document.removeEventListener('click', closeDropdown)
		})

		// Reset search when dropdown closes
		watch(isOpen, (newValue) => {
			if (!newValue) {
				searchQuery.value = ''
			}
		})

		return {
			isOpen,
			searchQuery,
			dropdownRef,
			searchInput,
			isSelected,
			displayText,
			filteredOptions,
			getOptionValue,
			getOptionLabel,
			getOptionIcon,
			getOptionBadge,
			getOptionBadgeClass,
			toggleDropdown,
			selectOption
		}
	}
}
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-auto::-webkit-scrollbar {
	width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
	background: #f1f5f9;
	border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
	background: #94a3b8;
}

/* Ensure focus styles are visible */
button:focus-visible {
	outline: 2px solid #6366f1;
	outline-offset: 2px;
}

/* Animation for smooth transitions */
.transition-transform {
	transition-property: transform;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 200ms;
}
</style>
