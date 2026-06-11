import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * v-hasPermi directive for button-level permission control
 * Usage: v-hasPermi="['system:user:add']"
 */
const hasPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions
    const roles = userStore.roles
    const allPermission = '*:*:*'
    const superAdmin = 'admin'

    if (value && value.length > 0) {
      // 兜底:后端尚未下发按钮权限码(permissions 为空)时,不删按钮,按菜单级角色控制即可;
      // 待为各角色配齐 sys_role_menu 按钮权限后,此处自动转为按权限码精确控制。
      const permissionsNotConfigured = !permissions || permissions.length === 0
      const hasPermission = permissionsNotConfigured || roles.includes(superAdmin) || permissions.some((perm: string) => {
        return allPermission === perm || value.includes(perm)
      })
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('v-hasPermi requires permission value, e.g. v-hasPermi="[\'system:user:add\']"')
    }
  }
}

/**
 * v-hasRole directive for role-level permission control
 * Usage: v-hasRole="['admin']"
 */
const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles
    const superAdmin = 'admin'

    if (value && value.length > 0) {
      const hasRoleFlag = roles.some((role: string) => {
        return superAdmin === role || value.includes(role)
      })
      if (!hasRoleFlag) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('v-hasRole requires role value, e.g. v-hasRole="[\'admin\']"')
    }
  }
}

export function setupPermissionDirective(app: App) {
  app.directive('hasPermi', hasPermi)
  app.directive('hasRole', hasRole)
}

export default { hasPermi, hasRole }
