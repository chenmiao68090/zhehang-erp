<template>
  <div class="leave-mgmt">
    <!-- 飞书风页头 -->
    <header class="lm-header">
      <div class="lm-header-main">
        <h1 class="lm-title">假勤管理</h1>
        <p class="lm-desc">考勤统计、假期额度与假勤申请,统一在此管理</p>
      </div>
      <div class="lm-header-quick">
        <div class="lm-quick" v-for="q in quickEntries" :key="q.key" @click="goApply">
          <span class="lm-quick-ico" :style="{ background: q.color }"><el-icon><component :is="q.icon" /></el-icon></span>
          <span class="lm-quick-label">{{ q.label }}</span>
        </div>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="lm-tabs">
      <!-- ① 假勤统计:沿用现有考勤页 -->
      <el-tab-pane name="stats" label="假勤统计" lazy>
        <AttendanceStats />
      </el-tab-pane>

      <!-- ② 假期类型:可配置的假期类型 -->
      <el-tab-pane name="type" label="假期类型" lazy>
        <el-card shadow="never" class="lm-card">
          <div class="lm-card-head">
            <div>
              <span class="lm-card-title">假期类型</span>
              <span class="lm-card-sub">配置公司的假期类型;请假与额度按这里启用的类型来</span>
            </div>
            <el-button type="primary" :icon="Plus" @click="openType()">新建假期类型</el-button>
          </div>
          <el-table :data="leaveTypes" v-loading="typeLoading" border stripe>
            <el-table-column label="展示顺序" prop="displayOrder" width="100" align="center" />
            <el-table-column label="假期类型" prop="typeName" min-width="130" />
            <el-table-column label="时长单位" width="100" align="center">
              <template #default="{ row }">{{ row.durationUnit === 1 ? '半天' : '天' }}</template>
            </el-table-column>
            <el-table-column label="余额规则" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.balanceRule === 1 ? 'warning' : 'info'" effect="plain">{{ row.balanceRule === 1 ? '限额' : '不限额' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.status === 1" @change="toggleType(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openType(row)">编辑</el-button>
                <el-button link type="danger" @click="removeType(row)">删除</el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty description="还没有假期类型,点右上角新建" :image-size="80" /></template>
          </el-table>
        </el-card>

        <el-dialog v-model="typeDialog" :title="typeForm.id ? '编辑假期类型' : '新建假期类型'" width="480px">
          <el-form :model="typeForm" label-width="90px">
            <el-form-item label="假期类型" required><el-input v-model="typeForm.typeName" placeholder="如:年假" /></el-form-item>
            <el-form-item label="展示顺序"><el-input-number v-model="typeForm.displayOrder" :min="0" controls-position="right" /></el-form-item>
            <el-form-item label="时长单位">
              <el-radio-group v-model="typeForm.durationUnit">
                <el-radio-button :value="1">半天</el-radio-button>
                <el-radio-button :value="2">天</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="余额规则">
              <el-radio-group v-model="typeForm.balanceRule">
                <el-radio-button :value="1">限额</el-radio-button>
                <el-radio-button :value="2">不限额</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="typeForm.status" :active-value="1" :inactive-value="0" /> <span class="lm-noset">{{ typeForm.status === 1 ? '已启用' : '已停用' }}</span>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="typeDialog = false">取消</el-button>
            <el-button type="primary" :loading="typeSaving" @click="saveType">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- ③ 假期额度:每人 × 每种带薪假期 设额度 -->
      <el-tab-pane name="balance" label="假期额度" lazy>
        <el-card shadow="never" class="lm-card">
          <div class="lm-card-head">
            <div>
              <span class="lm-card-title">假期额度管理</span>
              <span class="lm-card-sub">给员工设置各类带薪假期额度;请假时按额度校验,余额不足无法申请</span>
            </div>
            <el-button :icon="Refresh" @click="loadBalanceData">刷新</el-button>
          </div>
          <el-table :data="employees" v-loading="balanceLoading" border stripe>
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="name" label="姓名" width="110" />
            <el-table-column prop="deptName" label="部门" min-width="110" show-overflow-tooltip />
            <el-table-column prop="postName" label="岗位" min-width="110" show-overflow-tooltip />
            <el-table-column label="已设额度" min-width="260">
              <template #default="{ row }">
                <template v-if="empBalances(row.id).length">
                  <el-tag v-for="b in empBalances(row.id)" :key="b.id" class="lm-bal-tag" :type="remainTagType(b)" effect="light">
                    {{ b.leaveType }} 剩{{ fmt(remainOf(b)) }}/{{ fmt(b.totalDays) }}天
                  </el-tag>
                </template>
                <span v-else class="lm-noset">未设置(不限制)</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="110" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openQuota(row)">设置额度</el-button>
              </template>
            </el-table-column>
            <template #empty><el-empty description="暂无员工数据" :image-size="80" /></template>
          </el-table>
        </el-card>

        <!-- 设置额度弹窗 -->
        <el-dialog v-model="quotaDialog" :title="`设置「${quotaEmp ? quotaEmp.name : ''}」的假期额度`" width="580px">
          <div class="quota-add">
            <el-select v-model="quotaForm.leaveType" placeholder="选择假期类型" style="width:150px">
              <el-option v-for="t in paidLeaveTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-input-number v-model="quotaForm.totalDays" :min="0" :step="0.5" :precision="1" controls-position="right" style="width:160px" />
            <span class="quota-unit">天</span>
            <el-button type="primary" :icon="Plus" :loading="quotaSaving" @click="saveQuota">添加 / 更新</el-button>
          </div>
          <el-table :data="quotaList" border size="small" style="margin-top:14px">
            <el-table-column prop="leaveType" label="假期类型" min-width="100" />
            <el-table-column label="总额度" align="center" width="90"><template #default="{ row }">{{ fmt(row.totalDays) }} 天</template></el-table-column>
            <el-table-column label="已用" align="center" width="80"><template #default="{ row }">{{ fmt(row.usedDays) }} 天</template></el-table-column>
            <el-table-column label="剩余" align="center" width="90">
              <template #default="{ row }"><b :style="{ color: remainColorVal(remainOf(row), row.totalDays) }">{{ fmt(remainOf(row)) }} 天</b></template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ row }"><el-button link type="danger" @click="removeQuota(row)">删除</el-button></template>
            </el-table-column>
            <template #empty><el-empty description="尚未设置额度,在上方添加" :image-size="60" /></template>
          </el-table>
          <el-alert class="quota-tip" type="info" :closable="false" show-icon
            title="未设额度的假期类型(如事假/病假)不做天数限制;设了额度的(如年假/育儿假)请假超额会被拦下。" />
        </el-dialog>
      </el-tab-pane>

      <!-- ④ 月度汇总:落库 + HR可改 + 员工二次确认 -->
      <el-tab-pane name="summary" label="月度汇总" lazy>
        <el-card shadow="never" class="lm-card">
          <div class="lm-card-head">
            <div>
              <span class="lm-card-title">月度考勤汇总</span>
              <span class="lm-card-sub">按月生成每位员工的考勤汇总,HR 核对(可改)后(下一步)可发员工二次确认</span>
            </div>
            <div style="display:flex;gap:10px;align-items:center">
              <el-date-picker v-model="summaryMonth" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width:140px" @change="loadSummary" />
              <el-button v-if="isHr" type="primary" :icon="Refresh" :loading="summaryGenerating" @click="generateSummary">生成本月汇总</el-button>
              <el-button v-if="isHr" type="success" :loading="summaryConfirming" @click="confirmAllRows">一键发送确认</el-button>
            </div>
          </div>
          <el-table :data="summaryList" v-loading="summaryLoading" border stripe size="small">
            <el-table-column type="index" label="#" width="46" align="center" />
            <el-table-column prop="employeeName" label="姓名" width="100" fixed="left" />
            <el-table-column prop="month" label="月份" width="86" align="center" />
            <el-table-column prop="expectedDays" label="应出勤" width="74" align="center" />
            <el-table-column prop="paidHolidayDays" label="法定带薪" width="84" align="center" />
            <el-table-column prop="actualDays" label="实际" width="62" align="center" />
            <el-table-column prop="normal" label="正常" width="62" align="center" />
            <el-table-column prop="late" label="迟到" width="62" align="center" />
            <el-table-column prop="early" label="早退" width="62" align="center" />
            <el-table-column prop="absent" label="旷工" width="62" align="center" />
            <el-table-column prop="personalLeave" label="事假" width="62" align="center" />
            <el-table-column prop="sickLeave" label="病假" width="62" align="center" />
            <el-table-column label="确认状态" width="120" align="center">
              <template #default="{ row }"><el-tag size="small" :type="confirmTagType(row.confirmStatus)">{{ confirmLabel(row.confirmStatus) }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button v-if="isHr" link type="primary" @click="openSummaryEdit(row)">编辑</el-button>
                <el-button v-if="isHr && row.confirmStatus === 0" link type="success" @click="hrConfirmRow(row)">发送确认</el-button>
                <template v-if="!isHr && row.confirmStatus === 1">
                  <el-button link type="success" @click="employeeConfirmRow(row)">确认</el-button>
                  <el-button link type="warning" @click="employeeDisputeRow(row)">有异议</el-button>
                </template>
                <span v-if="row.confirmStatus === 2 || row.confirmStatus === 3" class="lm-noset">—</span>
              </template>
            </el-table-column>
            <template #empty><el-empty description="本月还没有汇总,选好月份点「生成本月汇总」" :image-size="80" /></template>
          </el-table>
        </el-card>

        <el-dialog v-model="summaryDialog" title="编辑考勤汇总" width="560px">
          <el-form :model="summaryForm" label-width="92px">
            <el-form-item label="员工/月份">{{ summaryForm.employeeName }} · {{ summaryForm.month }}</el-form-item>
            <el-row :gutter="12">
              <el-col :span="8"><el-form-item label="应出勤"><el-input-number v-model="summaryForm.expectedDays" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="法定带薪"><el-input-number v-model="summaryForm.paidHolidayDays" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="实际出勤"><el-input-number v-model="summaryForm.actualDays" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="正常"><el-input-number v-model="summaryForm.normal" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="迟到"><el-input-number v-model="summaryForm.late" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="早退"><el-input-number v-model="summaryForm.early" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="旷工"><el-input-number v-model="summaryForm.absent" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="事假"><el-input-number v-model="summaryForm.personalLeave" :min="0" :precision="1" :step="0.5" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="病假"><el-input-number v-model="summaryForm.sickLeave" :min="0" :precision="1" :step="0.5" controls-position="right" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="HR备注"><el-input v-model="summaryForm.remark" type="textarea" :rows="2" /></el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="summaryDialog = false">取消</el-button>
            <el-button type="primary" :loading="summarySaving" @click="saveSummary">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- ⑤ 假勤申请 -->
      <el-tab-pane name="apply" label="假勤申请" lazy>
        <el-card shadow="never" class="lm-card">
          <div class="lm-card-head">
            <span class="lm-card-title">发起假勤申请</span>
            <span class="lm-card-sub">点击进入审批中心发起对应流程,审批通过后生效</span>
          </div>
          <div class="lm-apply-grid">
            <div class="lm-apply-card" v-for="q in quickEntries" :key="q.key" @click="goApply">
              <span class="lm-apply-ico" :style="{ background: q.color }"><el-icon :size="22"><component :is="q.icon" /></el-icon></span>
              <div class="lm-apply-name">{{ q.label }}</div>
              <div class="lm-apply-desc">{{ q.desc }}</div>
            </div>
          </div>
          <el-alert class="lm-apply-tip" type="info" :closable="false" show-icon
            title="带薪假期申请会自动校验剩余额度:剩余不足时无法提交;通过后扣减、被驳回/撤销则退还。" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Suitcase, MoonNight, AlarmClock, Position, Refresh, Plus } from '@element-plus/icons-vue'
