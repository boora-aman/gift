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
          On mobile, please allow camera access when prompted
        </p>
      </div>
    </div>
    
    <!-- Error State -->
    <div 
      v-if="state.hasError" 
      class="absolute inset-0 bg-black flex items-center justify-center z-20"
    >
      <div class="text-center text-white p-4 max-w-sm mx-auto">
        <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">Camera Error</h3>
        <p class="text-sm text-gray-300 mb-4 break-words">{{ state.errorMessage }}</p>
        <button 
          @click="retryInitialization"
          class="w-full sm:w-auto px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium mb-3"
        >
          Try Again
        </button>
        <div>
          <button
            @click="handleManualInput"
            class="text-sm text-gray-400 underline hover:text-white transition-colors duration-200"
          >
            Enter code manually
          </button>
        </div>
      </div>
    </div>
    
    <!-- Scanner Container -->
    <div 
      v-show="state.isInitialized && !state.hasError"
      ref="scannerContainer" 
      class="scanner-container"
      :class="{ 'front-camera': state.isFrontCamera }"
    >
      <!-- Video will be inserted here by QuaggaJS -->
      
      <!-- Drawing overlay for debugging -->
      <canvas 
        v-if="props.debug"
        ref="drawingBuffer"
        class="absolute inset-0 w-full h-full pointer-events-none z-10"
      ></canvas>
      
      <!-- Scanner Controls Overlay -->
      <div class="absolute inset-0 z-10 pointer-events-none">
        <!-- Top Controls -->
        <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 safe-area-top pointer-events-auto">
          <div class="flex items-center justify-between">
            <!-- Status indicator -->
            <div class="flex items-center space-x-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-green-400 animate-pulse': state.isScanning,
                  'bg-yellow-400': state.isInitialized && !state.isScanning,
                  'bg-red-400': state.hasError
                }"
              ></div>
              <span class="text-white text-sm font-medium">
                {{ state.isScanning ? 'SCANNING...' : state.isInitialized ? 'Ready' : 'Initializing...' }}
              </span>
              <!-- Processing indicator -->
              <div v-if="state.isScanning" class="text-white text-xs opacity-75">
                {{ consecutiveDetections > 0 ? `${consecutiveDetections} detected` : 'Looking for codes...' }}
              </div>
            </div>
            
            <!-- Camera controls -->
            <div class="flex items-center space-x-2">
              <!-- Speed Control Toggle -->
              <button
                v-if="props.showSpeedControls"
                @click="speedSettings.showControls = !speedSettings.showControls"
                :disabled="state.isInitializing"
                class="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 disabled:opacity-50 transition-all duration-200"
                title="Speed Settings"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4V8a2 2 0 100-4m0 4a2 2 0 100 4m0-4V4m6 4V4m0 4a2 2 0 100 4m0-4a2 2 0 100 4m0-4V4" />
                </svg>
              </button>
              
              <!-- Switch camera -->
              <button
                v-if="state.hasMultipleCameras"
                @click="switchCamera"
                :disabled="state.isInitializing"
                class="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 disabled:opacity-50 transition-all duration-200"
                title="Switch Camera"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              
              <!-- Torch/Flashlight -->
              <button
                v-if="state.hasTorch"
                @click="toggleTorch"
                :disabled="!state.isInitialized"
                class="p-2 rounded-full backdrop-blur-sm text-white transition-all duration-200"
                :class="{
                  'bg-yellow-500/30 text-yellow-300': state.torchOn,
                  'bg-white/20 hover:bg-white/30': !state.torchOn
                }"
                title="Toggle Flashlight"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Speed Control Panel -->
        <div 
          v-if="speedSettings.showControls && props.showSpeedControls"
          class="absolute top-16 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 z-30 pointer-events-auto safe-area-top"
        >
          <div class="text-center mb-3">
            <h3 class="text-white text-sm font-semibold mb-1">Scanning Speed</h3>
            <p class="text-white/70 text-xs">{{ speedConfig.description }}</p>
          </div>
          
          <div class="flex justify-center space-x-2 mb-3">
            <button
              v-for="speed in ['fast', 'normal', 'slow']"
              :key="speed"
              @click="changeSpeed(speed)"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                speedSettings.currentSpeed === speed
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              ]"
            >
              {{ speed.charAt(0).toUpperCase() + speed.slice(1) }}
            </button>
          </div>
          
          <div class="text-center text-xs text-white/60">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="font-medium">{{ speedConfig.detectionsRequired }}</div>
                <div class="text-white/50">detections</div>
              </div>
              <div>
                <div class="font-medium">{{ speedConfig.minDetectionInterval }}ms</div>
                <div class="text-white/50">interval</div>
              </div>
              <div>
                <div class="font-medium">{{ speedConfig.frequency }} FPS</div>
                <div class="text-white/50">frequency</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Center Scanning Frame -->
        <div class="absolute inset-0 flex items-center justify-center">
          <!-- Scanning viewfinder -->
          <div class="relative">
            <!-- Mobile optimized scanning frame - wider on mobile -->
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
            
            <!-- Instructions -->
            <div class="text-center mt-6 px-4">
              <p class="text-white text-sm sm:text-base font-medium mb-2">
                {{ state.isScanning ? (isMobileDevice ? 'Hold barcode steady in the frame' : 'Position barcode within the frame') : 'Initializing scanner...' }}
              </p>
              <p class="text-white/70 text-xs sm:text-sm">
                {{ isMobileDevice ? 'Try moving closer/further or tapping the screen to focus' : 'Keep the barcode steady and well-lit' }}
              </p>
              <p v-if="isMobileDevice && state.isScanning" class="text-white/60 text-xs mt-2">
                📱 Tap the barcode area to focus • 💡 Use good lighting
              </p>
            </div>
          </div>
        </div>
        
        <!-- Bottom Controls -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto z-30">
          <div class="flex items-center justify-center px-4 pt-6 pb-safe-bottom">
            <!-- Manual input button with improved spacing for PWA -->
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
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useScannerAudio } from '@/composables/useScannerAudio'
import { useScannerHaptic } from '@/composables/useScannerHaptic'

