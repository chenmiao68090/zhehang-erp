import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const centerView = readFileSync(new URL('../src/views/hrm/resigned-staff.vue', import.meta.url), 'utf8')
const employeeView = readFileSync(new URL('../src/views/org/employee.vue', import.meta.url), 'utf8')
const hrmApi = readFileSync(new URL('../src/api/hrm.ts', import.meta.url), 'utf8')
const orgApi = readFileSync(new URL('../src/api/org.ts', import.meta.url), 'utf8')
const routes = readFileSync(new URL('../src/router/routes.ts', import.meta.url), 'utf8')
const mainLayout = readFileSync(new URL('../src/components/layout/MainLayout.vue', import.meta.url), 'utf8')

test('离职人员中心只消费后端中心、汇总与详情的 R.data 契约', () => {
  assert.match(hrmApi, /get\('\/hrm\/resign-handover\/center', params\)/)
  assert.match(hrmApi, /get\('\/hrm\/resign-handover\/summary'\)/)
  assert.match(hrmApi, /get\(`\/hrm\/resign-handover\/center\/\$\{employeeId\}`\)/)
  assert.match(centerView, /const page = res\?\.data \|\| \{\}/)
  assert.match(centerView, /detail\.value = res\?\.data/)
  assert.doesNotMatch(centerView, /res\?\.data \?\? res/)
  assert.match(centerView, /riskOnly: query\.riskOnly \|\| undefined/)
  assert.doesNotMatch(centerView, /riskLevel: query\.riskLevel/)
})

test('六域矩阵将账号标为系统校验，后五域全部标为人工确认', () => {
  assert.match(centerView, /账号状态由系统实时校验/)
  assert.match(centerView, /客户、任务、资料、资产、结算为人工确认项/)
  for (const field of [
    'customerCheckStatus',
    'taskCheckStatus',
    'documentCheckStatus',
    'assetCheckStatus',
    'settlementCheckStatus'
  ]) {
    assert.match(centerView, new RegExp(field))
    assert.match(hrmApi, new RegExp(`${field}\\?: ResignCheckStatus`))
  }
  assert.match(centerView, /<small>人工确认<\/small>/)
  assert.match(centerView, /真实时间线/)
})

test('SOP 经离职中心专用接口上传，不绕过受保护文件标记', () => {
  assert.match(hrmApi, /service\.post\('\/hrm\/resign-handover\/sop\/upload', formData/)
  assert.match(hrmApi, /headers: \{ 'Content-Type': 'multipart\/form-data' \}/)
  assert.match(centerView, /await resignHandoverApi\.uploadSop\(file\)/)
  assert.match(centerView, /requestId !== sopUploadRequestId/)
  assert.match(centerView, /detailTargetId\.value !== employeeId/)
  assert.doesNotMatch(centerView, /fileInfoApi\.upload\(file\)/)
  assert.doesNotMatch(centerView, /import \{ fileInfoApi \} from '@\/api\/file'/)
  assert.match(centerView, /账号安全风险/)
  assert.match(centerView, /仍可登录或账号关联异常/)
})

test('交接接收人使用稳定 employeeId，保存时不提交姓名身份字段', () => {
  assert.match(centerView, /v-model="handoverForm\.handoverToEmployeeId"/)
  assert.match(centerView, /:value="Number\(employee\.id\)"/)
  assert.match(hrmApi, /handoverToEmployeeId\?: number/)
  assert.doesNotMatch(centerView, /employeeName:\s*detail/)
  assert.doesNotMatch(centerView, /handoverTo:\s*employee/)
  assert.match(centerView, /const payload: ResignHandoverInput = \{/)
  assert.doesNotMatch(centerView, /save\(\{ \.\.\.handoverForm \}\)/)
  assert.match(centerView, /delete \(handoverForm as Record<string, unknown>\)\[key\]/)
  assert.match(centerView, /clearSopFile: Boolean\(handoverForm\.clearSopFile\)/)
  assert.match(centerView, /recordVersion: handoverForm\.recordVersion/)
  assert.match(hrmApi, /recordVersion\?: number/)
  assert.match(hrmApi, /clearSopFile\?: boolean/)
  assert.match(centerView, /:disabled="detailLoading \|\| uploading \|\| !detail"/)
  assert.match(centerView, /requestId !== detailRequestId \|\| detailTargetId\.value !== employeeId/)
})

test('员工主列表排除离职，离职只能走带真实日期的专用接口', () => {
  assert.match(employeeView, /excludeResigned: true/)
  assert.match(employeeView, /办理离职/)
  assert.match(employeeView, /账号和当前会话已立即失效/)
  assert.match(employeeView, /await employeeApi\.resign\(resignDialog\.employee\.id, resignDialog\.resignDate\)/)
  assert.match(orgApi, /put\(`\/org\/employee\/\$\{id\}\/resign`, \{ resignDate \}\)/)
  assert.doesNotMatch(employeeView, /<el-option :label="\$t\('org\.empStatusLeft'\)" :value="3" \/>/)
  assert.match(employeeView, /离职人员请到离职人员中心补录/)
  assert.match(employeeView, /requestId !== employeeDetailRequestId \|\| detailTargetEmployeeId\.value !== targetId/)
})

test('历史离职补录不创建账号并提交独立真实离职日期', () => {
  assert.match(centerView, /补录历史离职/)
  assert.match(centerView, /await employeeApi\.create\(\{/)
  assert.match(centerView, /resignDate: historyForm\.resignDate/)
  assert.match(centerView, /status: 3/)
  assert.match(centerView, /accountEnabled: false/)
  assert.doesNotMatch(centerView, /username: historyForm/)
  assert.doesNotMatch(centerView, /password: historyForm/)
  assert.doesNotMatch(centerView, /roleIds: historyForm/)
})

test('员工页入口使用组织权限下的隐藏路由，旧 HRM 地址只做兼容重定向', () => {
  assert.match(employeeView, /router\.push\('\/sys-org\/resigned-staff'\)/)
  assert.match(routes, /path: 'resigned-staff', name: 'SysOrgResignedStaff',[\s\S]*?hidden: true/)
  assert.match(routes, /path: 'resigned-staff', name: 'HrmResignedStaff', redirect: '\/sys-org\/resigned-staff', meta: \{ hidden: true \}/)
})

test('中心读取失败不会伪装成零风险，也不会继续允许历史补录', () => {
  assert.match(centerView, /const hasDataError = computed/)
  assert.match(centerView, /已暂停历史补录，避免误判或重复建档/)
  assert.match(centerView, /:disabled="hasDataError"/)
  assert.match(centerView, /summaryError \? '—' : summary\.total/)
  assert.doesNotMatch(centerView, /catch \{\s*rows\.value = \[\]\s*total\.value = 0/)
  assert.match(employeeView, /resignedCount \?\? '—'/)
  assert.match(employeeView, /resignedCount\.value = null/)
})

test('手机宽度下离职中心独占可用宽度，不被桌面侧栏挤压', () => {
  assert.match(mainLayout, /'is-offboarding-layout': route\.path === '\/sys-org\/resigned-staff'/)
  assert.match(mainLayout, /\.main-layout\.is-offboarding-layout \{[\s\S]*?:deep\(\.topnav\),[\s\S]*?:deep\(\.sidebar\)/)
  assert.match(centerView, /@media \(max-width: 767px\)/)
  assert.match(centerView, /\.desktop-matrix \{ display: none; \}/)
  assert.match(centerView, /\.mobile-matrix \{ display: block;/)
})
