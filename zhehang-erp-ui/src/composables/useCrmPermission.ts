/**
 * CRM 联系方式展示口径。
 *
 * 这里只读取后端登录态返回的权限，不允许 localStorage、调试角色或前端角色切换覆盖。
 * 后端仍负责最终数据范围与接口授权；前端脱敏只用于避免页面误展示。
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

// 当前生产后端只在 crm:lead:list 数据范围内返回线索；手机号没有独立权限码。
// 后续若上线独立手机号权限，应由后端先脱敏，再在这里同步收紧。
const LEAD_LIST_PERMISSION = 'crm:lead:list'

function maskPhone(phone: string): string {
  const value = String(phone || '').trim()
  if (!value) return ''
  if (value.length <= 4) return '*'.repeat(value.length)
  if (value.length < 7) return `${value.slice(0, 2)}***${value.slice(-2)}`
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

function maskWechat(wechat: string): string {
  const value = String(wechat || '').trim()
  if (!value) return ''
  if (value.length <= 2) return '*'.repeat(value.length)
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

export function useCrmPermission() {
  const userStore = useUserStore()
  const canViewFullPhone = computed(() =>
    userStore.permissions.includes('*:*:*')
      || userStore.permissions.includes(LEAD_LIST_PERMISSION)
  )

  const formatPhone = (phone: string, isOwn = false): string => {
    if (!phone) return ''
    return canViewFullPhone.value || isOwn ? phone : maskPhone(phone)
  }

  const formatWechat = (wechat: string, isOwn = false): string => {
    if (!wechat) return ''
    return canViewFullPhone.value || isOwn ? wechat : maskWechat(wechat)
  }

  return {
    canViewFullPhone,
    formatPhone,
    formatWechat
  }
}
