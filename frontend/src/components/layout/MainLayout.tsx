import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const isMobile = useIsMobile()

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path.startsWith('/gifts')) {
      if (path === '/gifts') return 'Gifts'
      if (path === '/gifts/new') return 'New Gift'
      return 'Gift Details'
    }
    if (path.startsWith('/categories')) {
      if (path === '/categories') return 'Categories'
      if (path === '/categories/new') return 'New Category'
      return 'Category Details'
    }
    if (path.startsWith('/recipients')) {
      if (path === '/recipients') return 'Recipients'
      if (path === '/recipients/new') return 'New Recipient'
      return 'Recipient Details'
    }
    if (path.startsWith('/issues')) return 'Gift Issues'
    if (path.startsWith('/interests')) return 'Gift Interests'
    if (path.startsWith('/events')) return 'Events'
    if (path.startsWith('/dispatch')) return 'Dispatch'
    if (path.startsWith('/maintenance')) return 'Maintenance'
    if (path.startsWith('/receipts')) return 'Receipts'
    if (path.startsWith('/profile')) return 'Profile'
    if (path.startsWith('/notifications')) return 'Notifications'
    return 'Gift Management'
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Mobile Navigation Drawer */}
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            title={getPageTitle()} 
            onMenuClick={() => isMobile ? setMobileNavOpen(true) : setSidebarOpen(!sidebarOpen)} 
          />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
