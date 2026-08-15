import service, { get, post, put, del } from './request'

const publicGuestRequest = { silentError: true, skipAuthRedirect: true }

// 招聘管理
export const recruitApi = {
  list: (params: any) => get('/hrm/recruit/list', params),
  detail: (id: number) => get(`/hrm/recruit/${id}`),
  create: (data: any) => post('/hrm/recruit', data),
  update: (data: any) => put('/hrm/recruit', data),
  remove: (id: number) => del(`/hrm/recruit/${id}`),
  changeStatus: (data: { id: number; status: number }) => put('/hrm/recruit/status', data),
  // 可选面试官/评价人(已开通账号的员工),返回 userId/name/deptName/postName
  colleagues: () => get('/hrm/recruit/colleagues')
}

// 简历管理
export const resumeApi = {
  list: (params: any) => get('/hrm/resume/list', params),
  create: (data: any) => post('/hrm/resume', data),
  update: (data: any) => put('/hrm/resume', data),
  remove: (id: number) => del(`/hrm/resume/${id}`),
  changeStatus: (data: { id: number; status: number; evaluation?: string }) => put('/hrm/resume/status', data)
}

// 面试流转记录
export const interviewRecordApi = {
  list: (resumeId: number) => get('/hrm/interview-record/list', { resumeId }),
  create: (data: any) => post('/hrm/interview-record', data)
}

// 待入职 / Offer
export const onboardingApi = {
  list: (params: any) => get('/hrm/onboarding/list', params),
  detail: (id: number) => get(`/hrm/onboarding/${id}`),
  createFromResume: (resumeId: number) => post(`/hrm/onboarding/from-resume/${resumeId}`),
  update: (data: any) => put('/hrm/onboarding', data),
  refreshToken: (id: number) => post(`/hrm/onboarding/${id}/refresh-token`),
  confirmForm: (id: number) => post(`/hrm/onboarding/${id}/confirm-form`),
  generateOffer: (id: number, data: any) => post(`/hrm/onboarding/${id}/generate-offer`, data),
  markOfferSent: (id: number) => post(`/hrm/onboarding/${id}/mark-offer-sent`),
  createEmployeeDraft: (id: number) => post(`/hrm/onboarding/${id}/employee-draft`),
  markOnboarded: (id: number) => post(`/hrm/onboarding/${id}/onboarded`),
  publicInfo: (token: string) => get(`/hrm/onboarding/public/${encodeURIComponent(token)}`, undefined, publicGuestRequest),
  publicSubmit: (token: string, data: any) => post(`/hrm/onboarding/public/${encodeURIComponent(token)}/submit`, data, publicGuestRequest)
}

// 考勤管理
export const attendanceApi = {
  list: (params: any) => get('/hrm/attendance/list', params),
  clockIn: (employeeId: number) => post('/hrm/attendance/clock-in', { employeeId }),
  clockOut: (employeeId: number) => post('/hrm/attendance/clock-out', { employeeId }),
  stats: (params: { employeeId: number; month: string }) => get('/hrm/attendance/stats', params)
}

// 月度考勤汇总(落库 + HR可改 + 员工二次确认)
export const attendanceSummaryApi = {
  generate: (month: string) => post(`/hrm/attendance-summary/generate?month=${month}`),
  list: (month?: string) => get('/hrm/attendance-summary/list', { month }),
  edit: (data: any) => put('/hrm/attendance-summary', data),
  hrConfirm: (id: number) => post(`/hrm/attendance-summary/${id}/hr-confirm`),
  confirmAll: (month: string) => post(`/hrm/attendance-summary/confirm-all?month=${month}`),
  employeeConfirm: (id: number) => post(`/hrm/attendance-summary/${id}/employee-confirm`),
  employeeDispute: (id: number, remark: string) => post(`/hrm/attendance-summary/${id}/employee-dispute`, { remark })
}

// 请假管理(审批走审批中心 leave 流程,后端孤儿口 /hrm/leave/approve 已下线)
export const leaveApi = {
  list: (params: any) => get('/hrm/leave/list', params),
  create: (data: any) => post('/hrm/leave', data)
}