import { employeeApi } from '@/api/org'
import { leaveBalanceApi, leaveTypeApi, attendanceSummaryApi, type LeaveType } from '@/api/hrm'
import { useUserStore } from '@/stores/user'

const AttendanceStats = defineAsyncComponent(() => import('@/views/hrm/attendance.vue'))

const router = useRouter()
const activeTab = ref('stats')

const quickEntries = [
  { key: 'leave', label: '请假', icon: Calendar, color: '#3370ff', desc: '年假/事假/病假等,带薪假自动核额度' },
  { key: 'overtime', label: '加班', icon: MoonNight, color: '#7c5cff', desc: '加班申请,审批后计入' },
  { key: 'makeup', label: '补卡', icon: AlarmClock, color: '#00b3a4', desc: '漏打卡补卡申请' },
  { key: 'travel', label: '出差', icon: Suitcase, color: '#ff8800', desc: '出差申请与天数登记' },
  { key: 'outing', label: '外出', icon: Position, color: '#36b37e', desc: '工作时间外出申请' }
]
function goApply () { router.push('/approval') }

// 可设额度的带薪假期类型(与请假流程的请假类型一致)
const paidLeaveTypes = ['年假', '调休', '育儿假', '事假', '病假', '婚假', '产假', '陪产假', '丧假']

