<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 z-50">
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-black text-white safe-area-padding">
        <div class="flex items-center space-x-3">
          <CameraIcon class="w-6 h-6 text-white" />
          <h2 class="text-lg font-semibold">Take Photo</h2>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Flash Toggle -->
          <button
            v-if="hasFlash"
            @click="toggleFlash"
            :disabled="!cameraReady"
            class="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50"
            :class="{ 'bg-yellow-500 bg-opacity-80 hover:bg-yellow-500': flashOn }"
          >
            <BoltIcon v-if="!flashOn" class="w-5 h-5" />
            <BoltSlashIcon v-else class="w-5 h-5" />
          </button>

          <!-- Camera Switch -->
          <button
            v-if="hasMultipleCameras"
            @click="switchCamera"
            :disabled="!cameraReady"
            class="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon class="w-5 h-5" />
          </button>

          <!-- Close button -->
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Camera Area -->
      <div class="flex-1 relative overflow-hidden">
        <!-- Video Element -->
        <video
          ref="videoElement"
          class="w-full h-full object-cover"
          :class="{ 'mirror': isFrontCamera }"
          playsinline
          muted
          autoplay
        ></video>

        <!-- Canvas for processing (hidden) -->
        <canvas
          ref="canvasElement"
          class="hidden"
        ></canvas>

        <!-- Error State -->
        <div
          v-if="error"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90"
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

        <!-- Center Capture Button Overlay -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            @click="capturePhoto"
            :disabled="!cameraReady"
            class="w-20 h-20 rounded-full bg-white hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl border-4 border-white/50 pointer-events-auto"
          >
            <CameraIcon class="w-8 h-8 text-charcoal-900" />
          </button>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="bg-black text-white p-4 safe-area-padding">
        <div class="text-center">
          <p class="text-white/80 text-sm mb-2">
            {{ cameraReady ? 'Tap the camera button to take photo' : 'Preparing camera...' }}
          </p>
          <p class="text-white/60 text-xs">
            {{ isFrontCamera ? 'Using front camera' : 'Using back camera' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

// Icons
import {
  XMarkIcon,
  BoltIcon,
  BoltSlashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CameraIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'CameraModal',
  components: {
    XMarkIcon,
    BoltIcon,
    BoltSlashIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CameraIcon
  },
  emits: ['close', 'photo-captured'],
  setup(props, { emit }) {
    // Refs
    const videoElement = ref(null)
    const canvasElement = ref(null)

    // State
    const cameraReady = ref(false)
    const isFrontCamera = ref(true) // Default to front camera for selfies
    const hasMultipleCameras = ref(false)
    const hasFlash = ref(false)
    const flashOn = ref(false)
    const error = ref('')

    // Camera stream and constraints
    let currentStream = null
    let availableCameras = []

    // Methods
    const initializeCamera = async () => {
      try {
        error.value = ''

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        availableCameras = devices.filter(device => device.kind === 'videoinput')
        hasMultipleCameras.value = availableCameras.length > 1

        // Request camera permissions
        const constraints = {
          video: {
            facingMode: isFrontCamera.value ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 1280 }
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

      // Toggle camera
      isFrontCamera.value = !isFrontCamera.value
      cameraReady.value = false

      // Reinitialize with new camera
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

    const capturePhoto = () => {
      if (!videoElement.value || !canvasElement.value || !cameraReady.value) return

      const video = videoElement.value
      const canvas = canvasElement.value
      const context = canvas.getContext('2d')

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the full video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          emit('photo-captured', blob)
        }
      }, 'image/jpeg', 0.9)
    }

    const cleanup = () => {
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
      isFrontCamera,
      hasMultipleCameras,
      hasFlash,
      flashOn,
      error,
      initializeCamera,
      switchCamera,
      toggleFlash,
      capturePhoto
    }
  }
}
</script>

<style scoped>
/* Mirror effect for front camera */
.mirror {
  transform: scaleX(-1);
}

/* Smooth transitions */
.transition-colors,
.transition-all {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
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
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Prevent screen from going to sleep during camera use */
video::-webkit-media-controls {
  display: none !important;
}

/* Safe area padding for devices with notches */
.safe-area-padding {
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-white {
    background-color: #ffffff;
  }

  .bg-opacity-20 {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-colors,
  .transition-all {
    transition: none;
  }
}

/* Landscape orientation optimizations */
@media (orientation: landscape) and (max-height: 500px) {
  .safe-area-padding {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Smaller capture button in landscape */
  .w-20 {
    width: 4rem !important;
    height: 4rem !important;
  }
}

/* Desktop optimizations */
@media (min-width: 768px) {
  /* Larger capture button on desktop */
  .w-20 {
    width: 5rem !important;
    height: 5rem !important;
  }
}
</style>
