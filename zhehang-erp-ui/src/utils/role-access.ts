const PRIVILEGED_ROLE_KEYS = new Set(['admin', 'super_admin', 'sys_admin', 'boss'])

/**
 * 展开“模板角色__副本”继承关系。特权角色不允许通过复制角色名前缀继承，
 * 避免普通自定义角色伪装成老板或超级管理员。
 */
export function expandRoleKeys(roles: string[] = []): string[] {
  const expanded = new Set<string>()
  roles.forEach((role) => {
    if (!role) return
    expanded.add(role)
    const separator = role.indexOf('__')
    const base = separator > 0 ? role.slice(0, separator) : ''
    if (base && !PRIVILEGED_ROLE_KEYS.has(base)) expanded.add(base)
  })
  return Array.from(expanded)
}

/** 平台根账号或命中任一明确角色即可访问；空角色要求代表不额外限制。 */
export function hasRequiredRole(
  currentRoles: string[] = [],
  requiredRoles: string[] = [],
  userId?: number | string
): boolean {
  if (!requiredRoles.length) return true
  if (Number(userId) === 1) return true
  const roles = new Set(expandRoleKeys(currentRoles))
  return requiredRoles.some((role) => roles.has(role))
}

export function isOwnerRole(currentRoles: string[] = [], userId?: number | string): boolean {
  return hasRequiredRole(currentRoles, ['super_admin', 'boss'], userId)
}
