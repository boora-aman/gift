<template>
  <div class="scanner-page">
    <!-- Header Overlay -->
    <div
      class="absolute top-0 left-0 right-0 z-[9999] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
      <div class="flex items-center justify-between p-4 sm:p-6 safe-area-top pointer-events-auto">
        <button @click="$router.push({ name: 'Dashboard' })"
          class="p-3 rounded-lg text-white bg-black/40 hover:bg-black/60 transition-colors border border-white/20 backdrop-blur-sm"
          title="Back to Dashboard">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>

        <h1 class="text-lg font-semibold text-white text-shadow">Scan Barcode</h1>

        <div class="w-12 h-12"></div>
      </div>
    </div>

    <!-- Barcode Scanner Component -->
    <component :is="currentScannerComponent" @scan-result="handleScanResult" @error="handleScanError"
      @manual-input="handleManualInput" :formats="supportedFormats" :frequency="10" :debug="false" :locate="true"
      :scan-speed="'slow'" :show-speed-controls="true" />

    <!-- Manual Input Modal -->
    <!-- Manual Input Modal -->
    <div v-if="showManualInput"
      class="manual-input-modal fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm safe-area-padding"
      @click.self="closeManualInput">
      <div
        class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 mx-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-charcoal-900">
            Barcode Manual Search
          </h3>
          <button @click="closeManualInput" class="p-2 hover:bg-charcoal-50 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-charcoal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Instructions -->

        <!-- Input Section -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-charcoal-700 mb-2">
              Enter Barcode
            </label>
            <input v-model="manualCode" type="text" placeholder="Enter or paste barcode here..."
              class="w-full px-4 py-3 border-2 border-charcoal-200 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500 transition-all duration-200 text-base"
              @keyup.enter="processManualCode" @input="manualCode = $event.target.value.trim()" ref="manualInput" />
            <!-- Character counter -->
            <div class="mt-2 text-xs text-charcoal-500" v-if="manualCode">
              {{ manualCode.length }} characters
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
            <button @click="processManualCode" :disabled="!manualCode.trim() || processingManual"
              class="flex-1 px-6 py-3 bg-charcoal-600 text-white rounded-xl hover:bg-charcoal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg">
              <span v-if="!processingManual">🔍 Find Gift</span>
              <span v-else>⏳ Searching...</span>
            </button>
            <button @click="closeManualInput"
              class="flex-1 px-6 py-3 bg-charcoal-50 text-charcoal-700 rounded-xl hover:bg-charcoal-100 transition-all duration-200 font-medium">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Error State Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/90">
      <div class="bg-white rounded-xl p-6 w-full max-w-md text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-charcoal-900 mb-2">
          Scanner Error
        </h3>
        <p class="text-charcoal-600 mb-4">
          {{ errorMessage }}
        </p>
        <div class="flex space-x-3">
          <button @click="retryScanner"
            class="flex-1 px-4 py-2 bg-charcoal-600 text-white rounded-lg hover:bg-charcoal-700 transition-colors">
            Try Again
          </button>
          <button @click="$router.push({ name: 'Dashboard' })"
            class="flex-1 px-4 py-2 bg-charcoal-50 text-charcoal-700 rounded-lg hover:bg-charcoal-100 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Gift Error Modal -->
    <div v-if="showGiftErrorModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-charcoal-900/90">
      <div class="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-2xl">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-charcoal-900 mb-3">
          {{ giftErrorTitle }}
        </h3>
        <p class="text-charcoal-600 mb-6 leading-relaxed">
          {{ giftErrorMessage }}
        </p>
        <div v-if="scannedCode" class="bg-charcoal-50 p-3 rounded-lg mb-6">
          <p class="text-sm text-charcoal-500 mb-1">Scanned Code:</p>
          <p class="font-mono text-sm text-charcoal-800 break-all">{{ scannedCode }}</p>
        </div>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button @click="closeGiftErrorModal"
            class="flex-1 px-6 py-3 bg-charcoal-600 text-white rounded-lg hover:bg-charcoal-700 transition-colors font-medium">
            Continue Scanning
          </button>
          <button @click="$router.push({ name: 'Dashboard' })"
            class="flex-1 px-6 py-3 bg-charcoal-50 text-charcoal-700 rounded-lg hover:bg-charcoal-100 transition-colors font-medium">
            Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'
