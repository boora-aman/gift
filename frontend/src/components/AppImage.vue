<template>
  <div class="relative" :class="containerClass">
    <!-- Loading placeholder -->
    <div v-if="loading" class="absolute inset-0 bg-gray-100 animate-pulse rounded flex items-center justify-center"
      :class="placeholderClass">
      <div class="w-6 h-6 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Error placeholder -->
    <div v-else-if="error && showErrorPlaceholder"
      class="absolute inset-0 bg-gray-50 rounded flex items-center justify-center border-2 border-dashed border-gray-200"
      :class="placeholderClass">
      <div class="text-center">
        <div class="w-8 h-8 text-gray-400 mx-auto mb-2">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-xs text-gray-500">Failed to load</p>
      </div>
    </div>

    <!-- Actual image -->
    <img v-show="!loading && !error" :src="displayUrl" :alt="alt" :class="imageClass" @load="onLoad" @error="onError"
      :style="imageStyle" />

    <!-- Default content slot -->
    <slot v-if="error && !showErrorPlaceholder" name="error" :error="error" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { getImageUrl, getAuthenticatedImageUrl, cleanupBlobUrl } from '../utils/imageUtils'

export default {
  name: 'AppImage',
  props: {
    src: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: 'w-full h-full object-cover'
    },
    containerClass: {
      type: String,
      default: ''
    },
    placeholderClass: {
      type: String,
      default: ''
    },
    showErrorPlaceholder: {
      type: Boolean,
      default: true
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const loading = ref(true)
    const error = ref(false)
    const displayUrl = ref('')
    const blobUrl = ref('')

    const loadImage = async () => {
      if (!props.src) {
        loading.value = false
        error.value = true
        return
      }

      loading.value = true
      error.value = false

      try {
        // Clean up any existing blob URL
        if (blobUrl.value) {
          cleanupBlobUrl(blobUrl.value)
          blobUrl.value = ''
        }

        // Get the proper image URL
        const imageUrl = getImageUrl(props.src)

        // Check if it's a private file that needs authentication
        if (imageUrl.includes('/api/method/frappe.core.doctype.file.file.download_file')) {
          // Get authenticated image URL (blob URL)
          const authenticatedUrl = await getAuthenticatedImageUrl(imageUrl)
          if (authenticatedUrl) {
            displayUrl.value = authenticatedUrl
            if (authenticatedUrl.startsWith('blob:')) {
              blobUrl.value = authenticatedUrl
            }
          } else {
            throw new Error('Failed to load private image')
          }
        } else {
          // Use the image URL directly for public files
          displayUrl.value = imageUrl
        }
      } catch (err) {
        console.error('Error loading image:', err)
        error.value = true
        loading.value = false
        emit('error', err)
      }
    }

    const onLoad = () => {
      loading.value = false
      error.value = false
      emit('load')
    }

    const onError = (event) => {
      loading.value = false
      error.value = true
      emit('error', event)
    }

    // Watch for src changes
    watch(() => props.src, () => {
      loadImage()
    })

    onMounted(() => {
      loadImage()
    })

    onUnmounted(() => {
      // Clean up blob URL on unmount
      if (blobUrl.value) {
        cleanupBlobUrl(blobUrl.value)
      }
    })

    return {
      loading,
      error,
      displayUrl,
      onLoad,
      onError
    }
  }
}
</script>
