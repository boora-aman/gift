import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { AuthAPI } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'

export function RequireAuth() {
  const location = useLocation()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      // First check localStorage for cached user
      const cachedUser = localStorage.getItem('frappe_user')
      
      // Verify session is still valid with backend
      const res = await AuthAPI.getLoggedUser()
      if (res.success && res.data && res.data !== 'Guest') {
        return res.data
      }
      
      // Clear cached data if session invalid
      localStorage.removeItem('frappe_user')
      localStorage.removeItem('frappe_fullname')
      throw new Error(res.error || 'Not logged in')
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="py-10 text-center text-muted-foreground">Loading session…</CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
