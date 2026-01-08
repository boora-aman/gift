import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Gift,
  FolderOpen,
  Users,
  Send,
  Heart,
  Truck,
  Wrench,
  FileInput,
  Calendar,
  FileBarChart,
  Settings,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRole } from '@/contexts/RoleContext'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: 'canAccessCategories' | 'canAccessReports' | 'canAccessMaintenance'
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Gift Management',
    items: [
      { title: 'Gifts', href: '/gifts', icon: Gift },
      { title: 'Categories', href: '/categories', icon: FolderOpen, permission: 'canAccessCategories' },
      { title: 'Recipients', href: '/recipients', icon: Users },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Gift Issues', href: '/issues', icon: Send },
      { title: 'Gift Interests', href: '/interests', icon: Heart },
      { title: 'Events', href: '/events', icon: Calendar },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { title: 'Dispatch', href: '/dispatch', icon: Truck },
      { title: 'Maintenance', href: '/maintenance', icon: Wrench, permission: 'canAccessMaintenance' },
      { title: 'Receipts', href: '/receipts', icon: FileInput },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Reports', href: '/reports', icon: FileBarChart, permission: 'canAccessReports' },
    ],
  },
]

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation()
  const { hasPermission, isLoading } = useRole()

  // Filter nav groups based on permissions
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true
        return hasPermission(item.permission)
      }),
    }))
    .filter((group) => group.items.length > 0)

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">Gift Manager</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          {isLoading ? (
            <div className="px-4 py-2 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (
            <nav className="space-y-6 px-2">
              {filteredNavGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href))
                      
                      return (
                        <li key={item.href}>
                          <NavLink
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </ScrollArea>

        {/* Footer - Settings */}
        <div className="border-t border-sidebar-border p-2">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
