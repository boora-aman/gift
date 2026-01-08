import { useState } from 'react'
import { Menu, Bell, User, LogOut, ScanBarcode } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuthAPI, GiftSearchAPI } from '@/services/api'
import { toast } from 'sonner'
import { BarcodeScanner } from '@/components/BarcodeScanner'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [showScanner, setShowScanner] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await AuthAPI.getLoggedUser()
      if (res.success) return res.data
      return undefined
    },
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => AuthAPI.logout(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Logged out')
        navigate('/login', { replace: true })
      } else {
        toast.error(res.error || 'Logout failed')
      }
    },
    onError: () => toast.error('Logout failed'),
  })

  const initials = (user || 'User')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const handleBarcodeScanned = async (barcode: string) => {
    setShowScanner(false)
    toast.info(`Searching for: ${barcode}`)
    
    const result = await GiftSearchAPI.findByBarcode(barcode)
    
    if (result.success && result.data) {
      toast.success(`Found: ${result.data.gift_name}`)
      navigate(`/gifts/${result.data.name}`)
    } else {
      toast.error('Gift not found with this barcode')
    }
  }

  return (
    <>
      <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Barcode Scanner - prominent on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowScanner(true)}
            className="relative"
            aria-label="Scan Barcode"
          >
            <ScanBarcode className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
            aria-label="Notifications"
            asChild
          >
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">{user || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}
