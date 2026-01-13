<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="$emit('cancel')"
    ></div>

    <!-- Dialog -->
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <!-- Icon -->
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="getIconBgClass()">
          <component 
            :is="getIcon()"
            class="h-6 w-6" 
            :class="getIconClass()"
          />
        </div>

        <!-- Content -->
        <div class="mt-3 text-center sm:mt-5">
          <h3 class="text-lg font-semibold leading-6 text-charcoal-900" id="modal-title">
            {{ title }}
          </h3>
          <div class="mt-2">
            <p class="text-sm text-charcoal-600">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <!-- Confirm Button -->
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 transition-colors"
            :class="confirmClass"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </button>

          <!-- Cancel Button -->
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-charcoal-900 shadow-sm ring-1 ring-inset ring-charcoal-300 hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 transition-colors"
            @click="$emit('cancel')"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Icons
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ConfirmDialog',
  components: {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    QuestionMarkCircleIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'warning',
      validator: value => ['warning', 'danger', 'info', 'success', 'question'].includes(value)
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    confirmClass: {
      type: String,
      default: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    getIcon() {
      const iconMap = {
        warning: 'ExclamationTriangleIcon',
        danger: 'XCircleIcon',
        info: 'InformationCircleIcon',
        success: 'CheckCircleIcon',
        question: 'QuestionMarkCircleIcon'
      }
      
      return iconMap[this.type] || iconMap.warning
    },
    
    getIconClass() {
      const classMap = {
        warning: 'text-gold-600',
        danger: 'text-red-600',
        info: 'text-blue-600',
        success: 'text-gray-700',
        question: 'text-charcoal-600'
      }
      
      return classMap[this.type] || classMap.warning
    },
    
    getIconBgClass() {
      const classMap = {
        warning: 'bg-gold-100',
        danger: 'bg-red-100',
        info: 'bg-blue-100',
        success: 'bg-gray-100',
        question: 'bg-charcoal-100'
      }
      
      return classMap[this.type] || classMap.warning
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

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

/* Focus styles for accessibility */
button:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-opacity,
  .transition-all,
  .transition-colors {
    transition: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .shadow-xl {
    border: 1px solid #374151;
  }
  
  .ring-1.ring-inset.ring-charcoal-300 {
    border: 2px solid #374151;
  }
}
</style>
