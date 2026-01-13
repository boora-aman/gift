<template>
  <div class="fixed inset-0 z-50 bg-charcoal-900 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 bg-charcoal-900/80">
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>

      <h2 class="text-lg font-semibold text-white">Scan Emirates ID</h2>

      <button
        v-if="hasFlash"
        @click="toggleFlash"
        class="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <BoltIcon v-if="!flashOn" class="w-6 h-6" />
        <BoltSlashIcon v-else class="w-6 h-6" />
      </button>
      <div v-else class="w-10 h-10"></div>
    </div>

    <!-- Camera View -->
    <div class="flex-1 relative">
      <!-- Video Element -->
      <video
        ref="videoElement"
        class="w-full h-full object-cover"
        playsinline
        muted
        autoplay
      ></video>

      <!-- Canvas for processing (hidden) -->
      <canvas
        ref="canvasElement"
        class="hidden"
      ></canvas>

      <!-- Scanning Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <!-- ID Card Frame -->
        <div class="relative w-80 h-48 max-w-[90vw] max-h-[40vh] border-2 rounded-lg transition-colors duration-300"
             :class="documentDetected ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' : 'border-emerald-500'">
          <!-- Corner indicators -->
          <div class="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl transition-colors duration-300"
               :class="documentDetected ? 'border-emerald-300' : 'border-emerald-400'"></div>
          <div class="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr transition-colors duration-300"
               :class="documentDetected ? 'border-emerald-300' : 'border-emerald-400'"></div>
          <div class="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl transition-colors duration-300"
               :class="documentDetected ? 'border-emerald-300' : 'border-emerald-400'"></div>
          <div class="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br transition-colors duration-300"
               :class="documentDetected ? 'border-emerald-300' : 'border-emerald-400'"></div>

          <!-- Scanning line animation -->
          <div
            v-if="isScanning && documentDetected"
            class="absolute left-0 right-0 h-0.5 bg-emerald-400 opacity-80 animate-scan"
          ></div>

          <!-- Document detected indicator -->
          <div
            v-if="documentDetected"
            class="absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full"
          >
            Document detected
          </div>
        </div>
      </div>

      <!-- Dark overlay outside scanning area -->
      <div class="absolute inset-0 bg-charcoal-900/60 mask-id-scanner"></div>

      <!-- Error State -->
      <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center bg-charcoal-900/90"
      >
        <div class="bg-white rounded-xl p-6 mx-4 text-center max-w-md">
          <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-charcoal-900 mb-2">
            Camera Error
          </h3>
          <p class="text-charcoal-600 mb-4">
            {{ error }}
          </p>
          <div class="flex space-x-3">
            <button
              @click="initializeCamera"
              class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Processing State -->
      <div
        v-if="processing"
        class="absolute inset-0 flex items-center justify-center bg-charcoal-900/90"
      >
        <div class="bg-white rounded-xl p-6 mx-4 text-center max-w-md">
          <ArrowPathIcon class="w-12 h-12 text-gray-700 mx-auto mb-4 animate-spin" />
          <h3 class="text-lg font-semibold text-charcoal-900 mb-2">
            Processing ID
          </h3>
          <p class="text-charcoal-600">
            Extracting information from Emirates ID...
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="p-6 bg-charcoal-900/80">
      <!-- Status -->
      <div class="text-center mb-4">
        <p v-if="!cameraReady" class="text-white/80 text-sm">
          Initializing camera...
        </p>
        <p v-else-if="!isScanning" class="text-white/80 text-sm">
          {{ documentDetected ? 'Document detected - ready to scan' : scanStatus }}
        </p>
        <p v-else class="text-emerald-400 text-sm font-medium">
          {{ documentDetected ? 'Scanning Emirates ID...' : 'Detecting document...' }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center space-x-6">
        <!-- Camera Switch -->
        <button
          v-if="hasMultipleCameras"
          @click="switchCamera"
          :disabled="!cameraReady"
          class="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon class="w-6 h-6" />
        </button>
        <div v-else class="w-12 h-12"></div>

        <!-- Scan Toggle -->
        <button
          @click="toggleScanning"
          :disabled="!cameraReady || processing"
          class="px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isScanning
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-600 text-white hover:bg-gray-700'"
        >
          {{ isScanning ? 'Stop Scan' : 'Start Scan' }}
        </button>

        <!-- Manual Input -->
        <button
          @click="showManualInput = true"
          :disabled="processing"
          class="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <PencilIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Help Text -->
      <div class="text-center mt-4">
        <p class="text-white/60 text-xs">
          Position the front of the Emirates ID within the frame. Scanning will start automatically when a document is detected.
        </p>
      </div>
    </div>

    <!-- Manual Input Modal -->
    <div
      v-if="showManualInput"
      class="absolute inset-0 z-10 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-charcoal-900 mb-4">
          Enter Details Manually
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-charcoal-700 mb-2">
              First Name
            </label>
            <input
              v-model="manualForm.first_name"
              type="text"
              placeholder="Enter first name..."
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-charcoal-700 mb-2">
              Last Name
            </label>
            <input
              v-model="manualForm.last_name"
              type="text"
              placeholder="Enter last name..."
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-charcoal-700 mb-2">
              Emirates ID
            </label>
            <input
              v-model="manualForm.emirates_id"
              type="text"
              placeholder="784-1234-1234567-1"
              class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div class="flex space-x-3 mt-6">
            <button
              @click="processManualInput"
              :disabled="!manualForm.first_name || !manualForm.last_name || !manualForm.emirates_id"
              class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Details
            </button>
            <button
              @click="showManualInput = false; clearManualForm()"
              class="flex-1 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Tesseract from 'tesseract.js'

// Icons
import {
  XMarkIcon,
  BoltIcon,
  BoltSlashIcon,
  ArrowPathIcon,
  PencilIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'EmiratesIdScanner',
  components: {
    XMarkIcon,
    BoltIcon,
    BoltSlashIcon,
    ArrowPathIcon,
    PencilIcon,
    ExclamationTriangleIcon
  },
  emits: ['close', 'data-extracted'],
  setup(props, { emit }) {
    // Refs
    const videoElement = ref(null)
    const canvasElement = ref(null)

    // State
    const cameraReady = ref(false)
    const isScanning = ref(false)
    const processing = ref(false)
    const documentDetected = ref(false)
    const hasMultipleCameras = ref(false)
    const hasFlash = ref(false)
    const flashOn = ref(false)
    const error = ref('')
    const scanStatus = ref('Position Emirates ID in frame')
    const showManualInput = ref(false)

    const manualForm = reactive({
      first_name: '',
      last_name: '',
      emirates_id: ''
    })

    // Camera stream and constraints
    let currentStream = null
    let scanInterval = null
    let availableCameras = []

    // Methods
    const initializeCamera = async () => {
      try {
        error.value = ''

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        availableCameras = devices.filter(device => device.kind === 'videoinput')
        hasMultipleCameras.value = availableCameras.length > 1

        // Request camera permissions (prefer back camera for document scanning)
        const constraints = {
          video: {
            facingMode: 'environment', // Use back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }

        currentStream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoElement.value) {
          videoElement.value.srcObject = currentStream

          // Wait for video to be ready
          await new Promise((resolve) => {
            videoElement.value.onloadedmetadata = resolve
          })

          // Check for flash capability
          const videoTrack = currentStream.getVideoTracks()[0]
          const capabilities = videoTrack.getCapabilities()
          hasFlash.value = !!capabilities.torch

          cameraReady.value = true

          // Auto-start scanning
          startScanning()
        }

      } catch (err) {
        console.error('Camera initialization error:', err)

        if (err.name === 'NotAllowedError') {
          error.value = 'Camera permission denied. Please allow camera access and try again.'
        } else if (err.name === 'NotFoundError') {
          error.value = 'No camera found. Please ensure your device has a camera.'
        } else if (err.name === 'NotReadableError') {
          error.value = 'Camera is being used by another application.'
        } else {
          error.value = 'Unable to access camera. Please check your device settings.'
        }

        cameraReady.value = false
      }
    }

    const switchCamera = async () => {
      if (!hasMultipleCameras.value) return

      // Stop current stream
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
      }

      cameraReady.value = false

      // Reinitialize with different camera
      await initializeCamera()
    }

    const toggleFlash = async () => {
      if (!hasFlash.value || !currentStream) return

      try {
        const videoTrack = currentStream.getVideoTracks()[0]
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashOn.value }]
        })
        flashOn.value = !flashOn.value
      } catch (err) {
        console.error('Flash toggle error:', err)
      }
    }

    const startScanning = () => {
      if (!cameraReady.value || isScanning.value || processing.value) return

      isScanning.value = true
      scanStatus.value = 'Scanning...'

      // Start scanning loop
      scanInterval = setInterval(() => {
        detectDocumentAndScan()
      }, 500) // Check every 500ms for better performance
    }

    const stopScanning = () => {
      isScanning.value = false
      scanStatus.value = 'Scanning paused'

      if (scanInterval) {
        clearInterval(scanInterval)
        scanInterval = null
      }
    }

    const toggleScanning = () => {
      if (isScanning.value) {
        stopScanning()
      } else {
        startScanning()
      }
    }

    const detectDocumentAndScan = async () => {
      if (!videoElement.value || !canvasElement.value || !isScanning.value || processing.value) return

      try {
        const video = videoElement.value
        const canvas = canvasElement.value
        const context = canvas.getContext('2d')

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Check if there's a document-like rectangular shape in the frame
        const hasDocument = await hasDocumentInFrame(canvas)
        documentDetected.value = hasDocument

        // Only process OCR if document is detected and we're not already processing
        if (hasDocument && !processing.value) {
          // Wait a bit to ensure document is stable
          setTimeout(async () => {
            if (documentDetected.value && !processing.value) {
              const imageData = canvas.toDataURL('image/jpeg', 0.9)
              await processOCR(imageData)
            }
          }, 1000) // 1 second delay to ensure document is stable
        }

      } catch (err) {
        console.error('Emirates ID detection error:', err)
        documentDetected.value = false
      }
    }

    const scanEmiratesId = async () => {
      if (!videoElement.value || !canvasElement.value || !isScanning.value || processing.value) return

      try {
        const video = videoElement.value
        const canvas = canvasElement.value
        const context = canvas.getContext('2d')

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Check if there's a document-like rectangular shape in the frame
        if (await hasDocumentInFrame(canvas)) {
          // Convert canvas to image data for OCR
          const imageData = canvas.toDataURL('image/jpeg', 0.9)

          // Process with OCR
          await processOCR(imageData)
        }

      } catch (err) {
        console.error('Emirates ID scanning error:', err)
      }
    }

    const hasDocumentInFrame = async (canvas) => {
      try {
        const context = canvas.getContext('2d')
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        // Simple edge detection to check if there's a rectangular document
        // This is a basic implementation - you could use more sophisticated algorithms
        const data = imageData.data
        let edgeCount = 0
        const threshold = 30 // Edge detection threshold

        // Sample a few rows and columns to detect edges
        for (let y = canvas.height * 0.3; y < canvas.height * 0.7; y += 10) {
          for (let x = canvas.width * 0.2; x < canvas.width * 0.8; x += 10) {
            const index = (y * canvas.width + x) * 4
            const currentPixel = data[index] // Red channel

            // Check right neighbor
            if (x < canvas.width - 1) {
              const rightIndex = (y * canvas.width + (x + 1)) * 4
              const rightPixel = data[rightIndex]
              if (Math.abs(currentPixel - rightPixel) > threshold) {
                edgeCount++
              }
            }

            // Check bottom neighbor
            if (y < canvas.height - 1) {
              const bottomIndex = ((y + 1) * canvas.width + x) * 4
              const bottomPixel = data[bottomIndex]
              if (Math.abs(currentPixel - bottomPixel) > threshold) {
                edgeCount++
              }
            }
          }
        }

        // If we detect enough edges, assume there's a document
        // This is a heuristic - adjust the threshold based on testing
        return edgeCount > 50

      } catch (err) {
        console.error('Document detection error:', err)
        return false
      }
    }

    const preprocessImage = (imageData) => {
      // Create a canvas for image processing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Create an image from the data
      const img = new Image()
      img.src = imageData

      // Set canvas dimensions
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Get image data for processing
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      // Apply contrast and brightness adjustments
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast and brightness for better OCR
        const contrast = 1.5
        const brightness = 20

        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness))     // Red
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness)) // Green
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness)) // Blue
      }

      // Put the processed image data back
      ctx.putImageData(imageDataObj, 0, 0)

      // Return the processed image as data URL
      return canvas.toDataURL('image/png')
    }

    const processOCR = async (imageData) => {
      try {
        processing.value = true
        stopScanning()

        // Preprocess the image for better OCR
        const preprocessedImage = preprocessImage(imageData)

        // Use Tesseract.js for OCR with improved settings
        const { data: { text } } = await Tesseract.recognize(
          preprocessedImage,
          'eng+ara', // Support both English and Arabic
          {
            logger: m => console.log(m), // Log progress
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ',
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: '6' // Uniform block of text
          }
        )

        // console.log('Full OCR Text:', text)

        // Extract Emirates ID data from OCR text
        const extractedData = extractEmiratesIdData(text)

        // console.log('Extracted Data:', extractedData)

        if (extractedData && (extractedData.first_name || extractedData.last_name || extractedData.emirates_id)) {
          // Show success message with extracted data
          scanStatus.value = `Extracted: ${extractedData.first_name ? extractedData.first_name + ' ' : ''}${extractedData.last_name ? extractedData.last_name + ' ' : ''}${extractedData.emirates_id ? '(ID: ' + extractedData.emirates_id + ')' : ''}`

          // Emit the extracted data
          emit('data-extracted', extractedData)
        } else {
          scanStatus.value = 'No valid data found, retrying...'
          // No valid data found, resume scanning
          setTimeout(() => {
            if (cameraReady.value) {
              startScanning()
            }
          }, 1000)
        }

      } catch (err) {
        console.error('OCR processing error:', err)
        scanStatus.value = 'OCR processing failed, retrying...'

        // Resume scanning after error
        setTimeout(() => {
          if (cameraReady.value) {
            startScanning()
          }
        }, 1000)
      } finally {
        processing.value = false
      }
    }

    const extractEmiratesIdData = (ocrText) => {
      // Clean up the OCR text
      const text = ocrText.replace(/\s+/g, ' ').trim()

      const extractedData = {
        first_name: '',
        last_name: '',
        emirates_id: ''
      }

      // Pattern to match Emirates ID number (784-XXXX-XXXXXXX-X)
      const emiratesIdPattern = /784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d{1}/g
      const emiratesIdMatch = text.match(emiratesIdPattern)

      if (emiratesIdMatch) {
        // Clean up the Emirates ID (remove extra spaces/characters)
        extractedData.emirates_id = emiratesIdMatch[0].replace(/\s/g, '').replace(/[^\d-]/g, '')

        // Ensure proper format
        if (extractedData.emirates_id.length >= 15) {
          const digits = extractedData.emirates_id.replace(/-/g, '')
          if (digits.length === 15) {
            extractedData.emirates_id = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`
          }
        }
      }

      // Try to extract names - Emirates ID has specific patterns
      // Split text into lines and clean them
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

      // Log the OCR text for debugging
    //   console.log('OCR Text Lines:', lines)

      // Emirates ID typically has names in specific positions
      // Look for English names (usually after Arabic text)
      let nameFound = false

      for (let i = 0; i < lines.length && !nameFound; i++) {
        const line = lines[i]

        // Skip lines that are clearly not names
        if (/^\d+$/.test(line) ||
            /emirates|identity|card|authority|uae|الإمارات|هوية|nationality|جنسية|sex|جنس|date|تاريخ|birth|ميلاد/i.test(line) ||
            line.length < 2) {
          continue
        }

        // Look for lines with English alphabetic characters only (names are usually in English)
        if (/^[A-Z\s]+$/i.test(line) && line.length > 2) {
          const words = line.split(/\s+/).filter(word => word.length > 1)

          // If we have at least 2 words, treat as first name and last name
          if (words.length >= 2) {
            extractedData.first_name = words[0]
            extractedData.last_name = words.slice(1).join(' ')
            nameFound = true
            // console.log('Name extracted:', extractedData.first_name, extractedData.last_name)
            break
          }
          // If single word and looks like a name, treat as first name
          else if (words.length === 1 && words[0].length > 2) {
            extractedData.first_name = words[0]
            nameFound = true
            // console.log('Single name extracted:', extractedData.first_name)
          }
        }
      }

      // Alternative approach: Look for common name patterns
      if (!nameFound) {
        // Look for patterns like "Name: JOHN DOE" or "الاسم: JOHN DOE"
        const namePattern = /(name|اسم|الاسم)\s*[:]\s*([A-Z\s]+)/i
        const nameMatch = text.match(namePattern)

        if (nameMatch && nameMatch[2]) {
          const words = nameMatch[2].trim().split(/\s+/).filter(word => word.length > 1)
          if (words.length >= 2) {
            extractedData.first_name = words[0]
            extractedData.last_name = words.slice(1).join(' ')
            nameFound = true
            // console.log('Name extracted from pattern:', extractedData.first_name, extractedData.last_name)
          }
        }
      }

      // If still no names found, try to find any line with proper case names
      if (!nameFound) {
        for (const line of lines) {
          // Look for title case names (First Letter Capital)
          if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)) {
            const words = line.split(/\s+/)
            extractedData.first_name = words[0]
            extractedData.last_name = words.slice(1).join(' ')
            nameFound = true
            // console.log('Title case name extracted:', extractedData.first_name, extractedData.last_name)
            break
          }
        }
      }

      return extractedData
    }

    const processManualInput = () => {
      emit('data-extracted', { ...manualForm })
      showManualInput.value = false
      clearManualForm()
    }

    const clearManualForm = () => {
      manualForm.first_name = ''
      manualForm.last_name = ''
      manualForm.emirates_id = ''
    }

    const cleanup = () => {
      // Stop scanning
      stopScanning()

      // Stop camera stream
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
        currentStream = null
      }

      cameraReady.value = false
    }

    // Lifecycle
    onMounted(() => {
      // Check for camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        error.value = 'Camera not supported on this device'
        return
      }

      initializeCamera()
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      videoElement,
      canvasElement,
      cameraReady,
      isScanning,
      processing,
      documentDetected,
      hasMultipleCameras,
      hasFlash,
      flashOn,
      error,
      scanStatus,
      showManualInput,
      manualForm,
      initializeCamera,
      switchCamera,
      toggleFlash,
      toggleScanning,
      processManualInput,
      clearManualForm
    }
  }
}
</script>

<style scoped>
/* Scanning animation */
@keyframes scan {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    top: 100%;
    opacity: 1;
  }
}

.animate-scan {
  animation: scan 3s ease-in-out infinite;
}

/* Mask for ID card scanning overlay */
.mask-id-scanner {
  mask:
    radial-gradient(ellipse 160px 96px at center, transparent 96px, black 100px),
    linear-gradient(black, black);
  mask-composite: subtract;
  -webkit-mask:
    radial-gradient(ellipse 160px 96px at center, transparent 96px, black 100px),
    linear-gradient(black, black);
  -webkit-mask-composite: xor;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus styles for better accessibility */
button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Disable user selection */
video {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .mask-id-scanner {
    mask:
      radial-gradient(ellipse 120px 72px at center, transparent 72px, black 76px),
      linear-gradient(black, black);
    mask-composite: subtract;
    -webkit-mask:
      radial-gradient(ellipse 120px 72px at center, transparent 72px, black 76px),
      linear-gradient(black, black);
    -webkit-mask-composite: xor;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-white\/10 {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .border-emerald-500 {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-scan, .animate-spin {
    animation: none;
  }

  .transition-colors {
    transition: none;
  }
}
</style>
