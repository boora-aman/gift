<template>
  <div class="min-h-screen bg-charcoal-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-charcoal-900 mb-6">Scanner Debug & Test</h1>

      <!-- System Information -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">System Information</h2>
        <div class="space-y-2 text-sm">
          <div><strong>User Agent:</strong> {{ systemInfo.userAgent }}</div>
          <div><strong>Is Mobile:</strong> {{ systemInfo.isMobile ? 'Yes' : 'No' }}</div>
          <div><strong>Is HTTPS:</strong> {{ systemInfo.isHTTPS ? 'Yes' : 'No' }}</div>
          <div><strong>Is PWA:</strong> {{ systemInfo.isPWA ? 'Yes' : 'No' }}</div>
          <div><strong>Has Media Devices:</strong> {{ systemInfo.hasMediaDevices ? 'Yes' : 'No' }}</div>
          <div><strong>Has getUserMedia:</strong> {{ systemInfo.hasGetUserMedia ? 'Yes' : 'No' }}</div>
          <div><strong>Is Secure Context:</strong> {{ systemInfo.isSecureContext ? 'Yes' : 'No' }}</div>
        </div>
      </div>

      <!-- Camera Permission Test -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Camera Permission Test</h2>
        <button
          @click="testCameraPermission"
          :disabled="testingCamera"
          class="btn btn-primary mb-4"
        >
          {{ testingCamera ? 'Testing...' : 'Test Camera Access' }}
        </button>

        <div v-if="cameraTestResult" class="mt-4">
          <div
            :class="cameraTestResult.success ? 'text-green-600' : 'text-red-600'"
            class="font-medium"
          >
            {{ cameraTestResult.success ? '✓ Camera access granted' : '✗ Camera access failed' }}
          </div>
          <div v-if="cameraTestResult.error" class="text-red-600 text-sm mt-1">
            {{ cameraTestResult.error }}
          </div>
        </div>
      </div>

      <!-- Available Cameras -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Available Cameras</h2>
        <button
          @click="enumerateDevices"
          :disabled="enumeratingDevices"
          class="btn btn-secondary mb-4"
        >
          {{ enumeratingDevices ? 'Checking...' : 'Check Available Cameras' }}
        </button>

        <div v-if="cameras.length > 0" class="space-y-2">
          <div v-for="(camera, index) in cameras" :key="index" class="p-3 bg-gray-50 rounded">
            <div class="font-medium">{{ camera.label || `Camera ${index + 1}` }}</div>
            <div class="text-sm text-gray-600">ID: {{ camera.deviceId.substring(0, 20) }}...</div>
          </div>
        </div>

        <div v-else-if="cameras.length === 0 && enumeratedDevices" class="text-gray-600">
          No cameras found
        </div>
      </div>

      <!-- Scanner Test Options -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Test Scanner Components</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            @click="testQuaggaJS"
            class="btn btn-primary"
          >
            Test QuaggaJS Scanner
          </button>
          <button
            @click="testZXing"
            class="btn btn-secondary"
          >
            Test ZXing Scanner
          </button>
        </div>
      </div>

      <!-- Log Output -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Debug Log</h2>
        <div class="max-h-64 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
          <div v-for="(log, index) in debugLogs" :key="index" class="mb-1">
            [{{ log.timestamp }}] {{ log.level }}: {{ log.message }}
          </div>
        </div>
        <button
          @click="clearLogs"
          class="btn btn-ghost mt-2"
        >
          Clear Logs
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ScannerDebug',
  setup() {
    const router = useRouter()

    // State
    const systemInfo = reactive({
      userAgent: '',
      isMobile: false,
      isHTTPS: false,
      isPWA: false,
      hasMediaDevices: false,
      hasGetUserMedia: false,
      isSecureContext: false
    })

    const testingCamera = ref(false)
    const cameraTestResult = ref(null)
    const enumeratingDevices = ref(false)
    const enumeratedDevices = ref(false)
    const cameras = ref([])
    const debugLogs = ref([])

    // Utility functions
    const addLog = (level, message) => {
      const timestamp = new Date().toLocaleTimeString()
      debugLogs.value.push({ timestamp, level: level.toUpperCase(), message })
    //   console.log(`[${timestamp}] ${level}: ${message}`)
    }

    const clearLogs = () => {
      debugLogs.value = []
    }

    // System info collection
    const collectSystemInfo = () => {
      systemInfo.userAgent = navigator.userAgent
      systemInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.matchMedia('(max-width: 768px)').matches ||
                           window.matchMedia('(pointer: coarse)').matches ||
                           ('ontouchstart' in window)
      systemInfo.isHTTPS = location.protocol === 'https:'
      systemInfo.isPWA = window.matchMedia('(display-mode: standalone)').matches
      systemInfo.hasMediaDevices = !!navigator.mediaDevices
      systemInfo.hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia
      systemInfo.isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost'

      addLog('info', 'System information collected')
      addLog('info', `Mobile: ${systemInfo.isMobile}, HTTPS: ${systemInfo.isHTTPS}, PWA: ${systemInfo.isPWA}`)
    }

    // Camera permission test
    const testCameraPermission = async () => {
      testingCamera.value = true
      cameraTestResult.value = null

      try {
        addLog('info', 'Testing camera permission...')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        // Success - stop the stream immediately
        stream.getTracks().forEach(track => track.stop())

        cameraTestResult.value = { success: true }
        addLog('success', 'Camera permission granted successfully')

      } catch (error) {
        addLog('error', `Camera permission failed: ${error.name} - ${error.message}`)
        cameraTestResult.value = {
          success: false,
          error: `${error.name}: ${error.message}`
        }
      } finally {
        testingCamera.value = false
      }
    }

    // Enumerate devices
    const enumerateDevices = async () => {
      enumeratingDevices.value = true

      try {
        addLog('info', 'Enumerating devices...')

        const devices = await navigator.mediaDevices.enumerateDevices()
        cameras.value = devices.filter(device => device.kind === 'videoinput')
        enumeratedDevices.value = true

        addLog('info', `Found ${cameras.value.length} camera(s)`)
        cameras.value.forEach((camera, index) => {
          addLog('info', `Camera ${index + 1}: ${camera.label || 'Unknown'} (${camera.deviceId.substring(0, 10)}...)`)
        })

      } catch (error) {
        addLog('error', `Failed to enumerate devices: ${error.message}`)
      } finally {
        enumeratingDevices.value = false
      }
    }

    // Test QuaggaJS scanner
    const testQuaggaJS = async () => {
      try {
        addLog('info', 'Testing QuaggaJS scanner...')

        // Try to import QuaggaJS
        const quaggaModule = await import('quagga')
        const Quagga = quaggaModule.default

        if (Quagga) {
          addLog('success', 'QuaggaJS loaded successfully')
          // Navigate to scanner with QuaggaJS
          router.push('/scan?scanner=quagga')
        } else {
          throw new Error('QuaggaJS failed to load')
        }

      } catch (error) {
        addLog('error', `QuaggaJS test failed: ${error.message}`)
      }
    }

    // Test ZXing scanner
    const testZXing = async () => {
      try {
        addLog('info', 'Testing ZXing scanner...')

        // Try to import ZXing
        const { BrowserMultiFormatReader } = await import('@zxing/browser')

        if (BrowserMultiFormatReader) {
          addLog('success', 'ZXing loaded successfully')
          // Navigate to scanner with ZXing
          router.push('/scan?scanner=zxing')
        } else {
          throw new Error('ZXing failed to load')
        }

      } catch (error) {
        addLog('error', `ZXing test failed: ${error.message}`)
      }
    }

    // Initialize
    onMounted(() => {
      collectSystemInfo()
    })

    return {
      systemInfo,
      testingCamera,
      cameraTestResult,
      enumeratingDevices,
      enumeratedDevices,
      cameras,
      debugLogs,

      // Methods
      testCameraPermission,
      enumerateDevices,
      testQuaggaJS,
      testZXing,
      clearLogs
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #4b5563;
  color: white;
}

.btn-secondary:hover {
  background-color: #374151;
}

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
