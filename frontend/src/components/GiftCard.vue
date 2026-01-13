<template>
  <div
    class="bg-white rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 cursor-pointer group overflow-hidden"
    @click="$emit('click')"
  >
    <!-- Card Header with Status -->
    <div class="relative p-6 pb-4">
      <!-- Gift Icon/Image and Basic Info -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-14 h-14 rounded-xl overflow-hidden">
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
              class="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors"
            >
              <component
                :is="getCategoryIcon(gift.category)"
                class="w-7 h-7 text-gray-700"
              />
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 pr-2">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-semibold text-charcoal-900 truncate">
              {{ gift.gift_name }}
            </h3>
            <!-- Status Badge -->
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2"
              :class="getStatusClasses(gift.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1" :class="getStatusDotClasses(gift.status)"></span>
              {{ getStatusText(gift.status) }}
            </span>
          </div>
          <!-- Gift Code -->
          <p class="text-sm text-charcoal-600 mb-1 font-mono">
            {{ gift.gift_id }}
          </p>
          <!-- UAE Ring -->
          <p v-if="gift.barcode_value" class="text-sm text-charcoal-600 mb-1 font-mono">
            UAE Ring: {{ gift.gift_id }}
          </p>
          <!-- Issued To -->
          <p v-if="gift.owner_full_name" class="text-sm text-charcoal-600 mb-1">
            Issued To: {{ gift.owner_full_name }}
          </p>
          <!-- Created date -->
          <p class="text-xs text-charcoal-400">
            Created {{ formatCreatedDate(gift.creation) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="px-6 pb-4">
      <!-- Description -->
      <p v-if="gift.description" class="text-sm text-charcoal-600 mb-4 line-clamp-2 leading-relaxed">
        {{ gift.description }}
      </p>
      <div v-else class="mb-4">
        <p class="text-sm text-charcoal-400 italic">No description available</p>
      </div>

      <!-- Gift Details Grid - Only show relevant issued information -->
      <div v-if="gift.status === 'issued'" class="grid grid-cols-1 gap-3 mb-4">
        <!-- Issued To (if issued) -->
        <div v-if="gift.owner_full_name">
          <div class="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <UserIcon class="w-4 h-4 text-blue-600" />
            <div>
              <p class="text-xs text-blue-600 font-medium">Issued To</p>
              <p class="text-sm font-semibold text-blue-900 truncate">
                {{ gift.owner_full_name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Issue Date (if issued) -->
        <div v-if="gift.issued_date">
          <div class="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <component
              :is="CalendarIcon"
              class="w-4 h-4 text-blue-600"
            />
            <div>
              <p class="text-xs text-blue-600 font-medium">Issued On</p>
              <p class="text-sm font-semibold text-blue-900">
                {{ formatDateTime(gift.issued_date) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <!-- Primary Action -->
        <div class="flex-1">
          <button
            v-if="(gift.status === 'Available' || gift.status === 'available') && canDispatch"
            @click.stop="$emit('issue')"
            class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-sm"
          >
            <GiftIcon class="w-4 h-4 mr-2" />
            Dispatch Gift
          </button>

          <div v-else-if="gift.status === 'Issued' || gift.status === 'issued'" class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-blue-700 font-medium">
              Gift Dispatched
            </span>
          </div>

          <div v-else-if="gift.status === 'expired'" class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="text-sm text-red-600 font-medium">
              Expired
            </span>
          </div>

          <div v-else class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span class="text-sm text-gray-600 font-medium">
              {{ getStatusText(gift.status) }}
            </span>
          </div>
        </div>

        <!-- Secondary Actions -->
        <div class="flex items-center space-x-2 ml-4">
          <!-- View Details (Hidden - clicking card will handle this) -->

          <!-- Edit -->
          <button
            v-if="canEdit"
            @click.stop="$emit('edit')"
            class="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Gift"
          >
            <PencilIcon class="w-4 h-4" />
          </button>

          <!-- More options indicator -->
          <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotifications } from '@composables/useNotifications'
import { getImageUrl } from '@utils/imageUtils'

// Components
import AppImage from './AppImage.vue'

// Icons
import {
  GiftIcon,
  UserIcon,
  PencilIcon,
  TicketIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GiftCard',
  components: {
    AppImage,
    GiftIcon,
    UserIcon,
    PencilIcon,
    TicketIcon,
    ShoppingBagIcon,
    WrenchScrewdriverIcon,
    StarIcon,
    CalendarIcon
  },
  props: {
    gift: {
      type: Object,
      required: true
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    canDispatch: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click', 'edit', 'issue', 'delete'],
  setup(props, { emit }) {
    const { showNotification } = useNotifications()

    // Methods
    const getStatusClasses = (status) => {
      const classes = {
        available: 'bg-gray-100 text-gray-800',
        issued: 'bg-blue-100 text-blue-800',
        expired: 'bg-red-100 text-red-800',
        cancelled: 'bg-charcoal-100 text-charcoal-800'
      }
      return classes[status] || classes.available
    }

    const getStatusDotClasses = (status) => {
      const classes = {
        available: 'bg-gray-600',
        issued: 'bg-blue-500',
        expired: 'bg-red-500',
        cancelled: 'bg-charcoal-500'
      }
      return classes[status] || classes.available
    }

    const getStatusText = (status) => {
      const texts = {
        available: 'Available',
        issued: 'Issued',
        expired: 'Expired',
        cancelled: 'Cancelled'
      }
      return texts[status] || 'Available'
    }

    const getCategoryIcon = (category) => {
      const icons = {
        voucher: 'TicketIcon',
        product: 'ShoppingBagIcon',
        service: 'WrenchScrewdriverIcon',
        experience: 'StarIcon'
      }
      return icons[category] || 'GiftIcon'
    }

    const formatCategory = (category) => {
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED'
      }).format(value || 0)
    }

    const formatValue = (value) => {
      return new Intl.NumberFormat('en-AE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value || 0)
    }

    const formatDate = (date) => {
      if (!date) return 'No expiry'

      const dateObj = new Date(date)
      const now = new Date()
      const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'Expired'
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Tomorrow'
      if (diffDays <= 30) return `${diffDays} days`

      return dateObj.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatDateTime = (datetime) => {
      if (!datetime) return ''

      return new Date(datetime).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatCreatedDate = (date) => {
      if (!date) return ''

      const dateObj = new Date(date)
      const now = new Date()
      const diffMs = now - dateObj
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`

      return dateObj.toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getExpiryClasses = (expiryDate) => {
      if (!expiryDate) return ''

      const dateObj = new Date(expiryDate)
      const now = new Date()
      const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'text-red-600'
      if (diffDays <= 7) return 'text-gold-600'
      return ''
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



    return {
      // Methods
      getStatusClasses,
      getStatusDotClasses,
      getStatusText,
      getCategoryIcon,
      formatCategory,
      formatCurrency,
      formatValue,
      formatDate,
      formatDateTime,
      formatCreatedDate,
      getExpiryClasses,
      getFirstGiftImage,
      CalendarIcon
    }
  }
}
</script>

<style scoped>
/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects */
.group:hover .group-hover\:bg-emerald-200 {
  background-color: #A7F3D0;
}

/* Focus styles */
button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors {
    transition: none !important;
  }

  .hover\:-translate-y-1:hover {
    transform: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }

  .shadow-elevated {
    border: 2px solid #374151;
  }

  .border-desert-sand-200 {
    border-color: #6B7280 !important;
  }
}

/* Print styles */
@media print {
  .shadow-card,
  .shadow-elevated {
    border: 1px solid #374151 !important;
    box-shadow: none !important;
  }
}
</style>
