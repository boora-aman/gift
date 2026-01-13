<template>
  <div
    class="bg-white rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden"
    @click="$emit('click')"
  >
    <!-- Card Header -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between mb-4">
        <!-- Recipient Info -->
        <div class="flex items-center space-x-4 flex-1 min-w-0">
          <div class="flex-shrink-0">
            <!-- Person Photo or Default Icon -->
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                v-if="issue.person_photo"
                :src="getFullImageUrl(issue.person_photo)"
                :alt="`${getRecipientName(issue)} photo`"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <UserIcon 
                v-else
                class="w-6 h-6 text-gray-700"
              />
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-charcoal-900 truncate mb-1">
              {{ getRecipientName(issue) }}
            </h3>
            <p class="text-sm text-charcoal-600 mb-1">
              {{ issue.mobile_number }}
            </p>
            <p class="text-xs text-charcoal-500">
              Emirates ID: {{ issue.emirates_id }}
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex-shrink-0 ml-4">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusClasses(issue.status)"
          >
            <span class="w-2 h-2 rounded-full mr-2" :class="getStatusDotClasses(issue.status)"></span>
            {{ getStatusText(issue.status) }}
          </span>
        </div>
      </div>

      <!-- Gift Information -->
      <div class="flex items-center space-x-4 p-4 bg-desert-sand-50 rounded-lg">
        <div class="flex-shrink-0">
          <component 
            :is="getCategoryIcon(issue.gift_category)"
            class="w-8 h-8 text-charcoal-600"
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-medium text-charcoal-900 truncate mb-1">
            {{ issue.gift }}
          </h4>
          <p class="text-sm text-charcoal-600">
            Category: {{ formatCategory(issue.category) }}
          </p>
        </div>
        
        <div class="text-right">
          <p class="text-xs text-charcoal-500 mb-1">
            Issued on
          </p>
          <p class="text-sm font-medium text-charcoal-900">
            {{ formatDate(issue.date) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="px-6 pb-4">
      <!-- Dispatch Details Grid -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- Issue Date -->
        <div>
          <p class="text-xs text-charcoal-500 mb-1">Issued On</p>
          <p class="font-medium text-charcoal-900">
            {{ formatDate(issue.date) }}
          </p>
        </div>

        <!-- Category -->
        <div>
          <p class="text-xs text-charcoal-500 mb-1">Category</p>
          <p class="font-medium text-charcoal-900">
            {{ formatCategory(issue.category) }}
          </p>
        </div>
      </div>

      <!-- Photo Section (if available) -->
      <div v-if="issue.person_photo" class="mb-4">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <UserIcon class="w-4 h-4 text-gray-700" />
            <span class="text-sm text-gray-800 font-medium">Photo Available</span>
          </div>
          <button
            @click.stop="showPhoto"
            class="text-gray-700 hover:text-gray-800 text-sm font-medium underline"
          >
            View Photo
          </button>
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="px-6 py-4 bg-desert-sand-50 border-t border-desert-sand-200">
      <div class="flex items-center justify-between">
        <!-- Primary Actions -->
        <div class="flex items-center space-x-3">
          <!-- View/Edit Button -->
          <button
            @click.stop="$emit('edit')"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            View Details
          </button>
        </div>

        <!-- Secondary Actions -->
        <div class="flex items-center space-x-2">
          <!-- Contact Recipient -->
          <button
            v-if="issue.mobile_number"
            @click.stop="contactRecipient"
            class="p-2 text-charcoal-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Contact Recipient"
          >
            <ChatBubbleLeftIcon class="w-4 h-4" />
          </button>

          <!-- More Actions Menu -->
          <div class="relative" ref="menuRef">
            <button
              @click.stop="toggleMenu"
              class="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
              title="More Actions"
            >
              <EllipsisVerticalIcon class="w-4 h-4" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-elevated border border-charcoal-200 py-1 z-50"
              @click.stop
            >
              <button
                @click="copyIssueDetails"
                class="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-charcoal-50 flex items-center space-x-2"
              >
                <ClipboardDocumentIcon class="w-4 h-4" />
                <span>Copy Details</span>
              </button>
              
              <button
                v-if="issue.person_photo"
                @click="showPhoto"
                class="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-charcoal-50 flex items-center space-x-2"
              >
                <UserIcon class="w-4 h-4" />
                <span>View Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@composables/useNotifications'

// Icons
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  ArrowDownTrayIcon,
  GiftIcon,
  TicketIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GiftIssueCard',
  components: {
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    EllipsisVerticalIcon,
    ClipboardDocumentIcon,
    QrCodeIcon,
    InformationCircleIcon,
    ChatBubbleLeftIcon,
    BellIcon,
    ArrowDownTrayIcon,
    GiftIcon,
    TicketIcon,
    ShoppingBagIcon,
    WrenchScrewdriverIcon,
    StarIcon
  },
  props: {
    issue: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'edit', 'show-photo'],
  setup(props, { emit }) {
    const { showNotification } = useNotifications()
    
    // State
    const showMenu = ref(false)
    const menuRef = ref(null)

    // Methods
    const toggleMenu = () => {
      showMenu.value = !showMenu.value
    }

    const closeMenu = (event) => {
      if (menuRef.value && !menuRef.value.contains(event.target)) {
        showMenu.value = false
      }
    }

    const getRecipientName = (issue) => {
      // Use owner name as the primary recipient name
      const ownerFirstName = issue.owner_full_name || ''
      const ownerLastName = issue.owner_full_name || ''
      const ownerName = `${ownerFirstName} ${ownerLastName}`.trim()
      
      // Fallback to coordinator name if owner name is not available
      if (!ownerName && (issue.coordinator_full_name || issue.coordinator_full_name)) {
        const coordinatorFirstName = issue.coordinator_full_name || ''
        const coordinatorLastName = issue.coordinator_full_name || ''
        return `${coordinatorFirstName} ${coordinatorLastName}`.trim() || 'Unknown'
      }
      
      return ownerName || 'Unknown'
    }

    const getStatusClasses = (status) => {
      // For now, we don't have status field in Gift Issue
      return 'bg-gray-100 text-gray-800'
    }

    const getStatusDotClasses = (status) => {
      // For now, we don't have status field in Gift Issue
      return 'bg-gray-600'
    }

    const getStatusText = (status) => {
      // For now, we don't have status field in Gift Issue
      return 'Issued'
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

    const formatDate = (date) => {
      if (!date) return 'N/A'
      
      return new Date(date).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return ''
      
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      
      // Handle private files
      if (imagePath.startsWith('/private/') || imagePath.startsWith('private/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return `/api/method/frappe.core.doctype.file.file.download_file?file_url=${cleanPath}`
      }
      
      // Handle public files
      if (imagePath.startsWith('/files/') || imagePath.startsWith('files/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return cleanPath
      }
      
      // Default case
      return `/files/${imagePath}`
    }

    const handleImageError = (event) => {
      // Hide the broken image and show the fallback icon
      event.target.style.display = 'none'
      const parent = event.target.parentElement
      if (parent) {
        const userIcon = parent.querySelector('svg')
        if (userIcon) {
          userIcon.style.display = 'block'
        }
      }
    }

    const showPhoto = () => {
      // Emit event to show photo modal
      emit('show-photo', props.issue)
      showMenu.value = false
    }

    const contactRecipient = () => {
      const issue = props.issue
      
      if (issue.mobile_number) {
        window.open(`tel:${issue.mobile_number}`)
      }
    }

    const copyIssueDetails = async () => {
      const issue = props.issue
      const ownerName = `${issue.owner_full_name || ''} ${issue.owner_full_name || ''}`.trim()
      const coordinatorName = `${issue.coordinator_full_name || ''} ${issue.coordinator_full_name || ''}`.trim()
      
      const details = `
Gift Dispatch Details:
Owner: ${ownerName || 'N/A'}
Coordinator: ${coordinatorName || 'N/A'}
Mobile: ${issue.mobile_number || 'N/A'}
Emirates ID: ${issue.emirates_id || 'N/A'}
Address: ${issue.address || 'N/A'}
Gift: ${issue.gift || 'N/A'}
Category: ${formatCategory(issue.category)}
Issued: ${formatDate(issue.date)}
      `.trim()

      try {
        await navigator.clipboard.writeText(details)
        showNotification('Dispatch details copied to clipboard', 'success')
      } catch (error) {
        console.error('Failed to copy:', error)
        showNotification('Failed to copy details', 'error')
      }
      showMenu.value = false
    }

    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', closeMenu)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeMenu)
    })

    return {
      // State
      showMenu,
      menuRef,
      
      // Methods
      toggleMenu,
      getRecipientName,
      getStatusClasses,
      getStatusDotClasses,
      getStatusText,
      getCategoryIcon,
      formatCategory,
      formatDate,
      getFullImageUrl,
      handleImageError,
      showPhoto,
      contactRecipient,
      copyIssueDetails
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