// 假期额度管理(假勤管理 → 假期余额)
export const leaveBalanceApi = {
  listAll: () => get('/hrm/leave-balance/list'),
  byEmployee: (employeeId: number) => get(`/hrm/leave-balance/by-employee/${employeeId}`),
  my: () => get('/hrm/leave-balance/my'),
  save: (data: { id?: number; employeeId: number; leaveType: string; totalDays: number; remark?: string }) => post('/hrm/leave-balance', data),
  remove: (id: number) => del(`/hrm/leave-balance/${id}`)
}

// 假期类型配置
export interface LeaveType {
  id?: number
  typeCode?: string
  typeName?: string
  displayOrder?: number
  durationUnit?: number // 1半天/2天
  balanceRule?: number  // 1限额/2不限额
  status?: number       // 1启用/0停用
  remark?: string
}
export const leaveTypeApi = {
  list: () => get('/hrm/leave-type/list'),
  save: (data: LeaveType) => post('/hrm/leave-type', data),
  toggle: (id: number) => post(`/hrm/leave-type/${id}/toggle`),
  remove: (id: number) => del(`/hrm/leave-type/${id}`)
}

// 薪资管理
export const salaryApi = {
  list: (params: any) => get('/hrm/salary/list', params),
  create: (data: any) => post('/hrm/salary', data),
  update: (data: any) => put('/hrm/salary', data),
  calculate: (salaryMonth: string) => post('/hrm/salary/calculate', { salaryMonth }),
  pay: (salaryMonth: string) => post('/hrm/salary/pay', { salaryMonth }),
  slip: (id: number) => get(`/hrm/salary/slip/${id}`)
}

// 薪酬核算·工资条(飞书建议 165/166/167/168)
// confirm_status:0待发放/1已发放待确认/2员工已确认/3员工有异议
export interface Payslip {
  id?: number
  payMonth?: string
  employeeId?: number
  employeeName?: string
  deptName?: string
  postName?: string
  idCard?: string
  phone?: string
  bankCard?: string
  entryDate?: string
  regularDate?: string
  leaveDate?: string
  personalLeave?: number
  sickLeave?: number
  otherPaidLeave?: number
  actualAttendanceDays?: number
  baseSalary?: number
  performanceSalary?: number
  commission?: number
  bonus?: number
  reissue?: number
  socialInsuranceDeduct?: number
  fundDeduct?: number
  taxDeduct?: number
  otherDeduct?: number
  netSalary?: number
  remark?: string
  confirmStatus?: number
  confirmTime?: string
  feedback?: string
}
export const payslipApi = {
  // HR 端:分页 + 总览计数,返回 { page, counts:{all,pending,confirmed,disputed} }
  list: (params: any) => get('/hrm/payslip/list', params),
  // 新增/编辑单条(有 id 则更新)
  save: (data: Payslip) => post('/hrm/payslip/save', data),
  // 批量落库(Excel 解析成数组传来)
  batchSave: (list: Payslip[]) => post('/hrm/payslip/batch-save', list),
  remove: (id: number) => del(`/hrm/payslip/${id}`),
  // 发放:传 ids(某几条)或 payMonth(整月)
  distribute: (data: { ids?: number[]; payMonth?: string }) => post('/hrm/payslip/distribute', data),
  // 员工自助
  my: (payMonth?: string) => get('/hrm/payslip/my', payMonth ? { payMonth } : undefined),
  confirm: (id: number) => post(`/hrm/payslip/${id}/confirm`),
  feedback: (id: number, content: string) => post(`/hrm/payslip/${id}/feedback`, { content })
}

// 社保公积金
export interface SocialFund {
  id?: number
  recordMonth?: string
  employeeId?: number
  employeeName?: string
  idCard?: string
  phone?: string
  pensionCompany?: number
  pensionPersonal?: number
  unemploymentCompany?: number
  unemploymentPersonal?: number
  workInjuryCompany?: number
  workInjuryPersonal?: number
  medicalCompany?: number
  medicalPersonal?: number
  socialFirstMonth?: string
  housingFundCompany?: number
  housingFundPersonal?: number
  fundFirstMonth?: string
  remark?: string
}
export const socialFundApi = {
  list: (params: any) => get('/hrm/social-fund/list', params),
  save: (data: SocialFund) => post('/hrm/social-fund/save', data),
  batchSave: (list: SocialFund[]) => post('/hrm/social-fund/batch-save', list),
  remove: (id: number) => del(`/hrm/social-fund/${id}`)
}

