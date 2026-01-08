// Role permission definitions
export type AppRole = 'admin' | 'event_manager'

export interface RolePermissions {
  canAccessCategories: boolean
  canAccessReports: boolean
  canAccessMaintenance: boolean
  canManageUsers: boolean
}

export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  admin: {
    canAccessCategories: true,
    canAccessReports: true,
    canAccessMaintenance: true,
    canManageUsers: true,
  },
  event_manager: {
    canAccessCategories: false,
    canAccessReports: false,
    canAccessMaintenance: false,
    canManageUsers: false,
  },
}

// Default permissions for unknown roles (restrictive)
export const DEFAULT_PERMISSIONS: RolePermissions = {
  canAccessCategories: false,
  canAccessReports: false,
  canAccessMaintenance: false,
  canManageUsers: false,
}

// Normalize role name for lookup (lowercase, spaces to underscores)
function normalizeRoleName(role: string): string {
  return role.toLowerCase().replace(/\s+/g, '_')
}

// Get permissions for a role
export function getPermissionsForRole(role: string): RolePermissions {
  const normalizedRole = normalizeRoleName(role)
  
  // Handle multiple admin role variants
  if (['admin', 'administrator', 'system_manager'].includes(normalizedRole)) {
    return ROLE_PERMISSIONS['admin']
  }
  
  if (normalizedRole in ROLE_PERMISSIONS) {
    return ROLE_PERMISSIONS[normalizedRole as AppRole]
  }
  
  return DEFAULT_PERMISSIONS
}

// Merge permissions from multiple roles (most permissive wins)
export function mergePermissions(roles: string[]): RolePermissions {
  const merged: RolePermissions = { ...DEFAULT_PERMISSIONS }
  
  for (const role of roles) {
    const perms = getPermissionsForRole(role)
    merged.canAccessCategories = merged.canAccessCategories || perms.canAccessCategories
    merged.canAccessReports = merged.canAccessReports || perms.canAccessReports
    merged.canAccessMaintenance = merged.canAccessMaintenance || perms.canAccessMaintenance
    merged.canManageUsers = merged.canManageUsers || perms.canManageUsers
  }
  
  return merged
}
