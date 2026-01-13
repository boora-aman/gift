<template>
  <div class="scanner-main-container">
    <!-- Loading State -->
    <div
      v-if="state.isInitializing"
      class="absolute inset-0 bg-black flex items-center justify-center z-20"
    >
      <div class="text-center text-white px-4">
        <div class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Initializing camera...</p>
        <p v-if="isMobileDevice" class="text-xs text-gray-300 mt-2">
          ZXing scanner - optimized for mobile devices
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="state.hasError"
      class="absolute inset-0 bg-black flex items-center justify-center z-20"
    >
      <div class="text-center text-white p-4 max-w-sm mx-auto">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 class="text-lg font-semibold mb-2">Scanner Error</h3>
        <p class="text-sm text-gray-300 mb-4">{{ state.errorMessage }}</p>

        <div class="space-y-2">
          <button
            @click="retryInitialization"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            @click="handleManualInput"
            class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Enter Manually
          </button>
        </div>
      </div>
    </div>

    <!-- Main Scanner UI -->
    <div
      v-if="!state.isInitializing && !state.hasError"
      class="relative w-full h-full scanner-container"
      :class="{ 'front-camera': state.isFrontCamera }"
      ref="scannerContainer"
    >
      <!-- Video Element -->
      <video
        ref="videoElement"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      ></video>

      <!-- Canvas for drawing detection -->
      <canvas
        ref="canvasElement"
        class="absolute inset-0 w-full h-full pointer-events-none"
        :style="{ zIndex: 10 }"
      ></canvas>

      <!-- Top Controls -->
      <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto z-30">
        <div class="flex items-center justify-between p-4 safe-area-top">
          <div class="flex items-center space-x-2">
            <button
              v-if="state.hasMultipleCameras"
              @click="switchCamera"
              class="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <button
              v-if="state.hasTorch"
              @click="toggleTorch"
              class="p-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
              :class="{ 'bg-yellow-500/40': state.torchOn }"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Center Scanning Frame -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div
          class="relative w-80 h-52 sm:w-96 sm:h-60 md:w-[28rem] md:h-72 lg:w-[32rem] lg:h-80"
          @click="handleTapToFocus"
          :class="{ 'cursor-pointer': isMobileDevice && state.isScanning }"
        >
          <!-- Corner brackets -->
          <div class="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
          <div class="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
          <div class="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
          <div class="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>

          <!-- Scanning line animation -->
          <div
            v-if="state.isScanning"
            class="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
            :style="{ top: scanLinePosition + '%' }"
          ></div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="absolute bottom-20 left-0 right-0 text-center px-4 pointer-events-none z-20">
        <p class="text-white text-sm sm:text-base font-medium mb-2">
          {{ state.isScanning ? (isMobileDevice ? 'Hold barcode steady in the frame' : 'Position barcode within the frame') : 'Initializing scanner...' }}
        </p>
        <p class="text-white/70 text-xs sm:text-sm">
          ZXing Scanner - {{ isMobileDevice ? 'Mobile optimized' : 'Desktop mode' }}
        </p>
      </div>

      <!-- Bottom Controls -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto z-30">
        <div class="flex items-center justify-center px-4 pt-6 pb-safe-bottom">
          <button
            @click="handleManualInput"
            type="button"
            class="flex items-center space-x-3 px-8 py-4 bg-white/25 backdrop-blur-md text-white rounded-2xl hover:bg-white/35 active:bg-white/40 transition-all duration-200 border border-white/30 shadow-xl min-h-[56px] cursor-pointer touch-manipulation"
            style="margin-bottom: max(1rem, env(safe-area-inset-bottom)); position: relative; z-index: 100;"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="flex flex-col items-start">
              <span class="text-base font-semibold leading-tight">Enter Manually</span>
              <span class="text-xs text-white/80 leading-tight">Tap to type barcode</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { useScannerAudio } from '@/composables/useScannerAudio'
import { useScannerHaptic } from '@/composables/useScannerHaptic'

