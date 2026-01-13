/**
 * Audio feedback composable for scanner operations
 * Provides sound effects for scan success, errors, and detection events
 */

import { ref, reactive, readonly } from 'vue'

// Audio context for Web Audio API (more reliable for mobile)
let audioContext = null
let gainNode = null

// Fallback audio elements for broader compatibility
const audioElements = reactive({
  success: null,
  error: null,
  beep: null
})

// Settings
const audioSettings = reactive({
  enabled: true,
  volume: 0.7,
  useWebAudio: true // Prefer Web Audio API for better mobile support
})

// Audio buffer cache for Web Audio API
const audioBuffers = reactive({
  success: null,
  error: null,
  beep: null
})

/**
 * Initialize audio context and create sounds programmatically
 */
const initializeAudioContext = async () => {
  try {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Create gain node for volume control
    gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
    gainNode.gain.value = audioSettings.volume
    
    // Create audio buffers for different sounds
    await Promise.all([
      createSuccessSound(),
      createErrorSound(),
      createBeepSound()
    ])
    
    console.log('Scanner audio context initialized successfully')
    return true
    
  } catch (error) {
    console.warn('Failed to initialize Web Audio API:', error)
    audioSettings.useWebAudio = false
    await initializeFallbackAudio()
    return false
  }
}

/**
 * Create success sound buffer (pleasant chirp)
 */
const createSuccessSound = async () => {
  if (!audioContext) return
  
  try {
    const sampleRate = audioContext.sampleRate
    const duration = 0.3 // 300ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a pleasant success sound (rising tone)
    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const frequency1 = 600 + (200 * time) // Rising from 600Hz to 800Hz
      const frequency2 = 800 + (300 * time) // Rising from 800Hz to 1100Hz
      
      const envelope = Math.exp(-time * 3) // Exponential decay
      const wave1 = Math.sin(2 * Math.PI * frequency1 * time)
      const wave2 = Math.sin(2 * Math.PI * frequency2 * time) * 0.5
      
      channelData[i] = (wave1 + wave2) * envelope * 0.3
    }
    
    audioBuffers.success = buffer
  } catch (error) {
    console.warn('Failed to create success sound:', error)
  }
}

/**
 * Create error sound buffer (low warning tone)
 */
const createErrorSound = async () => {
  if (!audioContext) return
  
  try {
    const sampleRate = audioContext.sampleRate
    const duration = 0.5 // 500ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a warning error sound (low frequency with slight modulation)
    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const frequency = 200 + (50 * Math.sin(time * 8)) // Modulated around 200Hz
      
      const envelope = Math.exp(-time * 2) // Slower decay
      const wave = Math.sin(2 * Math.PI * frequency * time)
      
      channelData[i] = wave * envelope * 0.4
    }
    
    audioBuffers.error = buffer
  } catch (error) {
    console.warn('Failed to create error sound:', error)
  }
}

/**
 * Create beep sound buffer (short detection beep)
 */
const createBeepSound = async () => {
  if (!audioContext) return
  
  try {
    const sampleRate = audioContext.sampleRate
    const duration = 0.1 // 100ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Create a short beep sound
    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate
      const frequency = 1000 // 1kHz tone
      
      const envelope = Math.sin(Math.PI * time / duration) // Bell curve envelope
      const wave = Math.sin(2 * Math.PI * frequency * time)
      
      channelData[i] = wave * envelope * 0.2
    }
    
    audioBuffers.beep = buffer
  } catch (error) {
    console.warn('Failed to create beep sound:', error)
  }
}

/**
 * Initialize fallback HTML5 audio elements
 */
const initializeFallbackAudio = async () => {
  try {
    // Create data URLs for audio (simple beep sounds)
    const createBeepDataURL = (frequency, duration) => {
      const sampleRate = 8000
      const samples = Math.floor(sampleRate * duration)
      const buffer = new ArrayBuffer(44 + samples * 2)
      const view = new DataView(buffer)
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + samples * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, samples * 2, true)
      
      // Audio data
      let offset = 44
      for (let i = 0; i < samples; i++) {
        const time = i / sampleRate
        const envelope = Math.exp(-time * 4)
        const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.3
        view.setInt16(offset, sample * 32767, true)
        offset += 2
      }
      
      return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)))
    }
    
    // Create audio elements
    audioElements.success = new Audio(createBeepDataURL(800, 0.3))
    audioElements.error = new Audio(createBeepDataURL(300, 0.5))
    audioElements.beep = new Audio(createBeepDataURL(1000, 0.1))
    
    // Set volume
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        audio.volume = audioSettings.volume
        audio.preload = 'auto'
      }
    })
    
    console.log('Scanner fallback audio initialized')
    return true
    
  } catch (error) {
    console.warn('Failed to initialize fallback audio:', error)
    return false
  }
}