// ===== 假期类型配置 =====
const leaveTypes = ref<LeaveType[]>([])
const typeLoading = ref(false)
const typeDialog = ref(false)
const typeSaving = ref(false)
const typeForm = ref<LeaveType>({})
async function loadTypes () {
  typeLoading.value = true
  try {
    const res: any = await leaveTypeApi.list()
    leaveTypes.value = (res?.data ?? res) || []
  } catch { leaveTypes.value = [] } finally { typeLoading.value = false }
}
function openType (row?: LeaveType) {
  typeForm.value = row ? { ...row } : { typeName: '', displayOrder: leaveTypes.value.length + 1, durationUnit: 2, balanceRule: 2, status: 1 }
  typeDialog.value = true
}
async function saveType () {
  if (!typeForm.value.typeName) { ElMessage.warning('请填写假期类型名'); return }
  typeSaving.value = true
  try {
    await leaveTypeApi.save(typeForm.value)
    ElMessage.success('已保存'); typeDialog.value = false; loadTypes()
  } catch { ElMessage.error('保存失败') } finally { typeSaving.value = false }
}
async function toggleType (row: LeaveType) {
  try { await leaveTypeApi.toggle(row.id!); loadTypes() } catch { ElMessage.error('操作失败'); loadTypes() }
}
async function removeType (row: LeaveType) {
  try { await ElMessageBox.confirm(`确定删除假期类型「${row.typeName}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await leaveTypeApi.remove(row.id!); ElMessage.success('已删除'); loadTypes() } catch { ElMessage.error('删除失败') }
}

// ===== 月度考勤汇总 =====
function currentMonthStr () {
  const d = new Date(); const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
const summaryMonth = ref(currentMonthStr())
const summaryList = ref<any[]>([])
const summaryLoading = ref(false)
const summaryGenerating = ref(false)
const summaryDialog = ref(false)
const summarySaving = ref(false)
const summaryForm = ref<any>({})
async function loadSummary () {
  summaryLoading.value = true
  try {
    const res: any = await attendanceSummaryApi.list(summaryMonth.value)
    summaryList.value = (res?.data ?? res) || []
  } catch { summaryList.value = [] } finally { summaryLoading.value = false }
}
async function generateSummary () {
  if (!summaryMonth.value) { ElMessage.warning('请先选择月份'); return }
  summaryGenerating.value = true
  try {
    const res: any = await attendanceSummaryApi.generate(summaryMonth.value)
    const n = res?.data ?? res
    ElMessage.success(`已生成/更新 ${n} 条汇总`); loadSummary()
  } catch { ElMessage.error('生成失败') } finally { summaryGenerating.value = false }
}
function openSummaryEdit (row: any) { summaryForm.value = { ...row }; summaryDialog.value = true }
async function saveSummary () {
  summarySaving.value = true
  try {
    await attendanceSummaryApi.edit(summaryForm.value)
    ElMessage.success('已保存'); summaryDialog.value = false; loadSummary()
  } catch { ElMessage.error('保存失败') } finally { summarySaving.value = false }
}
const userStore = useUserStore()
const isHr = computed(() => {
  const r = userStore.roles || []
  return r.includes('admin') || r.includes('hr') || r.includes('super_admin') || r.includes('boss')
})
const summaryConfirming = ref(false)
async function hrConfirmRow (row: any) {
  try { await ElMessageBox.confirm(`确认「${row.employeeName}」${row.month} 的考勤无误,并发送给本人二次确认?`, '发送确认', { type: 'warning' }) } catch { return }
  try { await attendanceSummaryApi.hrConfirm(row.id); ElMessage.success('已发送,等待员工确认'); loadSummary() } catch { ElMessage.error('操作失败') }
}
async function confirmAllRows () {
  if (!summaryMonth.value) { ElMessage.warning('请先选择月份'); return }
  try { await ElMessageBox.confirm(`确认 ${summaryMonth.value} 全部「待HR确认」的汇总并发送给员工?`, '一键发送确认', { type: 'warning' }) } catch { return }
  summaryConfirming.value = true
  try {
    const res: any = await attendanceSummaryApi.confirmAll(summaryMonth.value)
    const n = res?.data ?? res
    ElMessage.success(`已发送 ${n} 人`); loadSummary()
  } catch { ElMessage.error('操作失败') } finally { summaryConfirming.value = false }
}
async function employeeConfirmRow (row: any) {
  try { await ElMessageBox.confirm(`确认你 ${row.month} 的考勤无误?`, '确认考勤', { type: 'info' }) } catch { return }
  try { await attendanceSummaryApi.employeeConfirm(row.id); ElMessage.success('已确认'); loadSummary() } catch { ElMessage.error('操作失败') }
}
async function employeeDisputeRow (row: any) {
  try {
    const { value } = await ElMessageBox.prompt(`对 ${row.month} 的考勤有异议?请说明:`, '提出异议', { inputType: 'textarea', inputValidator: (v: string) => (v && v.trim() ? true : '请填写异议说明') })
    await attendanceSummaryApi.employeeDispute(row.id, (value || '').trim())
    ElMessage.success('已提交异议,HR 会复核'); loadSummary()
  } catch { /* 取消或失败 */ }
}
const confirmLabel = (s: number) => (['待HR确认', 'HR已确认待员工', '员工已确认', '员工有异议'][s] || '待HR确认')
const confirmTagType = (s: number) => (['info', 'warning', 'success', 'danger'][s] || 'info')

// ===== 假期额度 =====
const employees = ref<any[]>([])
const allBalances = ref<any[]>([])
const balanceLoading = ref(false)

async function loadBalanceData () {
  balanceLoading.value = true
  try {
    // 拉全员花名册:用专用 roster 接口(只回 id/姓名/部门/岗位,无身份证/手机等隐私字段),
    // 门槛=HR/管理员/老板,与设额度同一把锁,确保老板也能看到全员、而不是只剩自己一条
    const [empRes, balRes]: any = await Promise.all([
      employeeApi.roster(),
      leaveBalanceApi.listAll()
    ])
    // 兼容分页(records/list)与纯数组两种返回形状
    const empData = empRes?.data ?? empRes
    const roster: any[] = Array.isArray(empData)
      ? empData
      : (empData?.records || empData?.list || [])
    allBalances.value = (balRes?.data ?? balRes) || []

    // 已设过额度、但不在花名册里的员工(例如当前账号无HR角色、员工档案接口只回本人那条时),
    // 也补进列表,确保 HR 能看到所有需要设额度的人,而不是只剩自己一条
    const rosterIds = new Set(roster.map((e: any) => e.id))
    const merged = [...roster]
    for (const b of allBalances.value) {
      if (b.employeeId != null && !rosterIds.has(b.employeeId)) {
        rosterIds.add(b.employeeId)
        merged.push({ id: b.employeeId, name: b.employeeName || `员工#${b.employeeId}`, deptName: '', postName: '' })
      }
    }
    employees.value = merged
  } catch {
    /* ignore */
  } finally {
    balanceLoading.value = false
  }
}
loadBalanceData()
loadTypes()
loadSummary()

