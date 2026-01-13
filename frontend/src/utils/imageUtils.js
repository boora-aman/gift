/**
 * Utility functions for handling images in Frappe
 * Handles both public and private files with proper authentication
 */

/**
 * Get the proper image URL for display in the frontend
 * Handles public files, private files, and external URLs
 * @param {string} imagePath - The image path from the backend
 * @returns {string} - The full URL to access the image
 */
export function getImageUrl(imagePath) {
  if (!imagePath) {
    return ''
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Check if it's already a proper API endpoint for private files
  if (imagePath.includes('/api/method/frappe.core.doctype.file.file.download_file')) {
    return imagePath
  }

  // Construct the base URL
  let baseUrl = ''
  if (import.meta.env.DEV) {
    baseUrl = 'http://localhost:8000'
  } else {
    baseUrl = window.location.origin
  }

  // If the path already starts with base URL, return as is
  if (imagePath.startsWith(baseUrl)) {
    return imagePath
  }

  // If it's a relative path starting with /, add base URL
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`
  }

  // For other cases, add base URL with /
  return `${baseUrl}/${imagePath}`
}

/**
 * Create an authenticated image element for private files
 * This function creates an img element that will handle authentication
 * @param {string} imageUrl - The image URL (can be private or public)
 * @param {Object} options - Options for the image element
 * @returns {Promise<string>} - Promise that resolves to a blob URL or the original URL
 */
export async function getAuthenticatedImageUrl(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  // If it's not a private file download URL, return as is
  if (!imageUrl.includes('/api/method/frappe.core.doctype.file.file.download_file')) {
    return imageUrl
  }

  try {
    // Fetch the image with credentials
    const response = await fetch(imageUrl, {
      credentials: 'include', // Include session cookies
      headers: {
        'Accept': 'image/*',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Create a blob URL from the response
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Failed to fetch authenticated image:', error)
    return '' // Return empty string on error
  }
}

/**
 * Preload an image and return a promise
 * Useful for checking if an image loads successfully
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

/**
 * Check if an image URL is accessible
 * @param {string} imageUrl - The image URL to check
 * @returns {Promise<boolean>} - Promise that resolves to true if accessible
 */
export async function isImageAccessible(imageUrl) {
  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      credentials: 'include'
    })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Clean up blob URLs to prevent memory leaks
 * @param {string} blobUrl - The blob URL to clean up
 */
export function cleanupBlobUrl(blobUrl) {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl)
  }
}