// 劳动合同管理(飞书建议 161,原合同到期提醒并入本模块)
export interface LaborContract {
  id?: number
  employeeId?: number
  employeeName?: string
  deptName?: string
  contractNo?: string
  contractType?: string
  startDate?: string
  endDate?: string
  signDate?: string
  status?: number
  salaryAgreed?: number
  attachmentFileId?: number
  remark?: string
}
export const laborContractApi = {
  // HR 端:分页 + 总览计数,返回 { page, counts:{all,active,expiring,expired,terminated} }
  list: (params: any) => get('/hrm/labor-contract/list', params),
  // 新增/编辑(有 id 则更新)
  save: (data: LaborContract) => post('/hrm/labor-contract/save', data),
  remove: (id: number) => del(`/hrm/labor-contract/${id}`),
  // 即将到期列表(默认 30 天内)
  expiring: (days = 30) => get('/hrm/labor-contract/expiring', { days }),
  // 手动触发:给即将到期的合同员工本人发到期提醒,返回提醒条数
  remindExpiring: (days = 30) => post(`/hrm/labor-contract/remind-expiring?days=${days}`),
  // 员工自助:查本人合同
  my: () => get('/hrm/labor-contract/my')
}

// 离职人员中心：账号状态为系统事实；客户/任务/资料/资产/结算为人工确认状态。
export type ResignCheckStatus = 0 | 1 | 2 | 3
export type ResignHandoverStatus = 0 | 1 | 2
export type ResignedAccountStatus = 0 | 1 | 2 | 3

export interface ResignHandoverInput {
  id?: number | string
  /** 更新时必传；服务端用它拒绝陈旧页面覆盖新进度。 */
  recordVersion?: number
  employeeId: number
  handoverDate?: string
  /** 稳定员工档案 ID；姓名由后端查询，不信任前端传值。 */
  handoverToEmployeeId?: number
  sopFileId?: number | string
  /** 明确清除旧 SOP 引用；与“本次未传 sopFileId”区分。 */
  clearSopFile?: boolean
  items?: string
  status?: ResignHandoverStatus
  remark?: string
  customerCheckStatus?: ResignCheckStatus
  taskCheckStatus?: ResignCheckStatus
  documentCheckStatus?: ResignCheckStatus
  assetCheckStatus?: ResignCheckStatus
  settlementCheckStatus?: ResignCheckStatus
}

export interface ResignHandover extends Partial<ResignHandoverInput> {
  employeeId?: number
  employeeName?: string
  handoverTo?: string
  createTime?: string
  updateTime?: string
}

export interface ResignedStaffRow {
  employeeId: number
  userId?: number
  empCode?: string
  name?: string
  deptId?: number
  deptName?: string
  postName?: string
  hireDate?: string
  resignDate?: string
  accountStatus: ResignedAccountStatus
  accountEnabled: boolean
  handoverId?: number | string
  handoverDate?: string
  handoverToEmployeeId?: number
  handoverTo?: string
  status: ResignHandoverStatus
  customerCheckStatus: ResignCheckStatus
  taskCheckStatus: ResignCheckStatus
  documentCheckStatus: ResignCheckStatus
  assetCheckStatus: ResignCheckStatus
  settlementCheckStatus: ResignCheckStatus
  archiveTime?: string
  riskCount: number
  riskLevel?: string
  createTime?: string
  updateTime?: string
}

export interface ResignedStaffSummary {
  total: number
  inProgress: number
  riskCount: number
  accountRiskCount: number
  closedCount: number
}

export interface ResignedStaffTimelineItem {
  type?: string
  title: string
  description?: string
  time?: string
}