import { useScannerAudio } from '@/composables/useScannerAudio'
import { useScannerHaptic } from '@/composables/useScannerHaptic'
import BarcodeScanner from '@/components/scanner/BarcodeScanner.vue'
import ZXingBarcodeScanner from '@/components/scanner/ZXingBarcodeScanner.vue'

// Icons
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Scanner',
  components: {
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    BarcodeScanner,
    ZXingBarcodeScanner
  },
  setup() {
    const router = useRouter()
    const { showNotification } = useNotifications()

    // Audio and haptic feedback
    const scannerAudio = useScannerAudio()
    const scannerHaptic = useScannerHaptic()

    // State
    const showManualInput = ref(false)
    const manualCode = ref('')
    const manualInput = ref(null)
    const showErrorModal = ref(false)
    const errorMessage = ref('')
    const processingManual = ref(false)
    const scannerErrorCount = ref(0)
    const useZXingScanner = ref(false)

    // Custom Gift Error Modal State
    const showGiftErrorModal = ref(false)
    const giftErrorTitle = ref('')
    const giftErrorMessage = ref('')
    const scannedCode = ref('')

    // Mobile device detection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches

    // Scanner component selection
    const currentScannerComponent = computed(() => {
      return useZXingScanner.value ? 'ZXingBarcodeScanner' : 'BarcodeScanner'
    })

    // Prevent body scrolling when scanner is active
    onMounted(async () => {
      // Store original overflow values
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow

      // Prevent scrolling
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.classList.add('scanner-active')

      // Store for cleanup
      document.body.dataset.originalOverflow = originalBodyOverflow
      document.documentElement.dataset.originalOverflow = originalHtmlOverflow

      // Initialize audio and haptic feedback after a brief delay
      setTimeout(async () => {
        try {
          await scannerAudio.initialize()
          console.log('Scanner view: Audio initialized')
        } catch (error) {
          console.warn('Scanner view: Audio initialization failed:', error)
        }
      }, 1000)
    })

    onUnmounted(() => {
      // Restore original overflow values
      const originalBodyOverflow = document.body.dataset.originalOverflow || ''
      const originalHtmlOverflow = document.documentElement.dataset.originalOverflow || ''

      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.classList.remove('scanner-active')

      // Clean up dataset
      delete document.body.dataset.originalOverflow
      delete document.documentElement.dataset.originalOverflow
    })

    // Supported barcode formats (optimized for gift codes)
    const supportedFormats = [
      'code_128_reader',  // Most common for modern barcodes
      'ean_reader',       // EAN-13
      'ean_8_reader',     // EAN-8
      'code_39_reader',   // Common legacy format
      'code_93_reader',   // More compact than Code 39
      'upc_reader',       // UPC-A
      'upc_e_reader',     // UPC-E
      'codabar_reader'    // Used in some industries
    ]

    // Handle scan result
    const handleScanResult = async (result) => {
      try {
        const { code, format } = result

        console.log('Barcode scanned:', { code, format })

        // Show success notification with enhanced feedback
        showNotification(`${format.replace('_reader', '').toUpperCase()} scanned: ${code}`, 'success')

        // Additional audio feedback at scanner level
        scannerAudio.playSuccessSound()
        scannerHaptic.vibrateSuccess()

        // Process the scanned code
        await processScannedCode(code)

      } catch (error) {
        console.error('Error handling scan result:', error)
        showNotification('Error processing scanned code', 'error')
        scannerAudio.playErrorSound()
        scannerHaptic.vibrateError()
      }
    }

    // Handle scanner errors
    const handleScanError = (error) => {
      console.error('Scanner error:', error)
      scannerErrorCount.value++

      let message = 'Scanner error occurred'

      if (error.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access and try again.'
      } else if (error.name === 'NotFoundError') {
        message = 'No camera found. Please ensure your device has a camera.'
      } else if (error.name === 'NotReadableError') {
        message = 'Camera is being used by another application.'
      } else if (error.message?.includes('HTTPS')) {
        message = error.message
      } else if (error.message) {
        message = error.message
      }

      errorMessage.value = message
      showErrorModal.value = true

      // Play error feedback
      scannerAudio.playErrorSound()
      scannerHaptic.vibrateError()

      // Try fallback to ZXing scanner on mobile after multiple QuaggaJS failures
      if (isMobileDevice && scannerErrorCount.value >= 2 && !useZXingScanner.value) {
        // console.log('Switching to ZXing scanner due to repeated failures')
        useZXingScanner.value = true
        scannerErrorCount.value = 0
        showNotification('Switching to alternative scanner...', 'info')
      }
    }

    // Process scanned or manual code
    const processScannedCode = async (code) => {
      try {
        // Try to parse as URL first
        let giftCode = code

        try {
          const url = new URL(code)
          // Extract gift code from URL parameters
          giftCode = url.searchParams.get('code') || url.searchParams.get('gift') || code
        } catch {
          // Not a URL, treat as direct gift code
          giftCode = code
        }

        // Validate gift code format (basic validation)
        if (!giftCode || giftCode.trim().length === 0) {
          throw new Error('Invalid code format: Code is empty')
        }

        // Show success message for barcode detection
        showNotification(`Barcode successfully scanned: ${giftCode}`, 'success')

        try {
          // Import GiftAPI for validation
          const { GiftAPI } = await import('../services/api')

          // API call to get gift details
          const giftResult = await GiftAPI.getByCode(giftCode.trim())

          if (!giftResult.success) {
            // Show custom error modal for gift not found
            const errorMessage = giftResult.error || 'Not found in gift system'
            showCustomGiftError(
              'Gift Not Found',
              errorMessage,
              giftCode
            )
            return
          }

          const gift = giftResult.data

          // Check gift status and redirect accordingly
          if (gift.status === 'Issued') {
            // Gift already issued - show issued info and redirect to view
            const issuedTo = `${gift.owner_full_name || ''} ${gift.owner_full_name || ''}`.trim()
            const issuedDate = gift.issued_date || 'unknown date'
            const message = issuedTo
              ? `Already issued to ${issuedTo} on ${issuedDate}`
              : `Already issued on ${issuedDate}`

            showNotification(`Gift: ${gift.gift_name} - ${message}`, 'info')

            // Redirect to gift details page to show issued status
            router.push(`/scan/gift/${gift.name}`)

          } else if (gift.status === 'Available' || gift.status === 'Active') {
            // Gift available - redirect to dispatch flow
            showNotification(`Gift found: ${gift.gift_name}`, 'success')
            router.push(`/scan/gift/${gift.name}`)

          } else {
            // Other status - show info
            showNotification(`Gift: ${gift.gift_name} - Status: ${gift.status}`, 'warning')
            router.push(`/scan/gift/${gift.name}`)
          }

        } catch (apiError) {
          console.error('API error:', apiError)
          showCustomGiftError(
            'API Error',
            'Unable to verify gift due to a server error. Please try again.',
            giftCode
          )
        }

      } catch (error) {
        console.error('Code processing error:', error)

        const errorMsg = error.message || 'Gift not found'
        showCustomGiftError(
          'Processing Error',
          errorMsg,
          giftCode
        )
      }
    }

    // Manual input handlers
    const processManualCode = async () => {
      if (!manualCode.value.trim()) {
        showCustomGiftError(
          'Invalid Input',
          'Please enter a valid code before searching.',
          ''
        )
        return
      }

      processingManual.value = true

      try {
        await processScannedCode(manualCode.value.trim())
        closeManualInput()
      } catch (error) {
        console.error('Manual code processing error:', error)
      } finally {
        processingManual.value = false
      }
    }

    const closeManualInput = () => {
      showManualInput.value = false
      manualCode.value = ''
      processingManual.value = false
    }

    const handleManualInput = () => {
      // console.log('handleManualInput called in Scanner.vue') // Debug log
      // console.log('showManualInput before:', showManualInput.value) // Debug log

      // Resume audio context on user interaction
      scannerAudio.resumeAudioContext()

      // Provide haptic feedback for manual input
      scannerHaptic.vibrateLongPress()

      showManualInput.value = true
      // console.log('showManualInput after:', showManualInput.value) // Debug log
    }

    const pasteFromClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText()
          if (text.trim()) {
            manualCode.value = text.trim()
            showNotification('Code pasted from clipboard', 'success')
          }
        } else {
          showNotification('Clipboard access not available', 'warning')
        }
      } catch (error) {
        console.warn('Could not read from clipboard:', error)
        showNotification('Could not access clipboard', 'warning')
      }
    }

    const clearManualCode = () => {
      manualCode.value = ''
      if (manualInput.value) {
        manualInput.value.focus()
      }
    }

    // Error modal handlers
    const retryScanner = () => {
      showErrorModal.value = false
      errorMessage.value = ''
      // The scanner component will automatically retry
    }

    // Custom Gift Error Modal handlers
    const showCustomGiftError = (title, message, code = '') => {
      giftErrorTitle.value = title
      giftErrorMessage.value = message
      scannedCode.value = code
      showGiftErrorModal.value = true

      // Play error feedback
      scannerAudio.playErrorSound()
      scannerHaptic.vibrateError()
    }

    const closeGiftErrorModal = () => {
      showGiftErrorModal.value = false
      giftErrorTitle.value = ''
      giftErrorMessage.value = ''
      scannedCode.value = ''
    }

    // Watch for manual input modal opening
    const watchManualInput = async () => {
      if (showManualInput.value) {
        await nextTick()
        if (manualInput.value) {
          manualInput.value.focus()
        }
      }
    }

    return {
      // State
      showManualInput,
      manualCode,
      manualInput,
      showErrorModal,
      errorMessage,
      processingManual,
      supportedFormats,
      currentScannerComponent,
      useZXingScanner,
      scannerErrorCount,

      // Custom Gift Error Modal State
      showGiftErrorModal,
      giftErrorTitle,
      giftErrorMessage,
      scannedCode,

      // Methods
      handleScanResult,
      handleScanError,
      processManualCode,
      closeManualInput,
      handleManualInput,
      pasteFromClipboard,
      clearManualCode,
      retryScanner,
      watchManualInput,
      showCustomGiftError,
      closeGiftErrorModal
    }
  }
}
</script>

