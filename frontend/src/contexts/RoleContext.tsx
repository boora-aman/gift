import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserAPI } from '@/services/api'
import { mergePermissions, RolePermissions, DEFAULT_PERMISSIONS } from '@/config/permissions'

interface RoleContextType {
  roles: string[]
  permissions: RolePermissions
  isLoading: boolean
  isAdmin: boolean
  isEventManager: boolean
  hasPermission: (permission: keyof RolePermissions) => boolean
  refetchRoles: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<string[]>([])
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS)
  const [isInitialized, setIsInitialized] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const res = await UserAPI.getRoles()
      if (res.success && res.data) {
        return res.data
      }
      return []
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data !== undefined) {
      setRoles(data)
      setPermissions(mergePermissions(data))
      setIsInitialized(true)
    }
  }, [data])

  const isAdmin = roles.some(r => 
    r.toLowerCase() === 'admin' || 
    r.toLowerCase() === 'administrator' || 
    r.toLowerCase() === 'system manager'
  )
  const isEventManager = roles.some(r => r.toLowerCase() === 'event manager')

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    // Don't allow access until we've loaded roles at least once
    if (!isInitialized) return false
    return permissions[permission]
  }

  return (
    <RoleContext.Provider
      value={{
        roles,
        permissions,
        isLoading: isLoading || !isInitialized, // Consider uninitialized as loading
        isAdmin,
        isEventManager,
        hasPermission,
        refetchRoles: refetch,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