function empBalances (empId: number) {
  return allBalances.value.filter(b => b.employeeId === empId)
}

// 弹窗
const quotaDialog = ref(false)
const quotaEmp = ref<any>(null)
const quotaSaving = ref(false)
const quotaForm = ref<{ leaveType: string; totalDays: number }>({ leaveType: '年假', totalDays: 5 })
const quotaList = ref<any[]>([])

function openQuota (emp: any) {
  quotaEmp.value = emp
  quotaForm.value = { leaveType: '年假', totalDays: 5 }
  quotaList.value = empBalances(emp.id)
  quotaDialog.value = true
}
async function saveQuota () {
  if (!quotaForm.value.leaveType) { ElMessage.warning('请选择假期类型'); return }
  quotaSaving.value = true
  try {
    await leaveBalanceApi.save({
      employeeId: quotaEmp.value.id,
      leaveType: quotaForm.value.leaveType,
      totalDays: quotaForm.value.totalDays
    })
    ElMessage.success('已保存')
    await loadBalanceData()
    quotaList.value = empBalances(quotaEmp.value.id)
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    quotaSaving.value = false
  }
}
async function removeQuota (row: any) {
  await ElMessageBox.confirm(`确定删除「${row.leaveType}」的额度吗?`, '提示', { type: 'warning' }).catch(() => 'cancel').then(async (r) => {
    if (r === 'cancel') return
    await leaveBalanceApi.remove(row.id)
    ElMessage.success('已删除')
    await loadBalanceData()
    quotaList.value = empBalances(quotaEmp.value.id)
  })
}

