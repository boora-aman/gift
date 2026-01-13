<template>
  <div class="scanner-modal-overlay">
    <div class="scanner-modal-container">
      <!-- Header -->
      <div class="scanner-header">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h2 class="text-lg font-semibold">Scan Barcode</h2>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Close button -->
          <button
            @click="closeScanner"
            class="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Scanner Area -->
      <div class="scanner-area">
        <BarcodeScanner
          @scan-result="handleScanResult"
          @error="handleScanError"
          @manual-input="handleManualInput"
          :formats="supportedFormats"
          :frequency="20"
          :debug="false"
          :locate="true"
        />
      </div>
      
            <!-- Manual Input Section -->
      <div 
        v-if="showManualInput"
        class="manual-input-section"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-charcoal-900">Enter Barcode</h3>
          <button
            @click="showManualInput = false"
            class="p-1 hover:bg-charcoal-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-charcoal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Simple Input Form -->
        <div class="space-y-4">
          <div>
            <label for="barcode-input" class="block text-sm font-medium text-charcoal-700 mb-2">
              Barcode
            </label>
            <input
              id="barcode-input"
              v-model="manualCode"
              type="text"
              placeholder="Enter barcode..."
              class="input"
              @keyup.enter="handleManualCode"
              @input="manualCode = $event.target.value.trim()"
              ref="manualInput"
            />
          </div>
          
          <button
            @click="handleManualCode"
            :disabled="!manualCode.trim() || processingManual"
            class="btn btn-primary w-full"
          >
            <span v-if="!processingManual">Search</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/app'
import { GiftAPI } from '../../services/api'
import BarcodeScanner from './BarcodeScanner.vue'

// Import Heroicons
import {
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ScannerModal',
  components: {
    XMarkIcon,
    BarcodeScanner
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()
    const appStore = useAppStore()
    
    // Reactive state
    const manualCode = ref('')
    const showManualInput = ref(false)
    const manualInput = ref(null)
    const processingManual = ref(false)
    
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
    
    // Handle scan result from BarcodeScanner component
    const handleScanResult = async (result) => {
      try {
        const { code, format } = result
        
        console.log('Barcode scanned:', { code, format })
        
        // Process the scanned code
        await processDetectedCode(code)
        
      } catch (error) {
        console.error('Error handling scan result:', error)
      }
    }
    
    // Handle scanner errors
    const handleScanError = (error) => {
      console.error('Scanner error:', error)
      // Errors are already handled by the BarcodeScanner component
      // We can optionally show additional error handling here
    }
    
    // Process detected barcode
    const processDetectedCode = async (codeData) => {
      try {
        // Try to parse as URL first
        let giftCode = codeData
        
        try {
          const url = new URL(codeData)
          // Extract gift code from URL parameters
          giftCode = url.searchParams.get('code') || url.searchParams.get('gift') || codeData
        } catch {
          // Not a URL, treat as direct gift code
          giftCode = codeData
        }
        
        // Validate gift code format
        if (!giftCode || giftCode.trim().length === 0) {
          throw new Error('Invalid barcode format: Code is empty')
        }
        
        // API call to get gift details
        const result = await GiftAPI.getByCode(giftCode.trim())
        
        if (result.success && result.data) {
          const gift = result.data
          
          // Navigate to gift details and close modal
          setTimeout(() => {
            router.push(`/scan/gift/${gift.name}`)
            closeScanner()
          }, 500)
          
        } else {
          throw new Error(result.error || 'No gift found with this code')
        }
        
      } catch (error) {
        console.error('Barcode processing error:', error)
        // Show manual input as fallback
        showManualInput.value = true
        await nextTick()
        if (manualInput.value) {
          manualInput.value.focus()
        }
      }
    }
    
    const handleManualCode = async () => {
      const code = manualCode.value.trim()
      if (!code) return
      
      processingManual.value = true

      try {
        const result = await GiftAPI.getByCode(code)

        if (result.success && result.data) {
          const gift = result.data

          setTimeout(() => {
            router.push(`/scan/gift/${gift.name}`)
            closeScanner()
          }, 500)

        } else {
          console.error('Gift lookup error:', result.error || 'No gift found')
          // Keep the manual input open for retry
        }

      } catch (error) {
        console.error('Gift lookup error:', error)
        // Keep the manual input open for retry
      } finally {
        processingManual.value = false
      }
    }
    
    const closeScanner = () => {
      // Restore body scrolling before closing
      document.body.classList.remove('modal-open')
      document.documentElement.style.overflow = ''
      emit('close')
    }
    
    const handleManualInput = () => {
      console.log('ScannerModal handleManualInput called') // Debug log
      showManualInput.value = true
    }
    
    // Lifecycle
    onMounted(() => {
      // Prevent body scrolling when modal opens
      document.body.classList.add('modal-open')
      document.documentElement.style.overflow = 'hidden'
    })
    
    onUnmounted(() => {
      // Restore body scrolling when modal closes
      document.body.classList.remove('modal-open')
      document.documentElement.style.overflow = ''
    })
    
    return {
      manualCode,
      showManualInput,
      manualInput,
      processingManual,
      supportedFormats,
      handleScanResult,
      handleScanError,
      handleManualCode,
      handleManualInput,
      closeScanner
    }
  }
}
</script>

<style scoped>
/* Scanner Modal Overlay - No scrollbars */
.scanner-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  overflow: hidden !important; /* Prevent scrollbars */
}

/* Scanner Modal Container - Fit to screen */
.scanner-modal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden !important; /* Prevent scrollbars */
}

/* Header */
.scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: black;
  color: white;
  flex-shrink: 0; /* Don't shrink */
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-top: max(1rem, env(safe-area-inset-top));
}

/* Scanner Area - Takes remaining space */
.scanner-area {
  flex: 1;
  position: relative;
  overflow: hidden !important;
  min-height: 0; /* Important for flex child */
  width: 100%;
  height: 100%;
}

/* Manual Input Section */
.manual-input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1.5rem;
  border-top: 4px solid #3b82f6;
  max-height: 40vh; /* Limit height to prevent overflow */
  overflow-y: auto; /* Allow scrolling only within this section if needed */
  padding-left: max(1.5rem, env(safe-area-inset-left));
  padding-right: max(1.5rem, env(safe-area-inset-right));
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  z-index: 10001;
}

/* Ensure video covers the entire area */
:deep(video) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Global body scroll prevention */
body.modal-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .scanner-header {
    padding: 0.75rem;
    padding-top: max(0.75rem, env(safe-area-inset-top));
  }
  
  .manual-input-section {
    padding: 1rem;
    max-height: 60vh;
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}

/* Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .manual-input-section {
    max-height: 70vh;
  }
}
</style>
