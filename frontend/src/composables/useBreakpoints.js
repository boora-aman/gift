import { ref, onMounted, onUnmounted } from 'vue'

// Breakpoint values based on Tailwind CSS defaults
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useBreakpoints() {
  const windowWidth = ref(window.innerWidth)

  // Reactive breakpoint states
  const isMobile = ref(windowWidth.value < breakpoints.md)
  const isTablet = ref(windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = ref(windowWidth.value >= breakpoints.lg)
  const isSmall = ref(windowWidth.value < breakpoints.sm)
  const isMedium = ref(windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md)
  const isLarge = ref(windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl)
  const isXLarge = ref(windowWidth.value >= breakpoints.xl && windowWidth.value < breakpoints['2xl'])
  const is2XLarge = ref(windowWidth.value >= breakpoints['2xl'])

  const updateBreakpoints = () => {
    windowWidth.value = window.innerWidth
    
    isMobile.value = windowWidth.value < breakpoints.md
    isTablet.value = windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg
    isDesktop.value = windowWidth.value >= breakpoints.lg
    isSmall.value = windowWidth.value < breakpoints.sm
    isMedium.value = windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md
    isLarge.value = windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl
    isXLarge.value = windowWidth.value >= breakpoints.xl && windowWidth.value < breakpoints['2xl']
    is2XLarge.value = windowWidth.value >= breakpoints['2xl']
  }

  onMounted(() => {
    window.addEventListener('resize', updateBreakpoints)
    updateBreakpoints() // Initial call
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoints)
  })

  // Helper function to check if current width is greater than or equal to breakpoint
  const isGreaterOrEqual = (breakpoint) => {
    return windowWidth.value >= breakpoints[breakpoint]
  }

  // Helper function to check if current width is less than breakpoint
  const isLessThan = (breakpoint) => {
    return windowWidth.value < breakpoints[breakpoint]
  }

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    is2XLarge,
    isGreaterOrEqual,
    isLessThan,
    breakpoints
  }
}
