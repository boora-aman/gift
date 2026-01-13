// Service Worker update handler
import { Workbox } from 'workbox-window'

let wb
let registration
let showSkipWaitingPrompt

const showUpdatePrompt = () => {
  // This function will be called when an update is available
  const event = new CustomEvent('sw-update-available', {
    detail: { wb, registration }
  })
  window.dispatchEvent(event)
}

if ('serviceWorker' in navigator) {
  wb = new Workbox('/sw.js', { scope: '/' })

  // Listen for waiting service worker
  wb.addEventListener('waiting', (event) => {
    showSkipWaitingPrompt = event
    showUpdatePrompt()
  })

  // Listen for controlling service worker
  wb.addEventListener('controlling', (event) => {
    // Service worker is now controlling the page, reload
    window.location.reload()
  })

  // Register service worker
  wb.register().then((reg) => {
    registration = reg
    // console.log('Service Worker registered successfully')
  }).catch((err) => {
    // console.warn('Service Worker registration failed:', err)
  })

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'SKIP_WAITING':
          showUpdatePrompt()
          break
        case 'CACHE_UPDATED':
          // Cache has been updated
        //   console.log('App cache updated')
          break
      }
    }
  })
}

// Function to skip waiting and activate new service worker
export const skipWaiting = () => {
  if (showSkipWaitingPrompt) {
    wb.addEventListener('controlling', () => {
      window.location.reload()
    })

    wb.messageSkipWaiting()
  }
}

// Function to check for updates manually
export const checkForUpdates = async () => {
  if (registration) {
    try {
      await registration.update()
    } catch (error) {
      console.warn('Manual update check failed:', error)
    }
  }
}

// Function to get registration info
export const getRegistration = () => registration

// Function to show update available notification
export const onUpdateAvailable = (callback) => {
  window.addEventListener('sw-update-available', callback)
}

// Function to remove update available listener
export const offUpdateAvailable = (callback) => {
  window.removeEventListener('sw-update-available', callback)
}
