// ===== 统一审批中心 API =====
// 说明：
// 1. 审批中心不新增后端接口，完全复用 workflow 模块的真实端点：
//    - 待办  GET /workflow/task/todo     -> IPage<WfTaskVO>
//    - 已办  GET /workflow/task/done     -> IPage<WfTaskVO>
//    - 我发起 GET /workflow/task/started  -> IPage<WfInstanceVO>
//    - 流程定义 GET /workflow/process/list?status=1 -> WfProcessDefVO[]（已发布的可发起流程）
//    - 发起   POST /workflow/instance/start
//    - 详情   GET  /workflow/instance/detail/{id}
//    - 审批/驳回/转交 PUT /workflow/task/{approve|reject|transfer}/{id}
// 2. request.ts 响应拦截器在 code===200 时 resolve 的是 R 信封的 data 载荷本身；
//    分页载荷形如 {records,total,size,current,pages}（拦截器另补了 list 别名）。
//    这里 toPage() 统一收敛成视图期望的 {list,total}，保持与 channel.ts 同风格。
// 3. 类型与底层方法直接复用 ./workflow，避免重复定义。

import { get } from './request'
import { taskApi, instanceApi, processApi } from './workflow'
import type { ProcessDef, TaskItem, InstanceItem, WfColleague } from './workflow'
import type { PageQuery } from './types'

export type { ProcessDef, TaskItem, InstanceItem, WfColleague } from './workflow'

/** 拦截器已 resolve 出 data 载荷；这里兼容“万一拿到的是整包 R 信封”的情况 */
function unwrap<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'code' in res && 'data' in res) return res.data as T
  return res as T
}

/** IPage / {records,total} -> {list,total} */
function toPage<T> (data: any): { list: T[]; total: number } {
  const payload = unwrap(data)
  const list = Array.isArray(payload?.records)
    ? payload.records
    : (Array.isArray(payload?.list) ? payload.list : (Array.isArray(payload) ? payload : []))
  return { list, total: Number(payload?.total ?? list.length ?? 0) }
}

export const approvalCenterApi = {
  /** 待办（我审批的）分页 */
  async todo (params: PageQuery): Promise<{ list: TaskItem[]; total: number }> {
    return toPage<TaskItem>(await taskApi.todo(params))
  },
  /** 已办（我处理过的）分页 */
  async done (params: PageQuery): Promise<{ list: TaskItem[]; total: number }> {
    return toPage<TaskItem>(await taskApi.done(params))
  },
  /** 我发起的 分页 */
  async started (params: PageQuery): Promise<{ list: InstanceItem[]; total: number }> {
    return toPage<InstanceItem>(await taskApi.started(params))
  },
  /** 抄送我的（node_type=cc 的抄送记录) */
  async cc (params: PageQuery): Promise<{ list: TaskItem[]; total: number }> {
    return toPage<TaskItem>(await get('/workflow/task/cc', params))
  },
  /** 已发布、可发起的流程定义（用于把发起卡片映射到真实 processKey） */
  async publishedProcesses (): Promise<ProcessDef[]> {
    const res = await processApi.list({ status: 1 })
    return (unwrap<ProcessDef[]>(res)) || []
  },
  /** 流程实例详情（表单数据 + 审批轨迹） */
  async detail (instanceId: number): Promise<InstanceItem | null> {
    const res = await instanceApi.detail(instanceId)
    return unwrap<InstanceItem | null>(res)
  },
  /** 待办数量（用于 Tab 角标）：取 total 即可，避免拉全量 */
  async todoCount (): Promise<number> {
    const res = await get('/workflow/task/todo', { pageNum: 1, pageSize: 1 }, { silentError: true })
    return toPage(res).total
  },
  /** 审批选人下拉(抄送/转交用,已开通账号的员工) */
  async colleagues (): Promise<WfColleague[]> {
    return (unwrap<WfColleague[]>(await taskApi.colleagues())) || []
  },
  // —— 审批动作（直接透传 workflow） ——
  approve: (taskId: number, comment?: string) => taskApi.approve(taskId, { comment }),
  reject: (taskId: number, comment?: string) => taskApi.reject(taskId, { comment }),
  transfer: (taskId: number, targetUserId: number, comment?: string) =>
    taskApi.transfer(taskId, { targetUserId, comment }),
  /** 补充抄送 */
  addCc: (instanceId: number, userIds: number[]) => taskApi.addCc(instanceId, userIds),
  start: (processKey: string, title: string, formData: Record<string, any>) =>
    instanceApi.start({ processKey, title, formData }),
  cancel: (instanceId: number) => instanceApi.cancel(instanceId),
  removeStarted: (instanceId: number) => instanceApi.remove(instanceId)
}
