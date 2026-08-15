import { useUserStore } from '@/stores/user'

/**
 * Check if current user has specified permissions
 */
export function hasPermission(permissions: string[]): boolean {
  const userStore = useUserStore()
  const userPermissions = userStore.permissions
  const userRoles = userStore.roles
  const allPermission = '*:*:*'
  const superAdmin = 'admin'

  if (permissions && permissions.length > 0) {
    if (userRoles.includes(superAdmin)) {
      return true
    }
    return userPermissions.some((perm) => {
      return allPermission === perm || permissions.includes(perm)
    })
  }
  return false
}

/**
 * Check if current user has specified roles
 */
export function hasRole(roles: string[]): boolean {
  const userStore = useUserStore()
  const userRoles = userStore.roles
  const superAdmin = 'admin'

  if (roles && roles.length > 0) {
    return userRoles.some((role) => {
      return superAdmin === role || roles.includes(role)
    })
  }
  return false
}