<style scoped>
/* Scanner page fills entire viewport */
.scanner-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: black;
  overflow: hidden;
  z-index: 9999;
}

/* Ensure header is always visible */
.scanner-page>.absolute:first-child {
  z-index: 99999 !important;
  pointer-events: none;
}

.scanner-page>.absolute:first-child>div {
  pointer-events: auto;
}

/* Back button styling for better visibility */
.scanner-page button[title="Back to Dashboard"] {
  background: rgba(0, 0, 0, 0.7) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(8px) !important;
  min-width: 48px !important;
  min-height: 48px !important;
}

.scanner-page button[title="Back to Dashboard"]:hover {
  background: rgba(0, 0, 0, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: scale(1.05);
}

/* Text shadow for better readability */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* Scanner component fills page */
.scanner-component {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Additional styles to prevent horizontal scroll */
.scanner-page * {
  box-sizing: border-box;
}

/* Ensure no elements extend beyond viewport */
.scanner-page .absolute,
.scanner-page .fixed {
  max-width: 100%;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* PWA specific modal styling */
@media (display-mode: standalone) {
  .fixed[class*="z-"]:last-child {
    z-index: 10000 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
}

/* Mobile specific modal improvements */
@media (max-width: 640px) {
  .fixed[class*="z-"]:last-child {
    z-index: 10000 !important;
  }
}

/* Manual input modal specific styling */
.manual-input-modal {
  z-index: 10000 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(55, 65, 81, 0.8) !important;
  backdrop-filter: blur(4px) !important;
}

/* PWA specific overrides */
@media (display-mode: standalone) {
  .manual-input-modal {
    z-index: 10000 !important;
    background: rgba(55, 65, 81, 0.9) !important;
  }
}

/* Ensure manual input modal content is visible */
.manual-input-modal>div {
  z-index: 10001 !important;
  background: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

/* Focus styles for better accessibility */
button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-white\/10 {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-colors {
    transition: none;
  }
}

/* Safe area support for mobile devices */
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

.safe-area-padding {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Mobile specific adjustments */
@media (max-width: 640px) {
  .safe-area-top {
    padding-top: max(0.5rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}

/* Landscape mobile adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .safe-area-top {
    padding-top: max(0.25rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}

/* PWA specific adjustments */
@media (display-mode: standalone) {
  .safe-area-top {
    padding-top: max(1.5rem, env(safe-area-inset-top));
  }
}
</style>