export default {
  name: 'BarcodeScanner',
  props: {
    formats: {
      type: Array,
      default: () => [
        'code_128_reader',
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'code_93_reader',
        'upc_reader',
        'upc_e_reader',
        'codabar_reader'
      ]
    },
    frequency: {
      type: Number,
      default: 10
    },
    debug: {
      type: Boolean,
      default: false
    },
    locate: {
      type: Boolean,
      default: true
    },
    // New speed control props
    scanSpeed: {
      type: String,
      default: 'normal', // 'fast', 'normal', 'slow'
      validator: (value) => ['fast', 'normal', 'slow'].includes(value)
    },
    detectionsRequired: {
      type: Number,
      default: null // null means use speed-based default
    },
    minDetectionInterval: {
      type: Number,
      default: null // null means use speed-based default
    },
    showSpeedControls: {
      type: Boolean,
      default: true
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
    
    // Speed control settings
    const speedSettings = reactive({
      currentSpeed: props.scanSpeed || 'fast',
      showControls: false
    })
    
    // Computed speed configuration
    const speedConfig = computed(() => {
      const configs = {
        fast: {
          detectionsRequired: 1,
          minDetectionInterval: 100,
          processingDelay: 0,
          frequency: 25,
          description: 'Instant detection'
        },
        normal: {
          detectionsRequired: 2,
          minDetectionInterval: 500,
          processingDelay: 200,
          frequency: 15,
          description: 'Balanced speed'
        },
        slow: {
          detectionsRequired: 3,
          minDetectionInterval: 1000,
          processingDelay: 500,
          frequency: 10,
          description: 'Careful scanning'
        }
      }
      
      const config = configs[speedSettings.currentSpeed] || configs.normal
      
      // Allow prop overrides
      return {
        detectionsRequired: props.detectionsRequired ?? config.detectionsRequired,
        minDetectionInterval: props.minDetectionInterval ?? config.minDetectionInterval,
        processingDelay: config.processingDelay,
        frequency: config.frequency,
        description: config.description
      }
    })
    
    // Audio and haptic feedback
    const scannerAudio = useScannerAudio()
    const scannerHaptic = useScannerHaptic()
    
    // Template refs
    const scannerContainer = ref(null)
    const drawingBuffer = ref(null)
    
    // QuaggaJS instance
    let Quagga = null
    let availableCameras = []
    let currentTrack = null
    let scanLinePosition = ref(10)
    
    // Enhanced detection optimization
    let detectionHistory = []
    let lastDetectionTime = 0
    let detectionTimeout = null
    let consecutiveDetections = 0
    let lastSuccessfulCode = ''
    let codeConfidenceMap = new Map()
    
    // Mobile-specific detection settings (optimized for speed)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                          window.matchMedia('(max-width: 768px)').matches ||
                          window.matchMedia('(pointer: coarse)').matches ||
                          ('ontouchstart' in window)
    
    // Check if we're running in a secure context
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost'
    
    // Dynamic detection thresholds based on speed settings
    const getDetectionConfig = () => ({
      DETECTION_THRESHOLD: speedConfig.value.detectionsRequired,
      DETECTION_WINDOW: speedSettings.currentSpeed === 'slow' ? 2000 : 1500,
      MIN_DETECTION_INTERVAL: speedConfig.value.minDetectionInterval,
      CONFIDENCE_THRESHOLD: 0.7,
      DUPLICATE_PREVENTION_TIME: speedSettings.currentSpeed === 'fast' ? 1000 : 3000,
      PROCESSING_DELAY: speedConfig.value.processingDelay
    })
    
    // Computed for scanning line animation
    const animateScanLine = () => {
      if (state.isScanning) {
        scanLinePosition.value = scanLinePosition.value >= 90 ? 10 : scanLinePosition.value + 2
        setTimeout(animateScanLine, 100)
      }
    }
    
    // Error handling
    const handleError = (error) => {
      console.error('BarcodeScanner error:', error)
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        isHTTPS: location.protocol === 'https:',
        isPWA: window.matchMedia('(display-mode: standalone)').matches
      })
      
      state.hasError = true
      state.isInitialized = false
      state.isScanning = false
      
      let message = 'An error occurred with the scanner'
      
      if (error.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access and try again.'
        if (isMobileDevice) {
          message += ' On mobile, you may need to refresh the page and grant permission again.'
        }
      } else if (error.name === 'NotFoundError') {
        message = 'No camera found on this device.'
      } else if (error.name === 'NotReadableError') {
        message = 'Camera is already in use by another application.'
        if (isMobileDevice) {
          message += ' Try closing other camera apps and refresh the page.'
        }
      } else if (error.name === 'OverconstrainedError') {
        message = 'Camera settings not supported. Using fallback mode...'
        // Try to retry with simpler settings
        setTimeout(() => {
          if (!state.isInitialized) {
            retryInitialization()
          }
        }, 2000)
      } else if (error.message) {
        message = error.message
      }
      
      // Add mobile-specific error guidance
      if (isMobileDevice) {
        if (error.name === 'NotAllowedError') {
          message += ' On mobile, you may need to refresh the page and try again.'
        } else if (error.name === 'NotReadableError') {
          message += ' Try closing other camera apps and refresh the page.'
        }
      }
      
      state.errorMessage = message
      emit('error', error)
    }
    
    // Load QuaggaJS library
    const loadQuaggaJS = async () => {
      try {
        if (typeof window !== 'undefined' && !window.Quagga) {
          const quaggaModule = await import('quagga')
          Quagga = quaggaModule.default
          window.Quagga = Quagga
        } else {
          Quagga = window.Quagga
        }
        
        if (!Quagga) {
          throw new Error('QuaggaJS library failed to load')
        }
        
        return Quagga
      } catch (error) {
        console.error('Failed to load QuaggaJS:', error)
        throw new Error('QuaggaJS library is not available')
      }
    }
    
    // Get QuaggaJS configuration
    const getQuaggaConfig = () => {
      // Detect mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      window.matchMedia('(max-width: 768px)').matches
      
      // Optimized mobile constraints for faster detection
      const mobileConstraints = {
        width: { min: 480, ideal: 720, max: 1280 }, // Higher ideal resolution for better accuracy
        height: { min: 320, ideal: 480, max: 720 },
        facingMode: state.isFrontCamera ? 'user' : 'environment',
        frameRate: { min: 10, ideal: 30, max: 60 }, // Higher frame rate for faster detection
        focusMode: 'continuous' // Continuous autofocus for mobile
      }
      
      // Desktop constraints
      const desktopConstraints = {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: state.isFrontCamera ? 'user' : 'environment',
        aspectRatio: { min: 1, max: 2 },
        frameRate: { min: 15, ideal: 30, max: 60 }
      }
      
      return {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerContainer.value,
          constraints: isMobile ? mobileConstraints : desktopConstraints,
          area: {
            top: isMobile ? "0%" : "10%",     // Full scanning area on mobile
            right: isMobile ? "0%" : "5%",    // Full width on mobile
            left: isMobile ? "0%" : "5%",     // Full width on mobile
            bottom: isMobile ? "0%" : "10%"
          },
          singleChannel: false
        },
        locator: {
          patchSize: isMobile ? 'medium' : 'large',    // Medium patch for balance of speed/accuracy
          halfSample: false,                           // Disable for better quality
          willReadFrequently: true                     // Optimize for frequent reading
        },
        numOfWorkers: isMobile ? 2 : Math.min(navigator.hardwareConcurrency || 4, 4), // More workers on mobile for speed
        frequency: speedConfig.value?.frequency || (isMobile ? Math.max(props.frequency || 20, 20) : Math.max(props.frequency || 15, 15)), // Use speed-based frequency
        decoder: {
          readers: isMobile ? [
            'code_128_reader',  // Priority order for mobile - most common first
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'code_39_reader'
          ] : props.formats,
          multiple: false,          // Focus on single barcode detection
          debug: {
            showCanvas: props.debug,
            showPatches: props.debug,
            showFoundPatches: props.debug,
            showSkeleton: props.debug,
            showLabels: props.debug,
            showPatchLabels: props.debug,
            showRemainingPatchLabels: props.debug,
            boxFromPatches: {
              showTransformed: props.debug,
              showTransformedBox: props.debug,
              showBB: props.debug
            }
          }
        },
        locate: true  // Always enable locator for better detection
      }
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
      } catch (error) {
        console.warn('Could not enumerate cameras:', error)
      }
    }
    
    // Check torch support
    const checkTorchSupport = async () => {
      try {
        if (Quagga && Quagga.CameraAccess && Quagga.CameraAccess.getActiveTrack) {
          currentTrack = Quagga.CameraAccess.getActiveTrack()
          if (currentTrack && currentTrack.getCapabilities) {
            const capabilities = currentTrack.getCapabilities()
            state.hasTorch = !!(capabilities && capabilities.torch)
          }
        }
      } catch (error) {
        console.warn('Could not check torch support:', error)
      }
    }
    
    // Initialize with mobile fallback
    const initializeWithFallback = async () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      window.matchMedia('(max-width: 768px)').matches
      
      let lastError = null
      
      // Try different configurations for mobile compatibility
      const configs = [
        getQuaggaConfig(), // Primary config
      ]
      
      // Add mobile-specific fallback configs
      if (isMobile) {
        // Aggressive mobile config - maximum compatibility
        configs.push({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerContainer.value,
            constraints: {
              width: { min: 240, ideal: 480 },
              height: { min: 180, ideal: 360 },
              facingMode: state.isFrontCamera ? 'user' : 'environment'
            },
            area: { top: "0%", right: "0%", left: "0%", bottom: "0%" }, // Full screen scanning
            singleChannel: false
          },
          locator: { patchSize: 'x-small', halfSample: false },
          numOfWorkers: 1,
          frequency: 20, // Higher frequency for faster detection
          decoder: { 
            readers: [
              'code_128_reader',  // Most common
              'ean_reader',       // EAN-13
              'ean_8_reader',     // EAN-8
              'code_39_reader'    // Legacy but common
            ], 
            multiple: false 
          },
          locate: true
        })
        
        // Ultra-simple mobile config - last resort
        configs.push({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerContainer.value,
            constraints: { 
              facingMode: state.isFrontCamera ? 'user' : 'environment'
              // No width/height constraints - let device decide
            },
            area: { top: "0%", right: "0%", left: "0%", bottom: "0%" },
            singleChannel: false
          },
          locator: { patchSize: 'x-small', halfSample: false },
          numOfWorkers: 1,
          frequency: 10,
          decoder: { 
            readers: ['code_128_reader', 'ean_reader'], // Only most reliable formats
            multiple: false 
          },
          locate: false // Disable locator for maximum compatibility
        })
      }
      
      // Try each config until one works
      for (let i = 0; i < configs.length; i++) {
        try {
          console.log(`Trying config ${i + 1}/${configs.length}${isMobile ? ' (mobile)' : ''}...`)
          
          await new Promise((resolve, reject) => {
            Quagga.init(configs[i], (err) => {
              if (err) {
                console.warn(`Config ${i + 1} failed:`, err)
                lastError = err
                reject(err)
              } else {
                console.log(`Config ${i + 1} succeeded!`)
                resolve()
              }
            })
          })
          
          return // Success!
          
        } catch (error) {
          lastError = error
          console.warn(`Configuration ${i + 1} failed, trying next...`)
          
          // Stop any running instance before trying next config
          try {
            if (Quagga.CameraAccess) {
              Quagga.CameraAccess.release()
            }
          } catch (releaseError) {
            console.warn('Error releasing camera:', releaseError)
          }
        }
      }
      
      // If all configs failed, throw the last error
      throw lastError || new Error('All scanner configurations failed')
    }
    
    // Setup event listeners
    const setupEventListeners = () => {
      if (!Quagga) return
      
      try {
        // Detection event with enhanced confidence scoring
        Quagga.onDetected((result) => {
          try {
            if (result && result.codeResult && result.codeResult.code) {
              const code = result.codeResult.code
              const format = result.codeResult.format || 'unknown'
              const currentTime = Date.now()
              
              // Get current speed configuration
              const config = getDetectionConfig()
              
              // Prevent too frequent detections of the same code
              if (lastSuccessfulCode === code && currentTime - lastDetectionTime < config.DUPLICATE_PREVENTION_TIME) {
                return
              }
              
              // Quick interval check for any code
              if (currentTime - lastDetectionTime < config.MIN_DETECTION_INTERVAL) {
                return
              }
              
              // Calculate confidence score
              let confidence = 1.0
              if (result.codeResult.decodedCodes && result.codeResult.decodedCodes.length > 0) {
                const errors = result.codeResult.decodedCodes.reduce((sum, decoded) => 
                  sum + (decoded.error || 0), 0)
                confidence = Math.max(0, 1 - (errors / result.codeResult.decodedCodes.length))
              }
              
              // Skip low confidence detections
              if (confidence < config.CONFIDENCE_THRESHOLD) {
                console.log('Low confidence detection skipped:', { code, confidence })
                return
              }
              
              console.log('High-quality barcode detected:', { 
                code, 
                format, 
                confidence, 
                speed: speedSettings.currentSpeed,
                requiredDetections: config.DETECTION_THRESHOLD
              })
              
              // Play detection beep immediately for feedback
              scannerAudio.playDetectionBeep()
              scannerHaptic.vibrateDetection()
              
              // Update confidence tracking
              if (!codeConfidenceMap.has(code)) {
                codeConfidenceMap.set(code, [])
              }
              codeConfidenceMap.get(code).push({ confidence, time: currentTime })
              
              // Clean old confidence data
              codeConfidenceMap.forEach((confidences, mapCode) => {
                codeConfidenceMap.set(mapCode, confidences.filter(c => currentTime - c.time <= config.DETECTION_WINDOW))
                if (codeConfidenceMap.get(mapCode).length === 0) {
                  codeConfidenceMap.delete(mapCode)
                }
              })
              
              // Add to detection history
              detectionHistory.push({
                code,
                format,
                time: currentTime,
                confidence
              })
              
              // Clean old detections
              detectionHistory = detectionHistory.filter(detection => 
                currentTime - detection.time <= config.DETECTION_WINDOW
              )
              
              // Check for consistent detections with confidence weighting
              const sameCodeDetections = detectionHistory.filter(detection => detection.code === code)
              const avgConfidence = sameCodeDetections.reduce((sum, d) => sum + d.confidence, 0) / sameCodeDetections.length
              
              // Speed-based detection strategy
              const shouldEmit = sameCodeDetections.length >= config.DETECTION_THRESHOLD && avgConfidence >= config.CONFIDENCE_THRESHOLD
              
              if (shouldEmit) {
                // Clear any pending timeout
                if (detectionTimeout) {
                  clearTimeout(detectionTimeout)
                  detectionTimeout = null
                }
                
                // Add processing delay based on speed setting
                setTimeout(() => {
                  // Play success sound and haptic feedback
                  scannerAudio.playSuccessSound()
                  scannerHaptic.vibrateSuccess()
                  
                  // Emit successful detection
                  emit('scan-result', {
                    code,
                    format,
                    result: result.codeResult,
                    confidence: avgConfidence,
                    detectionCount: sameCodeDetections.length,
                    speed: speedSettings.currentSpeed
                  })
                  
                  lastDetectionTime = currentTime
                  lastSuccessfulCode = code
                  consecutiveDetections++
                  
                  // Clear detection history after successful scan
                  detectionHistory = []
                  codeConfidenceMap.clear()
                  
                  console.log('Scanner detection emitted:', { 
                    code, 
                    confidence: avgConfidence, 
                    consecutive: consecutiveDetections,
                    speed: speedSettings.currentSpeed
                  })
                  
                  // Brief pause after successful detection
                  setTimeout(() => {
                    if (state.isScanning) {
                      console.log('Scanner ready for next detection')
                    }
                  }, 100)
                }, config.PROCESSING_DELAY)
                
              } else if (!detectionTimeout && speedSettings.currentSpeed === 'fast') {
                // Set fallback timeout only for fast mode
                detectionTimeout = setTimeout(() => {
                  if (sameCodeDetections.length > 0 && avgConfidence >= config.CONFIDENCE_THRESHOLD) {
                    console.log('Fallback detection triggered:', code)
                    
                    // Play success feedback
                    scannerAudio.playSuccessSound()
                    scannerHaptic.vibrateSuccess()
                    
                    emit('scan-result', {
                      code,
                      format,
                      result: result.codeResult,
                      confidence: avgConfidence,
                      detectionCount: sameCodeDetections.length,
                      speed: speedSettings.currentSpeed
                    })
                    
                    lastDetectionTime = Date.now()
                    lastSuccessfulCode = code
                    detectionHistory = []
                    codeConfidenceMap.clear()
                  }
                  detectionTimeout = null
                }, 200) // Short timeout for fast mode only
              }
            }
          } catch (error) {
            console.error('Error processing detected barcode:', error)
            scannerAudio.playErrorSound()
          }
        })
        
        // Processing event for debug
        if (props.debug) {
          Quagga.onProcessed((result) => {
            try {
              const drawingCtx = drawingBuffer.value?.getContext('2d')
              if (drawingCtx && result) {
                drawingCtx.clearRect(0, 0, drawingBuffer.value.width, drawingBuffer.value.height)
                
                // Draw localization boxes
                if (result.boxes) {
                  drawingCtx.strokeStyle = 'green'
                  drawingCtx.lineWidth = 2
                  result.boxes.filter(box => box !== result.box).forEach(box => {
                    if (box && Quagga.ImageDebug) {
                      Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 })
                    }
                  })
                }
                
                // Draw detection box
                if (result.box && Quagga.ImageDebug) {
                  drawingCtx.strokeStyle = 'blue'
                  drawingCtx.lineWidth = 2
                  Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 })
                }
                
                // Draw code line
                if (result.codeResult && result.codeResult.code && result.line && Quagga.ImageDebug) {
                  drawingCtx.strokeStyle = 'red'
                  drawingCtx.lineWidth = 3
                  Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 })
                }
              }
            } catch (error) {
              console.warn('Error in debug visualization:', error)
            }
          })
        }
      } catch (error) {
        console.error('Error setting up event listeners:', error)
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
          console.log('Scanner audio initialized')
        } catch (error) {
          console.warn('Audio initialization failed:', error)
        }
        
        // Load QuaggaJS
        await loadQuaggaJS()
        
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
        
        if (!scannerContainer.value) {
          throw new Error('Scanner container not found')
        }
        
        // Try initialization with fallback for mobile
        await initializeWithFallback()
        
        // Setup event listeners
        setupEventListeners()
        
        // Mark as initialized
        state.isInitialized = true
        
        // Check for torch support
        setTimeout(() => {
          checkTorchSupport()
        }, 1000)
        
        // Start scanning
        startScanning()
        
      } catch (error) {
        console.error('Scanner initialization failed:', error)
        scannerAudio.playErrorSound()
        handleError(error)
      } finally {
        state.isInitializing = false
      }
    }
    
    // Start scanning
    const startScanning = () => {
      if (state.isScanning || state.hasError || !state.isInitialized) {
        return
      }
      
      try {
        if (!Quagga || !Quagga.start) {
          throw new Error('QuaggaJS not properly initialized')
        }
        
        Quagga.start()
        state.isScanning = true
        state.errorMessage = ''
        
        // Start scan line animation
        animateScanLine()
        
        console.log('Scanning started successfully')
      } catch (error) {
        console.error('Failed to start scanning:', error)
        handleError(error)
      }
    }
    
    // Stop scanning
    const stopScanning = () => {
      if (!state.isScanning) return
      
      try {
        if (Quagga && Quagga.stop) {
          Quagga.stop()
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
        
        // Reinitialize with new camera
        await new Promise((resolve, reject) => {
          Quagga.init(getQuaggaConfig(), (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
        
        await checkTorchSupport()
        startScanning()
        
      } catch (error) {
        console.error('Failed to switch camera:', error)
        handleError(error)
      }
    }
    
    // Toggle torch
    const toggleTorch = async () => {
      if (!state.hasTorch || !currentTrack || !state.isInitialized) return
      
      try {
        await currentTrack.applyConstraints({
          advanced: [{ torch: !state.torchOn }]
        })
        state.torchOn = !state.torchOn
      } catch (error) {
        console.error('Failed to toggle torch:', error)
      }
    }
    
    // Change scanning speed
    const changeSpeed = (newSpeed) => {
      const oldSpeed = speedSettings.currentSpeed
      speedSettings.currentSpeed = newSpeed
      
      console.log(`Changing scanning speed from ${oldSpeed} to ${newSpeed}`)
      
      // Show brief notification
      const speedNames = { fast: 'Fast', normal: 'Normal', slow: 'Slow' }
      
      // If scanner is running, restart with new settings
      if (state.isScanning && state.isInitialized) {
        console.log('Restarting scanner with new speed settings...')
        restartScannerWithNewSpeed()
      }
    }
    
    // Restart scanner with new speed settings
    const restartScannerWithNewSpeed = async () => {
      try {
        const wasScanning = state.isScanning
        
        if (wasScanning) {
          stopScanning()
        }
        
        // Brief delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (wasScanning && state.isInitialized) {
          startScanning()
        }
        
        console.log(`Scanner restarted with ${speedSettings.currentSpeed} speed settings`)
      } catch (error) {
        console.error('Failed to restart scanner with new speed:', error)
        handleError(error)
      }
    }
    const handleManualInput = () => {
      console.log('Manual input button clicked') // Debug log
      try {
        // Resume audio context on user interaction
        scannerAudio.resumeAudioContext()
        
        // Provide haptic feedback for manual input
        scannerHaptic.vibrateLongPress()
        
        emit('manual-input')
        console.log('Manual input event emitted') // Debug log
      } catch (error) {
        console.error('Error emitting manual-input:', error)
      }
    }
    
    // Handle tap to focus for mobile
    const handleTapToFocus = async () => {
      if (!isMobileDevice || !state.isScanning || !currentTrack) return
      
      try {
        // Try to apply autofocus constraint
        await currentTrack.applyConstraints({
          advanced: [{ focusMode: 'continuous' }]
        })
        console.log('Mobile focus applied')
      } catch (error) {
        console.warn('Could not apply focus:', error)
        // Fallback: just restart the scanner briefly
        try {
          if (Quagga && Quagga.stop && Quagga.start) {
            Quagga.stop()
            setTimeout(() => {
              if (state.isScanning) {
                Quagga.start()
              }
            }, 100)
          }
        } catch (restartError) {
          console.warn('Could not restart for focus:', restartError)
        }
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
        if (state.isScanning && Quagga) {
          Quagga.stop()
        }
        
        if (Quagga) {
          Quagga.offDetected()
          Quagga.offProcessed()
        }
        
        // Clear detection timeout
        if (detectionTimeout) {
          clearTimeout(detectionTimeout)
          detectionTimeout = null
        }
        
        // Reset detection state
        detectionHistory = []
        lastDetectionTime = 0
        consecutiveDetections = 0
        lastSuccessfulCode = ''
        codeConfidenceMap.clear()
        
        state.isScanning = false
        state.isInitialized = false
        currentTrack = null
        
        // Stop vibration if active
        scannerHaptic.stop()
        
      } catch (error) {
        console.error('Cleanup error:', error)
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
      drawingBuffer,
      
      // State
      state,
      scanLinePosition,
      props,
      isMobileDevice,
      consecutiveDetections,
      
      // Speed control
      speedSettings,
      speedConfig,
      
      // Audio and Haptic
      scannerAudio,
      scannerHaptic,
      
      // Methods
      switchCamera,
      toggleTorch,
      handleManualInput,
      handleTapToFocus,
      retryInitialization,
      changeSpeed
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
  /* Remove viewport units that cause scrollbars */
  display: flex;
  flex-direction: column;
}

/* Ensure video covers the entire container and removes black spaces */
:deep(video) {
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

/* Ensure canvas overlay matches video dimensions */
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

/* Force QuaggaJS container to fill entire space */
:deep(.inputStream) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

/* Remove any padding/margin from video container */
:deep(.inputStream video) {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  display: block !important;
}

/* Ensure the scanner container takes full height */
.scanner-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: black;
}

/* Only mirror video when using front camera for natural selfie view */
.scanner-container.front-camera :deep(video) {
  transform: scaleX(-1) !important;
  -webkit-transform: scaleX(-1) !important;
}

/* Back camera (environment) should never be mirrored for barcode scanning */
.scanner-container:not(.front-camera) :deep(video) {
  transform: none !important;
  -webkit-transform: none !important;
}

/* Safe area support for mobile devices */
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

/* Mobile bottom safe area for manual button */
.pb-safe-bottom {
  padding-bottom: max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem));
}

/* Enhanced PWA support */
@media (max-width: 640px) {
  .pb-safe-bottom {
    padding-bottom: max(3rem, calc(env(safe-area-inset-bottom) + 2rem));
  }
}

/* PWA specific button styling */
@media (display-mode: standalone) {
  .pb-safe-bottom {
    padding-bottom: max(3.5rem, calc(env(safe-area-inset-bottom) + 2.5rem));
  }
}

/* Improved manual button for touch devices */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 56px !important; /* Ensure touch-friendly size */
    min-width: 200px; /* Ensure adequate touch target */
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1); /* Add tap feedback */
  }
  
  .pb-safe-bottom {
    padding-bottom: max(3rem, calc(env(safe-area-inset-bottom) + 2rem));
  }
  
  /* Better mobile camera display - no global mirroring */
  :deep(video) {
    object-fit: cover !important;
    /* Camera-specific mirroring handled by .front-camera class */
  }
  
  /* Ensure full viewport on mobile */
  .scanner-main-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 9999 !important;
  }
  
  /* Better touch interaction for manual button */
  button:active {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.4) !important;
  }
}

