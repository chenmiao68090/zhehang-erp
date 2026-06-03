/**
 * 应用启动时清除旧 Mock 数据的 localStorage 缓存
 * 当版本号更新时会重新执行清理
 */
const CLEANUP_VERSION = 'v2'
const CLEANUP_KEY = 'mock_data_cleaned'

export function cleanupMockStorage() {
  if (localStorage.getItem(CLEANUP_KEY) === CLEANUP_VERSION) return
  const keys = [
    'biz_tasks',
    'biz_task_handovers',
    'biz_commissions',
    'biz_satisfactions',
    'biz_c_projects',
    'biz_d_reports',
    'biz_orders',
    'biz_contracts',
    'biz_contract_templates',
    'biz_receipts',
    'biz_receipt_plans',
    'biz_invoices',
    'biz_refunds',
    'biz_receipt_timeline',
    'biz_customer_list',
    'mock_multi_pool_leads_v1'
  ]
  keys.forEach(k => localStorage.removeItem(k))
  localStorage.setItem(CLEANUP_KEY, CLEANUP_VERSION)
}