// helpers
function num (v: any) { return Number(v ?? 0) || 0 }
function fmt (v: any) { const n = num(v); return n === Math.floor(n) ? String(n) : n.toFixed(1) }
function remainOf (b: any) { return Math.max(0, num(b.totalDays) - num(b.usedDays)) }
function remainColorVal (r: number, total: any) {
  if (num(total) <= 0) return '#c0c4cc'
  if (r <= 0) return '#f56c6c'
  if (r <= 1) return '#e6a23c'
  return '#3370ff'
}
function remainTagType (b: any) {
  const r = remainOf(b)
  if (r <= 0) return 'danger'
  if (r <= 1) return 'warning'
  return 'primary'
}
</script>

<style scoped>
.leave-mgmt { padding: 16px; }
.lm-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap;
  background: linear-gradient(120deg, #3370ff 0%, #5b8def 100%);
  border-radius: 14px; padding: 20px 26px; margin-bottom: 16px; color: #fff;
}
.lm-title { font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 1px; }
.lm-desc { margin: 6px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.82); }
.lm-header-quick { display: flex; gap: 10px; flex-wrap: wrap; }
.lm-quick { display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.16); border-radius: 8px; padding: 8px 14px; cursor: pointer; transition: background 0.2s ease; }
.lm-quick:hover { background: rgba(255, 255, 255, 0.28); }
.lm-quick-ico { width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); }
.lm-quick-ico :deep(.el-icon) { font-size: 15px; }
.lm-quick-label { font-size: 13px; font-weight: 500; }

.lm-tabs { margin-top: 4px; }
.lm-card { margin-top: 4px; }
.lm-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.lm-card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.lm-card-sub { font-size: 12px; color: var(--text-muted); margin-left: 10px; }
.lm-bal-tag { margin: 0 6px 6px 0; }
.lm-noset { font-size: 12px; color: var(--text-muted); }

.quota-add { display: flex; align-items: center; gap: 10px; }
.quota-unit { color: var(--text-muted); margin-right: 4px; }
.quota-tip { margin-top: 14px; }

.lm-apply-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.lm-apply-card { border: 1px solid var(--border-color); border-radius: 12px; padding: 20px 18px; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; background: #fff; }
.lm-apply-card:hover { border-color: var(--brand-primary); box-shadow: 0 6px 18px rgba(51, 112, 255, 0.12); transform: translateY(-2px); }
.lm-apply-ico { width: 44px; height: 44px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.14); }
.lm-apply-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.lm-apply-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.5; }
.lm-apply-tip { margin-top: 16px; }
</style>
