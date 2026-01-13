import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import router from './router'
import App from './App.vue'
import './styles/main.css'

// Import PWA update functionality
if ('serviceWorker' in navigator) {
	import('./utils/sw-update.js')
}

// Create Vue app
const app = createApp(App)

// Add global properties
app.config.globalProperties.$isMobile = () => window.innerWidth <= 768
app.config.globalProperties.$isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024
app.config.globalProperties.$isDesktop = () => window.innerWidth > 1024

// Use plugins
const pinia = createPinia()
app.use(pinia)

// Bootstrap: block mount until auth check completes to avoid pre-mount API calls
async function bootstrap() {
	try {
		const authStore = useAuthStore(pinia)
		const BASE = '/gift'
		const path = window.location.pathname
		const isUnderApp = path === BASE || path === `${BASE}/` || path.startsWith(`${BASE}/`)
		const isLogin = path.startsWith(`${BASE}/login`)
		const isOffline = path.startsWith(`${BASE}/offline`)

		if (isUnderApp && !isLogin && !isOffline) {
			// Always validate against server on load to catch invalid sessions
			const restored = await authStore.checkAuth()
			if (!restored || !authStore.isAuthenticated) {
				window.location.replace(`${BASE}/login`)
				return // Stop bootstrap, we'll navigate away
			}
		}
	} catch (e) {
		// On failure, fall through to app load; router guard will still protect
	}

	// Register router and mount only after auth check
	app.use(router)
	app.mount('#app')

	// Hide loading screen after app mounts
	const loadingScreen = document.getElementById('loading-screen')
	if (loadingScreen) {
		setTimeout(() => {
			loadingScreen.classList.add('hidden')
			setTimeout(() => {
				loadingScreen.remove()
			}, 300)
		}, 500)
	}
}

bootstrap()
