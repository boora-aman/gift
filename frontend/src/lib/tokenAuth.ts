// Token-based authentication helpers for Frappe API
// Use this when cookie-based auth fails due to SameSite/cross-origin issues

const TOKEN_KEY = 'frappe_api_key'
const SECRET_KEY = 'frappe_api_secret'

export interface TokenAuth {
  apiKey: string
  apiSecret: string
}

export const getTokenAuth = (): TokenAuth | null => {
  const apiKey = localStorage.getItem(TOKEN_KEY)
  const apiSecret = localStorage.getItem(SECRET_KEY)
  
  if (apiKey && apiSecret) {
    return { apiKey, apiSecret }
  }
  return null
}

export const setTokenAuth = (apiKey: string, apiSecret: string): void => {
  localStorage.setItem(TOKEN_KEY, apiKey)
  localStorage.setItem(SECRET_KEY, apiSecret)
}

export const clearTokenAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SECRET_KEY)
}

export const hasTokenAuth = (): boolean => {
  return getTokenAuth() !== null
}

export const getAuthHeader = (): string | null => {
  const token = getTokenAuth()
  if (token) {
    return `token ${token.apiKey}:${token.apiSecret}`
  }
  return null
}
