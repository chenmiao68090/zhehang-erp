import { get, post, del } from './request'

/** 行政·印章登记(用印申请) */
export interface AdminSealUse {
  id?: number | string
  useDate?: string
  serialNo?: string
  applicant?: string
  reason?: string
  fileName?: string
  sealType?: string
  /** 用印位置:多选,逗号串(开头/骑缝章/落款) */
  usePosition?: string
  pageCount?: number
  fileAttach?: string
  /** 用印人确认:1是 0否 */
  userConfirm?: number
  remark?: string
}

export const sealUseApi = {
  list: (keyword?: string) => get('/admin/seal-use/list', { keyword }),
  save: (data: AdminSealUse) => post('/admin/seal-use', data),
  remove: (id: number | string) => del(`/admin/seal-use/${id}`)
}

/** 行政·办公用品管理(分类物料台账 + 入库采购) */
export interface AdminSupply {
  id?: number | string
  /** 入库单号 */
  supplyNo?: string
  /** 品名 */
  supplyName?: string
  /** 分类:通用办公耗材/业务专用耗材/劳保福利品 */
  category?: string
  /** 规格 */
  spec?: string
  /** 单位 */
  unit?: string
  /** 当前库存 */
  quantity?: number
  /** 低库存预警 */
  safetyStock?: number
  /** 入库时间 */
  inDate?: string
  /** 含税总金额 */
  amount?: number
  /** 经办人 */
  operator?: string
  /** 关联采购审批单号 */
  relatedApproval?: string
  /** 状态:待验收/已入库/已驳回 */
  status?: string
  /** 附件 */
  attach?: string
  /** 备注 */
  remark?: string
}

export const supplyApi = {
  list: (keyword?: string) => get('/admin/supply/list', { keyword }),
  save: (data: AdminSupply) => post('/admin/supply', data),
  remove: (id: number | string) => del(`/admin/supply/${id}`)
}

/** 行政·人事行政支出明细登记 */
export interface AdminHrExpense {
  id?: number | string
  expenseNo?: string
  expenseDate?: string
  deptId?: number | string
  deptName?: string
  category?: string
  content?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  payMethod?: string
  status?: string
  attach?: string
  remark?: string
  invoiceType?: string
  invoiceTitle?: string
  invoiceAmount?: number
  invoiceAttach?: string
}

export const hrExpenseApi = {
  list: (params: any) => get('/admin/hr-expense/list', params),
  nextNo: (date?: string) => get('/admin/hr-expense/next-no', date ? { date } : undefined),
  save: (data: AdminHrExpense) => post('/admin/hr-expense/save', data),
  remove: (id: number | string) => del(`/admin/hr-expense/${id}`)
}

/** 行政·固定资产管理(全生命周期台账) */
export interface AdminAsset {
  id?: number | string
  /** 入库单号/资产编号 */
  assetNo?: string
  /** 资产名称 */
  assetName?: string
  /** 资产分类:办公设备/电子设备/税控专用设备/家具/其他 */
  category?: string
  /** 数量 */
  quantity?: number
  /** 总金额 */
  amount?: number
  /** 入库时间 */
  inDate?: string
  /** 经办人 */
  operator?: string
  /** 关联采购审批单号 */
  relatedApproval?: string
  /** 状态:待验收/已入库/领用中/已归还/维修中/已报废/已驳回 */
  status?: string
  /** 当前领用人员工ID */
  holderId?: number | string
  /** 领用人 */
  holder?: string
  /** 所属部门 */
  holderDept?: string
  /** 领用日期 */
  useDate?: string
  /** 领用类型:永久领用/临时领用 */
  useType?: string
  /** 维保类型:故障维修/定期保养 */
  maintainType?: string
  /** 故障描述 */
  faultDesc?: string
  /** 维修费用 */
  maintainFee?: number
  /** 附件URL */
  attach?: string
  /** 备注 */
  remark?: string
}

/** 行政·固定资产流水(入库/领用/归还/维保/报废) */
export interface AdminAssetRecord {
  id?: number | string
  assetId?: number | string
  assetName?: string
  /** 类型:入库/领用/归还/维保/报废 */
  type?: string
  employeeId?: number | string
  employeeName?: string
  recordDate?: string
  qty?: number
  amount?: number
  status?: string
  operator?: string
  remark?: string
  createTime?: string
}

/** 资产动作请求体(领用/归还/维保/报废共用) */
export interface AssetAction {
  employeeId?: number | string
  employeeName?: string
  recordDate?: string
  amount?: number
  status?: string
  remark?: string
}

export const assetApi = {
  list: (params?: { keyword?: string; status?: string; category?: string }) => get('/admin/asset/list', params),
  save: (data: AdminAsset) => post('/admin/asset', data),
  remove: (id: number | string) => del(`/admin/asset/${id}`),
  /** 领用 → 流水type=领用,资产 holderId/holder/status=在用 */
  claim: (id: number | string, data: AssetAction) => post(`/admin/asset/${id}/claim`, data),
  /** 归还 → 流水type=归还,资产 holderId=null/status=闲置 */
  return: (id: number | string, data: AssetAction) => post(`/admin/asset/${id}/return`, data),
  /** 维保 → 流水type=维保 */
  maintain: (id: number | string, data: AssetAction) => post(`/admin/asset/${id}/maintain`, data),
  /** 报废 → 流水type=报废,资产 status=报废 */
  scrap: (id: number | string, data: AssetAction) => post(`/admin/asset/${id}/scrap`, data),
  /** 该资产全部流水(按id倒序) */
  records: (id: number | string) => get(`/admin/asset/${id}/records`),
  /** 某员工名下未归还资产(离职归还校验) */
  unreturned: (employeeId: number | string) => get('/admin/asset/unreturned', { employeeId })
}
