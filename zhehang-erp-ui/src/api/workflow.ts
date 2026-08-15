import { get, post, put, del } from './request'
import type { PageQuery, PageResult } from './types'

// ============= 类型定义 =============

export interface ProcessDef {
  id: number
  name: string
  processKey: string
  category: string
  version: number
  description: string
  /** 发起卡片图标(Element Plus 图标组件名,后端目录驱动) */
  icon?: string
  /** 同分组内排序 */
  sort?: number
  /** 发起目录分组(attendance/finance/admin/hr/biz/other) */
  groupName?: string
  formConfig: string
  processConfig: string
  status: number
  createTime: string
  updateTime: string
}

export interface ProcessDefDTO {
  id?: number
  name: string
  processKey: string
  category: string
  description: string
  formConfig: string
  processConfig: string
}

export interface TaskItem {
  id: number
  instanceId: number
  nodeName: string
  nodeId?: string
  nodeType: string
  assigneeId: number
  assigneeName: string
  status: number
  comment: string
  handleTime: string
  createTime: string
  processName: string
  instanceTitle: string
  initiatorId: number
  initiatorName: string
  startTime: string
  /** 审批时限(空=不限时) */
  deadline?: string
  /** 卡片摘要:表单金额 */
  amount?: string
  /** 卡片摘要:天数 */
  days?: string
}

/** 审批附件(真文件):用 fileId 走 /file/info/download 带 token 预览/下载 */
export interface WfAttachmentItem {
  id: number
  fileId: number
  fileName: string
  fileSize?: number
  mimeType?: string
}

export interface InstanceItem {
  id: number
  processDefId: number
  processName: string
  title: string
  initiatorId: number
  initiatorName: string
  formData: string
  status: number
  startTime: string
  endTime: string
  currentAssigneeName: string
  /** 会签场景:当前节点全部待办处理人 */
  currentAssigneeNames?: string[]
  currentNodeName: string
  /** 当前第一个待办任务ID(发起人催办用) */
  currentTaskId?: number
  /** 当前待办任务的审批时限 */
  currentTaskDeadline?: string
  formConfig?: string
  processConfig?: string
  ccNames?: string[]
  attachments?: WfAttachmentItem[]
  histories: HistoryItem[]
}

/** 审批列表服务端筛选参数 */
export interface WfListQuery extends PageQuery {
  keyword?: string
  processKey?: string
  startDate?: string
  endDate?: string
}

export interface HistoryItem {
  id: number
  instanceId: number
  nodeName: string
  operatorId: number
  operatorName: string
  operatorAvatar: string
  action: string
  comment: string
  operTime: string
}

export interface ProcessTemplate {
  key: string
  name: string
  category: string
  formConfig: string
  processConfig: string
}

/** 审批选人下拉项(抄送/转交用) */
export interface WfColleague {
  userId: number
  name: string
  deptName?: string
}

// ============= 流程定义 API =============

export const processApi = {
  list: (params?: { name?: string; category?: string; status?: number }) =>
    get<ProcessDef[]>('/workflow/process/list', params),
  detail: (id: number) =>
    get<ProcessDef>(`/workflow/process/${id}`),
  create: (data: ProcessDefDTO) =>
    post('/workflow/process', data),
  update: (data: ProcessDefDTO) =>
    put('/workflow/process', data),
  publish: (id: number) =>
    put(`/workflow/process/publish/${id}`),
  disable: (id: number) =>
    put(`/workflow/process/disable/${id}`),
  remove: (id: number) =>
    del(`/workflow/process/${id}`),
  templates: () =>
    get<ProcessTemplate[]>('/workflow/process/templates'),
  /** 发布预检:返回审批链解析不到人的问题清单(空=通过) */
  precheck: (id: number) =>
    get<string[]>(`/workflow/process/precheck/${id}`),
  /** 设计器选审批人即时预警:{ok, count, warning} */
  assigneePreview: (assigneeType: string, assigneeValue?: string) =>
    get<{ ok: boolean; count: number; warning?: string }>('/workflow/process/assignee-preview', { assigneeType, assigneeValue })
}

// ============= 流程实例 API =============

export const instanceApi = {
  start: (data: { processKey: string; title: string; formData: Record<string, any> }) =>
    post('/workflow/instance/start', data),
  detail: (id: number) =>
    get<InstanceItem>(`/workflow/instance/detail/${id}`),
  cancel: (id: number) =>
    put(`/workflow/instance/cancel/${id}`),
  remove: (id: number) =>
    del(`/workflow/instance/${id}`),
  /** 重新提交:发起人修改被退回(待修改)的申请后重新从头流转 */
  resubmit: (id: number, data: { title?: string; formData: Record<string, any> }) =>
    put(`/workflow/instance/resubmit/${id}`, data)
}

// ============= 审批任务 API =============

export const taskApi = {
  todo: (params: WfListQuery) =>
    get<PageResult<TaskItem>>('/workflow/task/todo', params),
  done: (params: WfListQuery) =>
    get<PageResult<TaskItem>>('/workflow/task/done', params),
  started: (params: WfListQuery) =>
    get<PageResult<InstanceItem>>('/workflow/task/started', params),
  /** 四个列表一次性计数(角标用) */
  counts: () =>
    get<{ todo: number; done: number; cc: number; started: number }>('/workflow/task/counts'),
  approve: (id: number, data: { comment?: string }) =>
    put(`/workflow/task/approve/${id}`, data),
  reject: (id: number, data: { comment?: string }) =>
    put(`/workflow/task/reject/${id}`, data),
  transfer: (id: number, data: { comment?: string; targetUserId: number }) =>
    put(`/workflow/task/transfer/${id}`, data),
  /** 退回修改:把申请退给发起人改表单(必须带修改意见) */
  returnForRevision: (id: number, data: { comment: string }) =>
    put(`/workflow/task/return/${id}`, data),
  /** 催办:发起人提醒当前审批人(同任务4小时限频) */
  urge: (id: number) =>
    post(`/workflow/task/urge/${id}`),
  /** 批量审批:多个待办一次性通过,返回 {success, failed[]} */
  batchApprove: (taskIds: number[], comment?: string) =>
    put<{ success: number; failed: string[] }>('/workflow/task/batch-approve', { taskIds, comment }),
  /** 标记一条抄送为已读 */
  markCcRead: (id: number) =>
    put(`/workflow/task/cc/read/${id}`),
  /** 审批选人下拉(抄送/转交用) */
  colleagues: () =>
    get<WfColleague[]>('/workflow/task/colleagues'),
  /** 补充抄送:把实例抄送给指定同事 */
  addCc: (instanceId: number, userIds: number[]) =>
    post(`/workflow/task/cc/${instanceId}`, userIds)
}
