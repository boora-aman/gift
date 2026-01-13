import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Route components (some eager loaded, others lazy loaded)
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import GiftList from '../views/GiftList.vue'
import GiftIssueList from '../views/GiftIssueList.vue'
import Profile from '../views/Profile.vue'

// Lazy loaded components
const GiftDetail = () => import('../views/gifts/GiftDetail.vue')
const GiftCreate = () => import('../views/gifts/GiftCreate.vue')
const GiftEdit = () => import('../views/gifts/GiftEdit.vue')

const IssueDetail = () => import('../views/issues/IssueDetail.vue')
const IssueCreate = () => import('../views/issues/IssueCreate.vue')

const Scanner = () => import('../views/Scanner.vue')
const GiftIssueFlow = () => import('../views/scan/GiftIssueFlow.vue')
const NotFound = () => import('../views/errors/NotFound.vue')
const Offline = () => import('../views/errors/Offline.vue')

const routes = [
  // Root redirect to dashboard (default page after login)
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      icon: 'home',
      showInNavigation: true,
      mobileTabOrder: 0 // Ensures Dashboard is first in navigation
    }
  },

  // Auth routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Login',
      hideNavigation: true
    }
  },

  // Gift routes
  {
    path: '/gifts',
    name: 'Gifts',
    component: GiftList,
    meta: {
      requiresAuth: true,
      title: 'Gift Inventory',
      icon: 'gift',
      showInNavigation: true,
      mobileTabOrder: 1
    }
  },
  {
    path: '/gifts/new',
    name: 'GiftCreate',
    component: GiftCreate,
    meta: {
      requiresAuth: true,
      title: 'Add New Gift',
      parentRoute: 'Gifts',
      hideNavigation: false,
      requiresRole: ['Admin', 'Event Manager']
    }
  },
  {
    path: '/gifts/:id',
    name: 'GiftDetail',
    component: GiftDetail,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Gift Details',
      parentRoute: 'Gifts',
      hideNavigation: false
    }
  },
  {
    path: '/gifts/:id/edit',
    name: 'GiftEdit',
    component: GiftEdit,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Edit Gift',
      parentRoute: 'Gifts',
      hideNavigation: false,
      requiresRole: ['Admin', 'Event Manager']
    }
  },

  // Gift Dispatch routes
  {
    path: '/issues',
    name: 'Dispatches',
    component: GiftIssueList,
    meta: {
      requiresAuth: true,
      title: 'Gift Dispatch',
      icon: 'document-text',
      showInNavigation: true,
      mobileTabOrder: 2
    }
  },
  {
    path: '/issues/new',
    name: 'IssueCreate',
    component: IssueCreate,
    meta: {
      requiresAuth: true,
      title: 'Dispatch Gift',
      parentRoute: 'Dispatches',
      hideNavigation: false
    }
  },
  {
    path: '/issues/:id',
    name: 'IssueDetail',
    component: IssueDetail,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Dispatch Details',
      parentRoute: 'Dispatches',
      hideNavigation: false
    }
  },

  // Scanner route
  {
    path: '/scan',
    name: 'Scanner',
    component: Scanner,
    meta: {
      requiresAuth: true,
      title: 'Scan',
      icon: 'qr-code',
      showInNavigation: true,
      mobileTabOrder: 3,
      isScanButton: true, // Special flag for center scan button
      requiresRole: ['Admin', 'Event Manager', 'Event Coordinator']
    }
  },

  // Scanner Debug route
  {
    path: '/scan/debug',
    name: 'ScannerDebug',
    component: () => import('../views/ScannerDebug.vue'),
    meta: {
      requiresAuth: true,
      title: 'Scanner Debug',
      parentRoute: 'Scanner',
      hideNavigation: false,
      requiresRole: ['Admin', 'Event Manager']
    }
  },

  // Gift Dispatch Flow routes
  {
    path: '/scan/gift/:id',
    name: 'GiftIssueFlow',
    component: GiftIssueFlow,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Dispatch Gift',
      parentRoute: 'Scanner',
      hideNavigation: true,
      requiresRole: ['Admin', 'Event Manager', 'Event Coordinator']
    }
  },

  // Profile route
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true,
      title: 'My Profile',
      icon: 'user',
      showInNavigation: true,
      mobileTabOrder: 5
    }
  },

  // Reports route
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/reports/Reports.vue'),
    meta: {
      requiresAuth: true,
      title: 'Reports',
      icon: 'document-chart-bar',
      showInNavigation: true,
      showInMobileNavigation: false,
      mobileTabOrder: 4
    }
  },

  // Settings route - Hidden in PWA
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/settings/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: 'Settings',
      icon: 'cog-6-tooth',
      showInNavigation: true,
      showInMobileNavigation: false,
      hideInPWA: true,
      mobileTabOrder: 5
    }
  },
  {
    path: '/settings/categories',
    name: 'CategoryManagement',
    component: () => import('../views/settings/CategoryManagement.vue'),
    meta: {
      requiresAuth: true,
      title: 'Category Management',
      parentRoute: 'Settings',
      hideNavigation: false,
      hideInPWA: true
    }
  },
  {
    path: '/settings/users',
    name: 'UserManagement',
    component: () => import('../views/settings/UserManagement.vue'),
    meta: {
      requiresAuth: true,
      title: 'User Management',
      parentRoute: 'Settings',
      hideNavigation: false,
      hideInPWA: true
    }
  },
  {
    path: '/settings/gift-recipients',
    name: 'GiftRecipientManagement',
    component: () => import('../views/settings/GiftRecipientManagement.vue'),
    meta: {
      requiresAuth: true,
      title: 'Gift Recipient Management',
      parentRoute: 'Settings',
      hideNavigation: false,
      hideInPWA: true
    }
  },
  {
    path: '/reports/barcode-print',
    name: 'BarcodeReport',
    component: () => import('../views/reports/BarcodeReport.vue'),
    meta: {
      requiresAuth: true,
      title: 'Barcode Print Report',
      parentRoute: 'Reports',
      hideNavigation: false
    }
  },
  {
    path: '/reports/interest-shows',
    name: 'InterestShowsReport',
    component: () => import('../views/reports/InterestShowsReport.vue'),
    meta: {
      requiresAuth: true,
      title: 'Interest Shows Report',
      parentRoute: 'Reports',
      hideNavigation: false
    }
  },
  {
    path: '/reports/dispatched-gifts',
    name: 'DispatchedGiftsReport',
    component: () => import('../views/reports/DispatchedGiftsReport.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dispatched Gifts Report',
      parentRoute: 'Reports',
      hideNavigation: false
    }
  },
  {
    path: '/reports/pending-delivery',
    name: 'PendingDeliveryReport',
    component: () => import('../views/reports/PendingDeliveryReport.vue'),
    meta: {
      requiresAuth: true,
      title: 'Pending Delivery Report',
      parentRoute: 'Reports',
      hideNavigation: false
    }
  },

  // Error routes
  {
    path: '/offline',
    name: 'Offline',
    component: Offline,
    meta: {
      requiresAuth: false,
      title: 'Offline',
      hideNavigation: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      requiresAuth: false,
      title: 'Page Not Found',
      hideNavigation: true
    }
  }
]

