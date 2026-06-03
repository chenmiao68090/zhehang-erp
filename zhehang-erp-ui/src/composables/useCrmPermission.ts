/**
 * useCrmPermission - CRM 权限组合式函数
 * 为 Vue 3 组件提供响应式的角色与权限检查能力
 */
import { computed, ref, watch } from 'vue'
import {
  type CrmPermission,
  type CrmRole,
  type CrmDataScope,
  getDataScope,
  getPermissions,
  hasPermission,
  maskPhone,
  maskWechat,
  permissionLabels,
  roleLabels,
} from '@/utils/crm-permission'

const STORAGE_KEY = 'crm_demo_role'

/**
 * 全局共享的当前角色状态
 * 使用 module-level ref 实现跨组件共享(无需引入 store)
 */
const currentRole = ref<CrmRole>(loadRoleFromStorage())
const currentUserId = ref<number>(1001)
const currentTeamId = ref<number>(1)

function loadRoleFromStorage(): CrmRole {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as CrmRole | null
    const valid: CrmRole[] = [
      'admin',
      'sales_manager',
      'telemarketing',
      'online_acquisition',
      'viewer',
    ]
    if (v && valid.includes(v)) return v
  } catch {
    /* ignore */
  }
  return 'telemarketing'
}

// 持久化角色变化
watch(currentRole, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val)
  } catch {
    /* ignore */
  }
})

export function useCrmPermission() {
  /** 检查是否拥有某权限点 */
  const can = (permission: CrmPermission): boolean =>
    hasPermission(currentRole.value, permission)

  /** 检查任意一个权限 */
  const canAny = (permissions: CrmPermission[]): boolean =>
    permissions.some((p) => hasPermission(currentRole.value, p))

  /** 检查全部权限 */
  const canAll = (permissions: CrmPermission[]): boolean =>
    permissions.every((p) => hasPermission(currentRole.value, p))

  /** 当前角色权限列表 */
  const permissions = computed<CrmPermission[]>(() =>
    getPermissions(currentRole.value),
  )

  /** 角色显示名 */
  const roleLabel = computed<string>(() => roleLabels[currentRole.value])

  /** 是否管理员 */
  const isAdmin = computed<boolean>(() => currentRole.value === 'admin')

  /** 是否主管(管理员或销售主管) */
  const isManager = computed<boolean>(() =>
    ['admin', 'sales_manager'].includes(currentRole.value),
  )

  /** 数据范围 */
  const dataScope = computed<CrmDataScope>(() => getDataScope(currentRole.value))

  /** 数据范围显示文案 */
  const dataScopeLabel = computed<string>(() => {
    switch (dataScope.value) {
      case 'all':
        return '全公司数据'
      case 'team':
        return '本团队数据'
      case 'self':
        return '个人数据'
      default:
        return '个人数据'
    }
  })

  /**
   * 格式化手机号(根据归属决定是否脱敏)
   */
  const formatPhone = (phone: string, isOwn = false): string => {
    if (!phone) return ''
    if (isAdmin.value || isOwn) return phone
    return maskPhone(phone)
  }

  /**
   * 格式化微信号(根据归属决定是否脱敏)
   */
  const formatWechat = (wechat: string, isOwn = false): string => {
    if (!wechat) return ''
    if (isAdmin.value || isOwn) return wechat
    return maskWechat(wechat)
  }

  /** 切换角色(演示用) */
  const switchRole = (role: CrmRole): void => {
    currentRole.value = role
  }

  return {
    // 状态
    currentRole,
    currentUserId,
    currentTeamId,
    // 计算属性
    permissions,
    roleLabel,
    isAdmin,
    isManager,
    dataScope,
    dataScopeLabel,
    // 方法
    can,
    canAny,
    canAll,
    formatPhone,
    formatWechat,
    switchRole,
    // 元数据
    permissionLabels,
    roleLabels,
  }
}
