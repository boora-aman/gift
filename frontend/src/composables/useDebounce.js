import { ref } from 'vue'

export function useDebounce(fn, delay = 300) {
  let timeoutId = null
  
  return function debounced(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function useThrottle(fn, delay = 100) {
  let lastCall = 0
  
  return function throttled(...args) {
    const now = Date.now()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn.apply(this, args)
  }
}

// Debounced ref - useful for search inputs
export function useDebouncedRef(value, delay = 300) {
  const debouncedValue = ref(value)
  const { debounce } = useDebounce((newValue) => {
    debouncedValue.value = newValue
  }, delay)
  
  return {
    debouncedValue,
    setValue: debounce
  }
}