const router = createRouter({
  history: createWebHistory('/gift/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top for new pages
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Gift Management`
  } else {
    document.title = 'Gift Management'
  }

  // If going to login page
  if (to.name === 'Login') {
    // Check if already authenticated - redirect to dashboard if so
    if (authStore.isAuthenticated) {
      next('/')
      return
    } else {
      // Allow access to login page
      next()
      return
    }
  }

  // For all other routes that require authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Try to restore auth from storage first
      const restored = await authStore.checkAuth()

      if (!restored || !authStore.isAuthenticated) {
        next('/login')
        return
      }
    }

    // Role-based route protection
    // Check if user role needs to be loaded
    if (authStore.isAuthenticated && !authStore.userRole) {
      await authStore.loadUserRole()
    }

    // Check if route requires specific roles
    if (to.meta.requiresRole && Array.isArray(to.meta.requiresRole)) {
      const userRole = authStore.userRole
      // If no role assigned, allow access; otherwise check role requirements
      const canAccess = !userRole || to.meta.requiresRole.includes(userRole)

      if (!canAccess) {
        // Redirect to appropriate page with access denied message
        const redirectTarget = to.meta.parentRoute || 'Dashboard'
        next({
          name: redirectTarget,
          query: {
            access_denied: 'true',
            message: `Access denied: ${to.meta.requiresRole.join(' or ')} role required`
          }
        })
        return
      }
    }
  }

  // Check for offline status and redirect if necessary
  if (!navigator.onLine && to.name !== 'Offline' && to.meta.requiresAuth) {
    // Allow cached routes but show offline indicator
    // Don't redirect to offline page unless it's a critical navigation
  }

  next()
})

router.afterEach((to, from) => {
  // Track navigation for analytics (optional)
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_TRACKING_ID', {
      page_title: to.meta.title,
      page_location: to.fullPath
    })
  }

  // Update meta viewport for certain pages
  if (to.name === 'Scanner') {
    // Ensure proper viewport for scanner
    let viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0')
    }
  }
})

// Helper function to detect if app is running in PWA mode
export function isPWAMode() {
  // Check if running in standalone mode (PWA)
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Helper function to get navigation items for UI components
export function getNavigationItems() {
  const isPWA = isPWAMode()
  const authStore = useAuthStore()

  return routes
    .filter(route => {
      if (!route.meta?.showInNavigation) return false
      if (isPWA && route.meta?.hideInPWA) return false

      // Role-based filtering
      if (route.meta?.requiresRole && Array.isArray(route.meta.requiresRole)) {
        const userRole = authStore.userRole
        // If no role assigned, allow access; otherwise check role requirements
        const canAccess = !userRole || route.meta.requiresRole.includes(userRole)
        if (!canAccess) return false
      }

      return true
    })
    .sort((a, b) => {
      // Ensure Dashboard is always first, then sort by mobileTabOrder
      if (a.name === 'Dashboard') return -1
      if (b.name === 'Dashboard') return 1
      return (a.meta?.mobileTabOrder || 999) - (b.meta?.mobileTabOrder || 999)
    })
    .map(route => ({
      name: route.name,
      path: route.path,
      title: route.meta?.title,
      icon: route.meta?.icon,
      mobileTabOrder: route.meta?.mobileTabOrder,
      isScanButton: route.meta?.isScanButton
    }))
}

// Helper function to get mobile navigation items (bottom tab bar)
export function getMobileNavigationItems() {
  const isPWA = isPWAMode()
  const authStore = useAuthStore()

  return routes
    .filter(route => {
      // Use showInMobileNavigation if specified, otherwise fall back to showInNavigation
      const showInMobile = route.meta?.showInMobileNavigation !== undefined
        ? route.meta.showInMobileNavigation
        : route.meta?.showInNavigation

      if (!showInMobile) return false
      if (isPWA && route.meta?.hideInPWA) return false

      // Role-based filtering
      if (route.meta?.requiresRole && Array.isArray(route.meta.requiresRole)) {
        const userRole = authStore.userRole
        // If no role assigned, allow access; otherwise check role requirements
        const canAccess = !userRole || route.meta.requiresRole.includes(userRole)
        if (!canAccess) return false
      }

      return true
    })
    .sort((a, b) => {
      // Ensure Dashboard is always first, then sort by mobileTabOrder
      if (a.name === 'Dashboard') return -1
      if (b.name === 'Dashboard') return 1
      return (a.meta?.mobileTabOrder || 999) - (b.meta?.mobileTabOrder || 999)
    })
    .map(route => ({
      name: route.name,
      path: route.path,
      title: route.meta?.title,
      icon: route.meta?.icon,
      mobileTabOrder: route.meta?.mobileTabOrder,
      isScanButton: route.meta?.isScanButton
    }))
}

// Helper function to check if route is active
export function isRouteActive(routeName, currentRouteName, currentParentRoute) {
  if (currentRouteName === routeName) return true
  if (currentParentRoute === routeName) return true
  return false
}

export default router
