export const businessTypes = [
  { value: 'bookkeeping', label: '代理记账' },
  { value: 'registration', label: '工商注册' },
  { value: 'change', label: '工商变更' },
  { value: 'cancellation', label: '工商注销' },
  { value: 'address', label: '挂靠地址' },
  { value: 'seal', label: '刻章业务' },
  { value: 'invoice', label: '开票服务' },
  { value: 'tax', label: '税务咨询' },
  { value: 'license', label: '许可证办理' },
  { value: 'qualification', label: '资质办理' },
  { value: 'other', label: '其他业务' }
]

export const orderStatuses = [
  { value: 'pending', label: '待处理', type: 'info' },
  { value: 'in_progress', label: '办理中', type: 'primary' },
  { value: 'completed', label: '已完成', type: 'success' },
  { value: 'refund_pending', label: '退费中', type: 'warning' },
  { value: 'refunding', label: '退费中', type: 'warning' },
  { value: 'refunded', label: '已退费', type: 'danger' },
  { value: 'rejected', label: '已驳回', type: 'danger' },
  { value: 'cancelled', label: '已取消', type: 'info' }
] as const

export const refundStatuses = [
  { value: 'pending', label: '待审核', type: 'warning' },
  { value: 'approved', label: '待退款', type: 'primary' },
  { value: 'completed', label: '已完成', type: 'success' },
  { value: 'rejected', label: '已驳回', type: 'danger' }
] as const

export const contractStatuses = [
  { value: 'draft', label: '草稿', type: 'info' },
  { value: 'executing', label: '履约中', type: 'primary' },
  { value: 'completed', label: '已到期', type: 'warning' },
  { value: 'terminated', label: '已终止', type: 'danger' }
] as const

export function optionLabel(options: readonly { value: string; label: string }[], value?: string) {
  return options.find((item) => item.value === value)?.label || value || '-'
}

export function optionType(options: readonly { value: string; type: string }[], value?: string) {
  return (options.find((item) => item.value === value)?.type || 'info') as any
}

export function money(value?: number | string) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDateTime(value?: string) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-'
}