export default {
  name: 'ZXingBarcodeScanner',
  props: {
    formats: {
      type: Array,
      default: () => [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E
      ]
    }
  },
  emits: ['scan-result', 'error', 'manual-input'],
  setup(props, { emit }) {
    // Reactive state
    const state = reactive({
      isInitializing: false,
      isInitialized: false,
      isScanning: false,
      hasError: false,
      errorMessage: '',
      hasMultipleCameras: false,
      hasTorch: false,
      torchOn: false,
      isFrontCamera: false
    })

    // Audio and haptic feedback
    const scannerAudio = useScannerAudio()
    const scannerHaptic = useScannerHaptic()

    // Template refs
    const scannerContainer = ref(null)
    const videoElement = ref(null)
    const canvasElement = ref(null)

    // ZXing scanner instance
    let codeReader = null
    let currentStream = null
    let availableCameras = []
    let currentDeviceId = null
    let scanLinePosition = ref(10)
    
    // Enhanced detection tracking
    let lastDetectionTime = 0
    let lastSuccessfulCode = ''
    let detectionCount = 0

    // Mobile device detection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                          window.matchMedia('(max-width: 768px)').matches ||
                          window.matchMedia('(pointer: coarse)').matches ||
                          ('ontouchstart' in window)

    // Check if we're running in a secure context
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost'
    
    // Detection optimization settings
    const MIN_DETECTION_INTERVAL = 500 // Prevent duplicate detections
    const DUPLICATE_PREVENTION_TIME = 2000 // Prevent same code for 2 seconds

    // Scanning line animation
    const animateScanLine = () => {
      if (state.isScanning) {
        scanLinePosition.value = scanLinePosition.value >= 90 ? 10 : scanLinePosition.value + 2
        setTimeout(animateScanLine, 100)
      }
    }

    // Error handling
    const handleError = (error) => {
      console.error('ZXingBarcodeScanner error:', error)
    //   console.log('Browser info:', {
    //     userAgent: navigator.userAgent,
    //     mediaDevices: !!navigator.mediaDevices,
    //     getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    //     isHTTPS: location.protocol === 'https:',
    //     isPWA: window.matchMedia('(display-mode: standalone)').matches,
    //     isSecureContext: isSecureContext
    //   })

      state.hasError = true
      state.isInitialized = false
      state.isScanning = false

      let message = 'An error occurred with the scanner'

      if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
        message = 'Camera permission denied. Please allow camera access and try again.'
        if (isMobileDevice) {
          message += ' On mobile, you may need to refresh the page and grant permission again.'
        }
      } else if (error.name === 'NotFoundError' || error.message.includes('No device')) {
        message = 'No camera found on this device.'
      } else if (error.name === 'NotReadableError' || error.message.includes('in use')) {
        message = 'Camera is already in use by another application.'
        if (isMobileDevice) {
          message += ' Try closing other camera apps and refresh the page.'
        }
      } else if (error.message.includes('HTTPS')) {
        message = error.message
      } else if (error.message) {
        message = error.message
      }

      state.errorMessage = message
      emit('error', error)
    }

    // Enumerate available cameras
    const enumerateCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          return
        }

        const devices = await navigator.mediaDevices.enumerateDevices()
        availableCameras = devices.filter(device => device.kind === 'videoinput')
        state.hasMultipleCameras = availableCameras.length > 1

        // Prefer back camera for barcode scanning
        const backCamera = availableCameras.find(camera =>
          camera.label.toLowerCase().includes('back') ||
          camera.label.toLowerCase().includes('environment')
        )

        if (backCamera) {
          currentDeviceId = backCamera.deviceId
        } else if (availableCameras.length > 0) {
          currentDeviceId = availableCameras[0].deviceId
        }

      } catch (error) {
        console.warn('Could not enumerate cameras:', error)
      }
    }

    // Check torch support
    const checkTorchSupport = async () => {
      try {
        if (currentStream) {
          const videoTrack = currentStream.getVideoTracks()[0]
          if (videoTrack && videoTrack.getCapabilities) {
            const capabilities = videoTrack.getCapabilities()
            state.hasTorch = !!(capabilities && capabilities.torch)
          }
        }
      } catch (error) {
        console.warn('Could not check torch support:', error)
      }
    }

    // Initialize scanner
    const initializeScanner = async () => {
      if (state.isInitializing) return

      try {
        state.isInitializing = true
        state.hasError = false
        state.errorMessage = ''

        // Initialize audio and haptic feedback
        try {
          await scannerAudio.initialize()
          console.log('ZXing scanner audio initialized')
        } catch (error) {
          console.warn('ZXing audio initialization failed:', error)
        }

        // Check for camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device')
        }

        // Check for secure context on mobile PWA
        if (isMobileDevice && !isSecureContext) {
          throw new Error('Camera access requires HTTPS on mobile devices. Please access the site via HTTPS.')
        }

        // Enumerate cameras
        await enumerateCameras()

        // Wait for DOM
        await nextTick()

        if (!videoElement.value) {
          throw new Error('Video element not found')
        }

        // Initialize ZXing code reader with optimized settings
        const hints = new Map()
        hints.set('TRY_HARDER', true)
        hints.set('POSSIBLE_FORMATS', props.formats)
        
        codeReader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: isMobileDevice ? 100 : 300, // Faster scanning on mobile
          delayBetweenScanSuccess: isMobileDevice ? 1000 : 1500 // Shorter delay for next scan
        })

        // Start scanning
        await startScanning()

        // Mark as initialized
        state.isInitialized = true

        // Check for torch support
        setTimeout(() => {
          checkTorchSupport()
        }, 1000)

      } catch (error) {
        console.error('ZXing scanner initialization failed:', error)
        scannerAudio.playErrorSound()
        handleError(error)
      } finally {
        state.isInitializing = false
      }
    }

    // Start scanning
    const startScanning = async () => {
      if (state.isScanning || state.hasError || !codeReader) {
        return
      }

      try {
        const constraints = {
          video: {
            facingMode: state.isFrontCamera ? 'user' : 'environment',
            // Enhanced mobile constraints for better detection
            width: isMobileDevice ? { min: 480, ideal: 720, max: 1280 } : { min: 640, ideal: 1280 },
            height: isMobileDevice ? { min: 320, ideal: 480, max: 720 } : { min: 480, ideal: 720 },
            frameRate: isMobileDevice ? { min: 15, ideal: 30 } : { min: 15, ideal: 30 }
          }
        }

        if (currentDeviceId) {
          constraints.video.deviceId = { exact: currentDeviceId }
        }

        // Start decoding from video device with enhanced result handling
        await codeReader.decodeFromVideoDevice(
          currentDeviceId || undefined,
          videoElement.value,
          (result, error) => {
            if (result) {
              const currentTime = Date.now()
              const code = result.getText()
              const format = result.getBarcodeFormat()
              
              // Prevent duplicate detections of the same code
              if (lastSuccessfulCode === code && currentTime - lastDetectionTime < DUPLICATE_PREVENTION_TIME) {
                return
              }
              
              // Prevent too frequent detections
              if (currentTime - lastDetectionTime < MIN_DETECTION_INTERVAL) {
                return
              }
              
              console.log('ZXing barcode detected:', { text: code, format })

              // Play immediate detection feedback
              scannerAudio.playDetectionBeep()
              scannerHaptic.vibrateDetection()

              // Draw detection indicator
              drawDetection(result)

              // Play success feedback and emit result
              scannerAudio.playSuccessSound()
              scannerHaptic.vibrateSuccess()

              // Emit result
              emit('scan-result', {
                code,
                format,
                rawResult: result
              })
              
              lastDetectionTime = currentTime
              lastSuccessfulCode = code
              detectionCount++
              
              console.log('ZXing detection emitted:', { code, format, count: detectionCount })
            }

            if (error && error.name !== 'NotFoundException') {
              console.warn('ZXing scan error:', error)
              // Don't play error sound for NotFoundException as it's normal during scanning
            }
          }
        )

        // Get the video stream for torch support
        currentStream = videoElement.value.srcObject

        state.isScanning = true
        state.errorMessage = ''

        // Start scan line animation
        animateScanLine()

        console.log('ZXing scanning started successfully')

      } catch (error) {
        console.error('Failed to start ZXing scanning:', error)
        scannerAudio.playErrorSound()
        handleError(error)
      }
    }

    // Draw detection indicator
    const drawDetection = (result) => {
      try {
        if (!canvasElement.value || !videoElement.value) return

        const canvas = canvasElement.value
        const video = videoElement.value

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw detection points if available
        const resultPoints = result.getResultPoints()
        if (resultPoints && resultPoints.length > 0) {
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 3
          ctx.beginPath()

          resultPoints.forEach((point, index) => {
            const x = point.getX()
            const y = point.getY()

            if (index === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })

          ctx.closePath()
          ctx.stroke()
        }

        // Clear after a delay
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }, 1000)

      } catch (error) {
        console.warn('Error drawing detection:', error)
      }
    }

    // Stop scanning
    const stopScanning = () => {
      if (!state.isScanning) return

      try {
        if (codeReader) {
          codeReader.reset()
        }
        state.isScanning = false
      } catch (error) {
        console.error('Failed to stop scanning:', error)
      }
    }

    // Switch camera
    const switchCamera = async () => {
      if (state.isInitializing || !state.hasMultipleCameras || !state.isInitialized) return

      try {
        stopScanning()
        state.isFrontCamera = !state.isFrontCamera

        // Find appropriate camera
        const targetCamera = availableCameras.find(camera => {
          const label = camera.label.toLowerCase()
          if (state.isFrontCamera) {
            return label.includes('front') || label.includes('user')
          } else {
            return label.includes('back') || label.includes('environment')
          }
        })

        if (targetCamera) {
          currentDeviceId = targetCamera.deviceId
        }

        // Restart with new camera
        await startScanning()

      } catch (error) {
        console.error('Failed to switch camera:', error)
        handleError(error)
      }
    }

    // Toggle torch
    const toggleTorch = async () => {
      if (!state.hasTorch || !currentStream) return

      try {
        const videoTrack = currentStream.getVideoTracks()[0]
        await videoTrack.applyConstraints({
          advanced: [{ torch: !state.torchOn }]
        })
        state.torchOn = !state.torchOn
      } catch (error) {
        console.error('Failed to toggle torch:', error)
      }
    }

    // Handle manual input
    const handleManualInput = () => {
      // Resume audio context on user interaction
      scannerAudio.resumeAudioContext()
      
      // Provide haptic feedback for manual input
      scannerHaptic.vibrateLongPress()
      
      emit('manual-input')
    }

    // Handle tap to focus for mobile
    const handleTapToFocus = async () => {
      if (!isMobileDevice || !state.isScanning || !currentStream) return

      try {
        const videoTrack = currentStream.getVideoTracks()[0]
        await videoTrack.applyConstraints({
          advanced: [{ focusMode: 'continuous' }]
        })
        // console.log('Mobile focus applied')
      } catch (error) {
        console.warn('Could not apply focus:', error)
      }
    }

    // Retry initialization
    const retryInitialization = () => {
      state.hasError = false
      state.errorMessage = ''
      initializeScanner()
    }

    // Cleanup
    const cleanup = () => {
      try {
        stopScanning()

        if (codeReader) {
          codeReader.reset()
        }

        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop())
        }

        // Reset detection state
        lastDetectionTime = 0
        lastSuccessfulCode = ''
        detectionCount = 0

        state.isScanning = false
        state.isInitialized = false
        currentStream = null
        
        // Stop vibration if active
        scannerHaptic.stop()

      } catch (error) {
        console.error('ZXing cleanup error:', error)
      }
    }

    // Lifecycle
    onMounted(() => {
      initializeScanner()
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      // Template refs
      scannerContainer,
      videoElement,
      canvasElement,

      // State
      state,
      scanLinePosition,
      isMobileDevice,

      // Methods
      switchCamera,
      toggleTorch,
      handleManualInput,
      handleTapToFocus,
      retryInitialization
    }
  }
}
</script>

<style scoped>
/* Main container fills entire viewport */
.scanner-main-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure video covers the entire container */
video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 1 !important;
}

/* Canvas overlay */
canvas {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 5 !important;
  pointer-events: none !important;
}

/* Safe area support for mobile devices */
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.pb-safe-bottom {
  padding-bottom: max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem));
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .pb-safe-bottom {
    padding-bottom: max(3rem, calc(env(safe-area-inset-bottom) + 2rem));
  }

  button {
    font-size: 16px !important; /* Prevent zoom on iOS */
    user-select: none;
    -webkit-user-select: none;
  }
}

/* PWA specific adjustments */
@media (display-mode: standalone) {
  .pb-safe-bottom {
    padding-bottom: max(3.5rem, calc(env(safe-area-inset-bottom) + 2.5rem));
  }
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  .scanner-main-container {
    -webkit-user-select: none;
    user-select: none;
  }

  video {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
  }
}

/* Android specific fixes */
@media screen and (max-width: 768px) and (orientation: portrait) {
  .scanner-main-container {
    height: 100vh !important;
    height: 100dvh !important;
  }
}

/* Touch-friendly controls */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 56px !important;
    min-width: 200px;
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
  }

  button:active {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.4) !important;
  }
}
</style>