/* Mobile specific frame adjustments */
@media (max-width: 640px) {
  /* Wider scanning frame on small screens */
  .relative.w-80 {
    width: min(90vw, 24rem) !important; /* Responsive width */
  }
  
  /* Ensure manual button is easily accessible */
  button {
    font-size: 16px !important; /* Prevent zoom on iOS */
    user-select: none;
    -webkit-user-select: none;
  }
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  .scanner-main-container {
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* iOS video styling - no mirroring for barcode scanning */
  :deep(video) {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
    /* Mirroring removed for barcode readability */
  }
}

/* Android specific fixes */
@media screen and (max-width: 768px) and (orientation: portrait) {
  .scanner-main-container {
    height: 100vh !important;
    height: 100dvh !important; /* Dynamic viewport height */
  }
}

/* Animation for scanning line */
@keyframes scan-line {
  0% { top: 10%; }
  50% { top: 90%; }
  100% { top: 10%; }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white\/20 {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .bg-black\/50 {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-spin {
    animation: none;
  }
  
  .transition-all {
    transition: none;
  }
}

/* Mobile specific adjustments */
@media (max-width: 640px) {
  .safe-area-top {
    padding-top: max(0.5rem, env(safe-area-inset-top));
  }
  
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  
  /* Ensure manual button is well above mobile navigation */
  .pb-safe-bottom {
    padding-bottom: max(4rem, calc(env(safe-area-inset-bottom) + 2.5rem));
  }
}

/* Landscape mobile adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .safe-area-top {
    padding-top: 0.25rem;
  }
  
  .safe-area-bottom {
    padding-bottom: 0.5rem;
  }
}

/* PWA specific adjustments */
@media (display-mode: standalone) {
  /* Remove any extra padding in PWA mode */
  .safe-area-top {
    padding-top: max(0.5rem, env(safe-area-inset-top));
  }
  
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  
  /* Ensure video fills container properly in PWA */
  :deep(video) {
    object-fit: cover !important;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  :deep(video) {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 0;
  }
  
  .scanner-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>