/**
 * Play sound using Web Audio API
 */
const playWebAudioSound = (bufferName) => {
  if (!audioContext || !audioBuffers[bufferName] || !gainNode) {
    return false
  }
  
  try {
    // Resume audio context if suspended (required for mobile browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffers[bufferName]
    source.connect(gainNode)
    source.start(0)
    
    return true
  } catch (error) {
    console.warn('Failed to play Web Audio sound:', error)
    return false
  }
}

/**
 * Play sound using HTML5 Audio (fallback)
 */
const playFallbackSound = (soundName) => {
  const audio = audioElements[soundName]
  if (!audio) return false
  
  try {
    audio.currentTime = 0 // Reset to beginning
    const playPromise = audio.play()
    
    if (playPromise) {
      playPromise.catch(error => {
        console.warn('Failed to play fallback audio:', error)
      })
    }
    
    return true
  } catch (error) {
    console.warn('Failed to play fallback audio:', error)
    return false
  }
}

/**
 * Main audio playback function
 */
const playSound = (soundType) => {
  if (!audioSettings.enabled) return false
  
  try {
    // Try Web Audio first, then fallback
    if (audioSettings.useWebAudio && audioContext) {
      if (playWebAudioSound(soundType)) {
        return true
      }
    }
    
    // Fallback to HTML5 Audio
    return playFallbackSound(soundType)
    
  } catch (error) {
    console.warn('Failed to play sound:', error)
    return false
  }
}

/**
 * Composable hook
 */
export const useScannerAudio = () => {
  const isInitialized = ref(false)
  const isInitializing = ref(false)
  
  /**
   * Initialize audio system
   */
  const initialize = async () => {
    if (isInitialized.value || isInitializing.value) {
      return isInitialized.value
    }
    
    isInitializing.value = true
    
    try {
      // Try Web Audio API first
      const webAudioSuccess = await initializeAudioContext()
      
      // Always initialize fallback for reliability
      await initializeFallbackAudio()
      
      isInitialized.value = true
      return true
      
    } catch (error) {
      console.error('Failed to initialize scanner audio:', error)
      return false
    } finally {
      isInitializing.value = false
    }
  }
  
  /**
   * Play success sound (scan successful)
   */
  const playSuccessSound = () => {
    return playSound('success')
  }
  
  /**
   * Play error sound (scan failed)
   */
  const playErrorSound = () => {
    return playSound('error')
  }
  
  /**
   * Play detection beep (barcode detected)
   */
  const playDetectionBeep = () => {
    return playSound('beep')
  }
  
  /**
   * Enable/disable audio
   */
  const setEnabled = (enabled) => {
    audioSettings.enabled = enabled
  }
  
  /**
   * Set volume (0.0 to 1.0)
   */
  const setVolume = (volume) => {
    audioSettings.volume = Math.max(0, Math.min(1, volume))
    
    // Update gain node if using Web Audio
    if (gainNode) {
      gainNode.gain.value = audioSettings.volume
    }
    
    // Update fallback audio elements
    Object.values(audioElements).forEach(audio => {
      if (audio) {
        audio.volume = audioSettings.volume
      }
    })
  }
  
  /**
   * Resume audio context (required after user interaction on mobile)
   */
  const resumeAudioContext = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume()
        console.log('Audio context resumed')
        return true
      } catch (error) {
        console.warn('Failed to resume audio context:', error)
        return false
      }
    }
    return true
  }
  
  return {
    // State
    isInitialized: readonly(isInitialized),
    isInitializing: readonly(isInitializing),
    
    // Methods
    initialize,
    playSuccessSound,
    playErrorSound,
    playDetectionBeep,
    setEnabled,
    setVolume,
    resumeAudioContext,
    
    // Settings (reactive)
    settings: readonly(audioSettings)
  }
}

// Export for direct use
export default useScannerAudio