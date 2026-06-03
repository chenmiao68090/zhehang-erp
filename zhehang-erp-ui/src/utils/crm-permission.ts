/**
 * CRM 模块数据权限与角色控制工具
 * 对应需求文档第九章: 数据权限与角色控制
 *
 * 角色: 管理员 / 销售主管 / 电销销售 / 线上获客 / 查看角色
 * 数据范围: all(全公司) / team(本组) / self(本人)
 */

// ====== 角色与权限类型定义 ======

/** CRM 业务角色 */
export type CrmRole =
  | 'admin'              // 管理员
  | 'sales_manager'      // 销售主管
  | 'telemarketing'      // 电销销售
  | 'online_acquisition' // 线上获客
  | 'viewer'             // 查看角色

/** CRM 权限点 */
export type CrmPermission =
  | 'pool:config'         // 公海池配置
  | 'pool:view_all'       // 查看全公司客户
  | 'pool:view_team'      // 查看本组客户
  | 'pool:view_pool'      // 查看公海客户
  | 'pool:claim'          // 领取公海客户
  | 'pool:distribute'     // 分配客户(跨人)
  | 'pool:transfer'       // 转移/回收客户
  | 'customer:edit_own'   // 编辑自己客户
  | 'customer:view_other' // 查看他人客户
  | 'customer:export'     // 导出客户
  | 'customer:delete'     // 删除客户
  | 'report:view_all'     // 报表全部
  | 'report:view_team'    // 报表团队
  | 'report:view_self'    // 报表个人
  | 'rule:config'         // 规则配置(回收/分配等)
  | 'holding:config'      // 保有量设置

/** 数据范围 */
export type CrmDataScope = 'all' | 'team' | 'self'

// ====== 元数据 ======

/** 角色显示名 */
export const roleLabels: Record<CrmRole, string> = {
  admin: '管理员',
  sales_manager: '销售主管',
  telemarketing: '电销销售',
  online_acquisition: '线上获客',
  viewer: '查看角色',
}

/** 角色英文缩写(用于悬浮按钮徽标) */
export const roleAbbr: Record<CrmRole, string> = {
  admin: 'AD',
  sales_manager: 'SM',
  telemarketing: 'TM',
  online_acquisition: 'OA',
  viewer: 'VW',
}

/** 角色色彩(与 ERP 视觉风格一致) */
export const roleColors: Record<CrmRole, string> = {
  admin: '#F56C6C',
  sales_manager: '#E6A23C',
  telemarketing: '#409EFF',
  online_acquisition: '#67C23A',
  viewer: '#909399',
}

/** 权限点中文标签 */
export const permissionLabels: Record<CrmPermission, string> = {
  'pool:config': '公海池配置',
  'pool:view_all': '查看全公司客户',
  'pool:view_team': '查看本组客户',
  'pool:view_pool': '查看公海客户',
  'pool:claim': '领取公海客户',
  'pool:distribute': '分配客户(跨人)',
  'pool:transfer': '转移/回收客户',
  'customer:edit_own': '编辑自己客户',
  'customer:view_other': '查看他人客户',
  'customer:export': '导出客户',
  'customer:delete': '删除客户',
  'report:view_all': '报表-全部',
  'report:view_team': '报表-团队',
  'report:view_self': '报表-个人',
  'rule:config': '规则配置',
  'holding:config': '保有量设置',
}

/** 全部权限点(用于 admin) */
const allPermissions: CrmPermission[] = [
  'pool:config',
  'pool:view_all',
  'pool:view_team',
  'pool:view_pool',
  'pool:claim',
  'pool:distribute',
  'pool:transfer',
  'customer:edit_own',
  'customer:view_other',
  'customer:export',
  'customer:delete',
  'report:view_all',
  'report:view_team',
  'report:view_self',
  'rule:config',
  'holding:config',
]

/** 角色-权限矩阵 */
const permissionMatrix: Record<CrmRole, CrmPermission[]> = {
  admin: allPermissions,
  sales_manager: [
    'pool:view_team',
    'pool:view_pool',
    'pool:claim',
    'pool:distribute',
    'pool:transfer',
    'customer:edit_own',
    'customer:view_other',
    'customer:export',
    'report:view_team',
  ],
  telemarketing: [
    'pool:view_pool',
    'pool:claim',
    'customer:edit_own',
    'report:view_self',
  ],
  online_acquisition: [
    'pool:view_pool',
    'pool:claim',
    'customer:edit_own',
    'report:view_self',
  ],
  viewer: [],
}

/** 角色-数据范围 */
const dataScopeMatrix: Record<CrmRole, CrmDataScope> = {
  admin: 'all',
  sales_manager: 'team',
  telemarketing: 'self',
  online_acquisition: 'self',
  viewer: 'self',
}

// ====== 工具函数 ======

/** 检查角色是否拥有指定权限 */
export function hasPermission(role: CrmRole, permission: CrmPermission): boolean {
  const perms = permissionMatrix[role]
  return Array.isArray(perms) && perms.includes(permission)
}

/** 获取角色全部权限 */
export function getPermissions(role: CrmRole): CrmPermission[] {
  return [...(permissionMatrix[role] || [])]
}

/** 获取角色数据范围 */
export function getDataScope(role: CrmRole): CrmDataScope {
  return dataScopeMatrix[role] || 'self'
}

/**
 * 是否可查看联系方式
 * @param role 当前角色
 * @param isOwnCustomer 是否本人客户
 * @param isInPool 是否处于公海中
 */
export function canViewContact(
  role: CrmRole,
  isOwnCustomer: boolean,
  isInPool: boolean,
): boolean {
  // 管理员: 全部可见
  if (role === 'admin') return true
  // 公海中的客户: 联系方式一律脱敏
  if (isInPool) return false
  // 本人客户: 可见
  if (isOwnCustomer) return true
  // 他人客户: 主管可见, 其他角色不可见
  return hasPermission(role, 'customer:view_other')
}

/**
 * 手机号脱敏: 138****1234
 */
export function maskPhone(phone: string): string {
  if (!phone) return ''
  const str = String(phone).trim()
  if (str.length <= 7) {
    // 兜底: 中间用 * 替换
    return str.replace(/^(.{1,3})(.*)(.{0,2})$/, (_m, a, b, c) => a + '*'.repeat(b.length) + c)
  }
  return str.slice(0, 3) + '****' + str.slice(-4)
}

/**
 * 微信号脱敏: zh****ng
 */
export function maskWechat(wechat: string): string {
  if (!wechat) return ''
  const str = String(wechat).trim()
  if (str.length <= 2) return '*'.repeat(str.length)
  if (str.length <= 4) return str.slice(0, 1) + '****' + str.slice(-1)
  return str.slice(0, 2) + '****' + str.slice(-2)
}

/**
 * 通用文本脱敏(邮箱/姓名等)
 */
export function maskText(text: string, head = 1, tail = 1): string {
  if (!text) return ''
  const str = String(text)
  if (str.length <= head + tail) return '*'.repeat(str.length)
  return str.slice(0, head) + '****' + str.slice(-tail)
}

/** 全部角色列表(用于角色切换器) */
export const allRoles: CrmRole[] = [
  'admin',
  'sales_manager',
  'telemarketing',
  'online_acquisition',
  'viewer',
]