export interface ResignedStaffDetail {
  employee: ResignedStaffRow
  handovers: ResignHandover[]
  timeline: ResignedStaffTimelineItem[]
}
export const resignHandoverApi = {
  center: (params: { pageNum?: number; pageSize?: number; name?: string; deptId?: number; status?: number; riskOnly?: boolean } = {}) =>
    get('/hrm/resign-handover/center', params),
  summary: () => get('/hrm/resign-handover/summary'),
  centerDetail: (employeeId: number) => get(`/hrm/resign-handover/center/${employeeId}`),
  // 按员工/状态查交接记录列表
  list: (params: { employeeId?: number; status?: number } = {}) => get('/hrm/resign-handover/list', params),
  // 新增/编辑(有 id 则更新)
  save: (data: ResignHandoverInput) => post('/hrm/resign-handover/save', data),
  // SOP 属于离职档案，必须经专用接口上传并立即标记为受保护文件。
  uploadSop: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return service.post('/hrm/resign-handover/sop/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 取某员工的全部交接记录
  byEmployee: (employeeId: number) => get(`/hrm/resign-handover/by-employee/${employeeId}`)
}

// 岗位薪酬模板
export interface SalaryTemplate {
  id?: number
  postId?: number
  postName?: string
  baseSalary?: number
  performanceBase?: number
  allowance?: number
  perfCoefficient?: number
  bonus?: number
  bonusRule?: string
  commissionRule?: string
  perfRule?: string
  remark?: string
}
export const salaryTemplateApi = {
  list: () => get('/hrm/salary-template/list'),
  save: (data: SalaryTemplate) => post('/hrm/salary-template', data),
  remove: (id: number) => del(`/hrm/salary-template/${id}`)
}

// 绩效管理
export const performanceApi = {
  list: (params: any) => get('/hrm/performance/list', params),
  create: (data: any) => post('/hrm/performance', data),
  update: (data: any) => put('/hrm/performance', data),
  remove: (id: number) => del(`/hrm/performance/${id}`),
  evaluate: (data: { id: number; selfScore: number; leaderScore: number; evaluation: string }) => put('/hrm/performance/evaluate', data),
  statistics: (params: { period?: string; type?: number }) => get('/hrm/performance/statistics', params)
}

// 绩效考核模板(参考 tita,按岗位设考核模板)
export interface PerfTemplate {
  id?: number
  templateName?: string
  postName?: string
  period?: string      // 月度/季度/年度
  scoreType?: string   // 评分式/等级式
  dimensions?: string  // 考核指标维度 JSON 字符串
  totalScore?: number
  remark?: string
}
export const perfTemplateApi = {
  list: (keyword?: string) => get('/hrm/perf-template/list', keyword ? { keyword } : undefined),
  save: (data: PerfTemplate) => post('/hrm/perf-template', data),
  remove: (id: number) => del(`/hrm/perf-template/${id}`)
}

// 培训管理
export const trainingApi = {
  list: (params: any) => get('/hrm/training/list', params),
  create: (data: any) => post('/hrm/training', data),
  update: (data: any) => put('/hrm/training', data),
  remove: (id: number) => del(`/hrm/training/${id}`),
  enroll: (data: { trainingId: number; employeeId: number }) => post('/hrm/training/enroll', data)
}

// 员工培训/SOP
export const sopTrainingApi = {
  sopList: (params: any) => get('/hrm/sop/list', params),
  sopDetail: (id: number) => get(`/hrm/sop/${id}`),
  createSop: (data: any) => post('/hrm/sop', data),
  updateSop: (data: any) => put('/hrm/sop', data),
  removeSop: (id: number) => del(`/hrm/sop/${id}`),
  records: (params: any) => get('/hrm/sop/training/records', params),
  employees: () => get('/hrm/sop/employees'),
  assign: (data: any) => post('/hrm/sop/training/assign', data),
  complete: (id: number) => post(`/hrm/sop/training/${id}/complete`),
  review: (id: number, data: any) => post(`/hrm/sop/training/${id}/review`, data),
  dashboard: () => get('/hrm/sop/dashboard')
}

// 课件培训系统: 课程学习 + 考核评分 + 复训闭环
export const courseTrainingApi = {
  portal: () => get('/hrm/training/courseware/portal'),
  courses: (params: any) => get('/hrm/training/courseware/courses', params),
  courseQuality: (ids: number[]) => get('/hrm/training/courseware/courses/quality', { courseIds: ids.join(',') }),
  courseDetail: (id: number) => get(`/hrm/training/courseware/courses/${id}`),
  createCourse: (data: any) => post('/hrm/training/courseware/courses', data),
  updateCourse: (data: any) => put('/hrm/training/courseware/courses', data),
  removeCourse: (id: number) => del(`/hrm/training/courseware/courses/${id}`),
  selfEnroll: (id: number) => post(`/hrm/training/courseware/courses/${id}/self-enroll`),
  assign: (data: any) => post('/hrm/training/courseware/assign', data),
  learningRecords: (params: any) => get('/hrm/training/courseware/learning-records', params),
  startLearning: (id: number) => post(`/hrm/training/courseware/learning-records/${id}/start`),
  learningProgress: (id: number) => get(`/hrm/training/courseware/learning-records/${id}/progress`),
  saveLearningProgress: (id: number, data: any) => post(`/hrm/training/courseware/learning-records/${id}/progress`, data),
  finishLearning: (id: number) => post(`/hrm/training/courseware/learning-records/${id}/finish`),
  learningExam: (id: number) => get(`/hrm/training/courseware/learning-records/${id}/exam`),
  inlineMaterial: (id: number) => get(`/hrm/training/courseware/materials/${id}/inline`, null, { responseType: 'blob' }),
  videoPlayback: (id: number, learningRecordId?: number) => get(`/hrm/training/courseware/materials/${id}/video-play`, { learningRecordId }),
  initVideoUpload: (data: any) => post('/hrm/training/courseware/video/uploads/init', data),
  uploadVideoChunk: (uploadToken: string, chunkIndex: number, chunk: Blob, onProgress?: (percent: number) => void) => {
    const form = new FormData()
    form.append('chunk', chunk, `chunk-${chunkIndex}.part`)
    return post(`/hrm/training/courseware/video/uploads/${uploadToken}/chunks/${chunkIndex}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      onUploadProgress: (event: any) => {
        if (event.total && onProgress) onProgress(Math.round(event.loaded * 100 / event.total))
      }
    })
  },
  completeVideoUpload: (uploadToken: string) => post(`/hrm/training/courseware/video/uploads/${uploadToken}/complete`),
  cancelVideoUpload: (uploadToken: string) => del(`/hrm/training/courseware/video/uploads/${uploadToken}`),
  submitExam: (id: number, data: any) => post(`/hrm/training/courseware/learning-records/${id}/submit-exam`, data),
  remind: (id: number) => post(`/hrm/training/courseware/learning-records/${id}/remind`),
  examRecords: (params: any) => get('/hrm/training/courseware/exam-records', params),
  examDetail: (id: number) => get(`/hrm/training/courseware/exam-records/${id}`),
  reviewExam: (id: number, data: any) => post(`/hrm/training/courseware/exam-records/${id}/review`, data),
  paths: (params?: any) => get('/hrm/training/courseware/paths', params),
  createPath: (data: any) => post('/hrm/training/courseware/paths', data),
  updatePath: (data: any) => put('/hrm/training/courseware/paths', data),
  removePath: (id: number) => del(`/hrm/training/courseware/paths/${id}`),
  assignPath: (id: number, data: any) => post(`/hrm/training/courseware/paths/${id}/assign`, data),
  certifications: (params: any) => get('/hrm/training/courseware/certifications', params),
  archives: (params?: any) => get('/hrm/training/courseware/archives', params),
  homeworks: (params?: any) => get('/hrm/training/courseware/homeworks', params),
  createHomework: (data: any) => post('/hrm/training/courseware/homeworks', data),
  updateHomework: (data: any) => put('/hrm/training/courseware/homeworks', data),
  removeHomework: (id: number) => del(`/hrm/training/courseware/homeworks/${id}`),
  homeworkSubmissions: (params?: any) => get('/hrm/training/courseware/homework-submissions', params),
  submitHomework: (id: number, data: any) => post(`/hrm/training/courseware/homework-submissions/${id}/submit`, data),
  reviewHomework: (id: number, data: any) => post(`/hrm/training/courseware/homework-submissions/${id}/review`, data),
  credits: (params?: any) => get('/hrm/training/courseware/credits', params),
  skills: (params?: any) => get('/hrm/training/courseware/skills', params),
  saveSkill: (data: any) => post('/hrm/training/courseware/skills', data),
  supervision: (params?: any) => get('/hrm/training/courseware/supervision', params),
  materialLibrary: (params?: any) => get('/hrm/training/courseware/materials/library', params),
  trainingRecords: (params?: any) => get('/hrm/training/courseware/training-records', params),
  dashboard: () => get('/hrm/training/courseware/dashboard')
}
