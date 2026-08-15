<template>
  <div class="hrm-attendance">
    <!-- 工作时间规则说明（静态文案，对应后端固定的 09:00-18:00 规则） -->
    <el-alert
      class="rule-alert"
      :title="$t('hrm.attendance.workRuleTitle')"
      type="info"
      :description="$t('hrm.attendance.workRuleDesc')"
      show-icon
      :closable="false"
    />

    <!-- 工具栏：月份筛选 / 显示已离职 / 个人打卡 / 请假 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            value-format="YYYY-MM"
            :clearable="false"
            :placeholder="$t('hrm.attendance.month')"
            style="width:150px"
            @change="loadAll"
          />
          <el-checkbox v-model="showResigned" @change="loadAll" style="margin-left:16px">
            {{ $t('hrm.attendance.showResigned') }}
          </el-checkbox>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :disabled="clockedIn" @click="handleClockIn">{{ $t('hrm.attendance.clockIn') }}</el-button>
          <el-button type="success" :disabled="!clockedIn || clockedOut" @click="handleClockOut">{{ $t('hrm.attendance.clockOut') }}</el-button>
          <el-button type="warning" @click="leaveDialogVisible = true">{{ $t('hrm.attendance.leave') }}</el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片（8 个） -->
    <el-row :gutter="12" class="stats-row" v-loading="statsLoading">
      <el-col :span="3" v-for="card in statCards" :key="card.key">
        <el-card shadow="never" class="stat-card" :class="card.class">
          <div class="stat-value">
            <span v-if="card.gap" class="gap-text">—</span>
            <template v-else>{{ card.value }}<span v-if="card.suffix" class="stat-suffix">{{ card.suffix }}</span></template>
          </div>
          <div class="stat-label">
            {{ card.label }}
            <el-tooltip v-if="card.gap" :content="$t('hrm.attendance.noBackendTip')" placement="top">
              <el-icon class="gap-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 整体出勤率 -->
    <el-card shadow="never" class="rate-card" v-loading="statsLoading">
      <div class="rate-header">
        <span class="rate-title">{{ $t('hrm.attendance.overallRate') }}</span>
        <span class="rate-value">{{ overallRate }}%</span>
      </div>
      <el-progress :percentage="overallRate" :stroke-width="16" :color="rateColor" :show-text="false" />
    </el-card>

    <!-- 考勤明细（按员工汇总） -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('hrm.attendance.detailTitle') }}</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" :label="$t('hrm.attendance.colName')" width="110" fixed="left" />
        <el-table-column prop="deptName" :label="$t('hrm.attendance.colDept')" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.deptName || '—' }}</template>
        </el-table-column>
        <el-table-column label="月份" width="90" align="center">
          <template #default="{ row }">{{ row.month || selectedMonth }}</template>
        </el-table-column>
        <!-- 应出勤：后端按周一~周五计算当月工作日数（stats.expectedDays） -->
        <el-table-column :label="colExpectedLabel" width="90" align="center">
          <template #default="{ row }">{{ row.expectedDays }}</template>
        </el-table-column>
        <!-- 法定节假日带薪：当月被法定假冲掉的工作日数（stats.paidHolidayDays） -->
        <el-table-column label="法定节假日带薪" width="120" align="center">
          <template #default="{ row }"><span class="num-normal">{{ row.paidHolidayDays }}</span></template>
        </el-table-column>
        <el-table-column prop="actual" :label="$t('hrm.attendance.colActual')" width="90" align="center" />
        <el-table-column prop="normal" :label="$t('hrm.attendance.colNormal')" width="80" align="center">
          <template #default="{ row }"><span class="num-normal">{{ row.normal }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('hrm.attendance.colAbnormal')" width="80" align="center">
          <template #default="{ row }"><span class="num-bad">{{ row.abnormal }}</span></template>
        </el-table-column>
        <el-table-column prop="late" :label="$t('hrm.attendance.colLate')" width="70" align="center">
          <template #default="{ row }"><span :class="{ 'num-warn': row.late }">{{ row.late }}</span></template>
        </el-table-column>
        <el-table-column prop="early" :label="$t('hrm.attendance.colEarly')" width="70" align="center">
          <template #default="{ row }"><span :class="{ 'num-warn': row.early }">{{ row.early }}</span></template>
        </el-table-column>
        <el-table-column prop="absent" :label="$t('hrm.attendance.colAbsent')" width="70" align="center">
          <template #default="{ row }"><span :class="{ 'num-bad': row.absent }">{{ row.absent }}</span></template>
        </el-table-column>
        <!-- 缺卡/补卡:后端 status 无对应枚举,继续显示 — -->
        <el-table-column :label="colMissingLabel" width="70" align="center"><template #default>—</template></el-table-column>
        <el-table-column :label="colMakeupLabel" width="70" align="center"><template #default>—</template></el-table-column>
        <!-- 事假/病假:关联 hrm_leave 已通过申请按月汇总(stats.personalLeave / sickLeave) -->
        <el-table-column :label="colPersonalLabel" width="70" align="center">
          <template #default="{ row }"><span :class="{ 'num-warn': row.personalLeave }">{{ row.personalLeave }}</span></template>
        </el-table-column>
        <el-table-column :label="colSickLabel" width="70" align="center">
          <template #default="{ row }"><span :class="{ 'num-warn': row.sickLeave }">{{ row.sickLeave }}</span></template>
        </el-table-column>
        <!-- 产假/补卡费:后端确无对应字段,继续显示 — -->
        <el-table-column :label="colMaternityLabel" width="70" align="center"><template #default>—</template></el-table-column>
        <el-table-column :label="colMakeupFeeLabel" width="90" align="center"><template #default>—</template></el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadAll"
        @current-change="loadAll"
        class="pagination"
      />
    </el-card>

    <!-- 请假申请弹窗:走审批中心 leave 流程(主管批准后自动写考勤请假记录并扣年假余额) -->
    <el-dialog v-model="leaveDialogVisible" :title="$t('hrm.attendance.leave')" width="500px" destroy-on-close>
      <el-form :model="leaveForm" ref="leaveFormRef" label-width="90px">
        <el-form-item :label="$t('hrm.attendance.leaveType')" prop="leaveType">
          <el-select v-model="leaveForm.leaveType" style="width:100%">
            <el-option v-for="tOpt in LEAVE_TYPE_OPTIONS" :key="tOpt" :label="tOpt" :value="tOpt" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('hrm.attendance.leaveStart')" prop="startTime">
          <el-date-picker v-model="leaveForm.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('hrm.attendance.leaveEnd')" prop="endTime">
          <el-date-picker v-model="leaveForm.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('hrm.attendance.leaveDuration')">
          <el-input :model-value="computedDuration" disabled>
            <template #append>{{ $t('hrm.attendance.days') }}</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('hrm.attendance.leaveReason')" prop="reason">
          <el-input v-model="leaveForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leaveDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleLeaveSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { attendanceApi } from '@/api/hrm'
import { instanceApi } from '@/api/workflow'
import { employeeApi } from '@/api/org'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

const loading = ref(false)
const statsLoading = ref(false)
const leaveDialogVisible = ref(false)
const leaveFormRef = ref()
const clockedIn = ref(false)
const clockedOut = ref(false)

const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const showResigned = ref(false)

const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 按员工汇总后的明细行
interface AttendRow {
  employeeId: number
  name: string
  deptName: string
  month: string         // 月份(YYYY-MM,后端 stats.month 回传)
  expectedDays: number  // 应出勤(当月工作日数,后端按周一~周五计算)
  paidHolidayDays: number // 法定节假日带薪天数(后端 stats.paidHolidayDays)
  actual: number   // 实际出勤(=当月考勤记录数)
  normal: number
  late: number
  early: number
  absent: number   // 旷工(缺勤)
  abnormal: number // 异常 = 迟到+早退+旷工
  personalLeave: number // 事假天数(关联 hrm_leave 已通过)
  sickLeave: number     // 病假天数(关联 hrm_leave 已通过)
}
const tableData = ref<AttendRow[]>([])

// 8 个统计卡的聚合值
const summary = reactive({
  headcount: 0,   // 考勤人数(本页员工数)
  expected: 0,    // 应出勤(人次)= 各员工应出勤天数之和
  actual: 0,      // 实际打卡(人次)
  normal: 0,
  late: 0,
  early: 0,
  absent: 0,      // 旷工
  leaveDays: 0    // 事假+病假合计天数
})

// 列标签（用于后端缺字段列；与可用列区分开，方便维护）
const colExpectedLabel = computed(() => t('hrm.attendance.colExpected'))
const colMissingLabel = computed(() => t('hrm.attendance.colMissingCard'))
const colMakeupLabel = computed(() => t('hrm.attendance.colMakeup'))
const colPersonalLabel = computed(() => t('hrm.attendance.colPersonalLeave'))
const colSickLabel = computed(() => t('hrm.attendance.colSickLeave'))
const colMaternityLabel = computed(() => t('hrm.attendance.colMaternity'))
const colMakeupFeeLabel = computed(() => t('hrm.attendance.colMakeupFee'))

const statCards = computed(() => [
  { key: 'headcount', label: t('hrm.attendance.statHeadcount'), value: summary.headcount, class: 'c-blue', gap: false },
  // 应出勤(人次)= 各员工当月应出勤天数(工作日)之和,后端 stats.expectedDays 提供
  { key: 'expected', label: t('hrm.attendance.statExpected'), value: summary.expected, class: 'c-cyan', gap: false },
  { key: 'actual', label: t('hrm.attendance.statActualClock'), value: summary.actual, class: 'c-teal', gap: false },
  { key: 'normal', label: t('hrm.attendance.statNormal'), value: summary.normal, class: 'c-green', gap: false },
  { key: 'late', label: t('hrm.attendance.statLate'), value: summary.late, class: 'c-orange', gap: false },
  { key: 'absent', label: t('hrm.attendance.statAbsent'), value: summary.absent, class: 'c-red', gap: false },
  // 缺卡:后端 status 无“缺卡”枚举 → gapsNoBackend
  { key: 'missing', label: t('hrm.attendance.statMissingCard'), value: 0, class: 'c-purple', gap: true },
  // 事假病假(h):请假为独立模块且不计入考勤小时 → gapsNoBackend
  { key: 'leaveHours', label: t('hrm.attendance.statLeaveHours'), value: 0, suffix: 'h', class: 'c-gray', gap: true }
])

// 整体出勤率 = 正常 / (正常+迟到+早退+旷工)
const overallRate = computed(() => {
  const denom = summary.normal + summary.late + summary.early + summary.absent
  if (!denom) return 0
  return Math.round((summary.normal / denom) * 1000) / 10
})

const rateColor = computed(() => {
  if (overallRate.value >= 95) return '#67c23a'
  if (overallRate.value >= 85) return '#e6a23c'
  return '#f56c6c'
})

// 请假类型与审批中心 leave 流程表单一致(中文值直传;年假会做余额校验与预扣)
const LEAVE_TYPE_OPTIONS = ['年假', '调休', '事假', '病假', '婚假', '产假', '陪产假', '育儿假', '丧假']
const leaveForm = reactive({ leaveType: '年假', startTime: '', endTime: '', reason: '', employeeId: 0 })

const computedDuration = computed(() => {
  if (!leaveForm.startTime || !leaveForm.endTime) return '0'
  const diff = new Date(leaveForm.endTime).getTime() - new Date(leaveForm.startTime).getTime()
  return (diff / (1000 * 60 * 60 * 24)).toFixed(1)
})

/**
 * 加载考勤统计:
 * 1) 拉员工列表(后端已按数据范围收敛:HR/管理员看全部,普通员工只看自己一条)。
 *    showResigned 关闭时只看在职/试用(status 1、2),开启则不传 status(含离职 3)。
 * 2) 对每个员工调 /hrm/attendance/stats?employeeId&month 取月度统计,拼成明细行并汇总卡片。
 *    stats 返回 {normal,late,early,absent,total};total=当月考勤记录数=实际出勤/打卡人次。
 */
async function loadAll() {
  loading.value = true
  statsLoading.value = true
  try {
    const empRes: any = await employeeApi.list({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: showResigned.value ? undefined : 1 // 后端 status 单值;不显示离职时只取在职(1)
    })
    const employees: any[] = empRes.data?.records || []
    total.value = empRes.data?.total || employees.length

    // 当前登录用户对应的员工(用于请假表单 employeeId 兜底)
    const myUserId = userStore.userInfo?.userId || userStore.userInfo?.id
    const mine = employees.find(e => Number(e.userId) === Number(myUserId))
    if (mine) leaveForm.employeeId = mine.id

    // 并发取每位员工的月度统计
    const statsList = await Promise.all(
      employees.map(e =>
        attendanceApi.stats({ employeeId: e.id, month: selectedMonth.value })
          .then((r: any) => ({ emp: e, s: r.data || {} }))
          .catch(() => ({ emp: e, s: {} as any }))
      )
    )

    let sNormal = 0, sLate = 0, sEarly = 0, sAbsent = 0, sActual = 0, sExpected = 0, sLeave = 0
    tableData.value = statsList.map(({ emp, s }) => {
      const normal = Number(s.normal || 0)
      const late = Number(s.late || 0)
      const early = Number(s.early || 0)
      const absent = Number(s.absent || 0)
      const actual = Number(s.total || 0)
      const expectedDays = Number(s.expectedDays || 0)
      const paidHolidayDays = Number(s.paidHolidayDays || 0)
      const personalLeave = Number(s.personalLeave || 0)
      const sickLeave = Number(s.sickLeave || 0)
      sNormal += normal; sLate += late; sEarly += early; sAbsent += absent; sActual += actual
      sExpected += expectedDays; sLeave += personalLeave + sickLeave
      return {
        employeeId: emp.id,
        name: emp.name || '',
        deptName: emp.deptName || '',
        month: s.month || selectedMonth.value,
        expectedDays,
        paidHolidayDays,
        actual,
        normal,
        late,
        early,
        absent,
        abnormal: late + early + absent,
        personalLeave,
        sickLeave
      }
    })

    summary.headcount = total.value
    summary.expected = sExpected
    summary.actual = sActual
    summary.normal = sNormal
    summary.late = sLate
    summary.early = sEarly
    summary.absent = sAbsent
    summary.leaveDays = sLeave
  } catch {
    tableData.value = []
    total.value = 0
    summary.headcount = 0; summary.expected = 0; summary.actual = 0; summary.normal = 0; summary.late = 0; summary.early = 0; summary.absent = 0; summary.leaveDays = 0
  } finally {
    loading.value = false
    statsLoading.value = false
  }
}

async function handleClockIn() {
  if (!leaveForm.employeeId) { ElMessage.warning(t('hrm.attendance.needEmployeeProfile')); return }
  await attendanceApi.clockIn(leaveForm.employeeId)
  ElMessage.success(t('hrm.attendance.clockInSuccess'))
  clockedIn.value = true
  loadAll()
}

async function handleClockOut() {
  if (!leaveForm.employeeId) return
  await attendanceApi.clockOut(leaveForm.employeeId)
  ElMessage.success(t('hrm.attendance.clockOutSuccess'))
  clockedOut.value = true
  loadAll()
}

async function handleLeaveSubmit() {
  // 收编:请假不再直写 hrm_leave(旧口径批不批考勤都不认),改走审批中心 leave 流程;
  // 主管批准后由后端回调写请假记录(考勤统计才认账),天数由服务端按半天重算
  if (!leaveForm.leaveType || !leaveForm.startTime || !leaveForm.endTime) {
    ElMessage.warning('请填写请假类型与起止时间')
    return
  }
  if (!leaveForm.reason || !leaveForm.reason.trim()) {
    ElMessage.warning('请填写请假事由')
    return
  }
  const toHalf = (dt: string) => ({
    date: dt.slice(0, 10),
    ampm: new Date(dt.replace(/-/g, '/')).getHours() < 12 ? '上午' : '下午'
  })
  const s = toHalf(leaveForm.startTime)
  const e = toHalf(leaveForm.endTime)
  const formData = {
    leaveType: leaveForm.leaveType,
    startDate: s.date,
    startAmpm: s.ampm,
    endDate: e.date,
    endAmpm: e.ampm,
    days: parseFloat(computedDuration.value),
    reason: leaveForm.reason.trim()
  }
  try {
    await instanceApi.start({
      processKey: 'leave',
      title: `请假申请-${leaveForm.leaveType}`,
      formData
    })
    ElMessage.success('已提交请假审批,主管批准后自动计入考勤')
    leaveDialogVisible.value = false
  } catch (err: any) {
    ElMessage.error(err?.message || '提交失败')
  }
}

onMounted(loadAll)
</script>

<style scoped>
.hrm-attendance { padding: 16px; }
.rule-alert { margin-bottom: 12px; }
.toolbar-card { margin-bottom: 12px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.toolbar-left { display: flex; align-items: center; }
.stats-row { margin-bottom: 12px; }
.stat-card { text-align: center; padding: 10px 0; border-radius: 6px; }
.stat-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.stat-suffix { font-size: 14px; margin-left: 2px; font-weight: 500; }
.gap-text { color: #c0c4cc; font-weight: 500; }
.stat-label { font-size: 12px; color: #909399; margin-top: 6px; }
.gap-icon { font-size: 12px; color: #c0c4cc; vertical-align: middle; margin-left: 2px; cursor: help; }
.c-blue .stat-value { color: #409eff; }
.c-cyan .stat-value { color: #17c0c0; }
.c-teal .stat-value { color: #13a8a8; }
.c-green .stat-value { color: #67c23a; }
.c-orange .stat-value { color: #e6a23c; }
.c-red .stat-value { color: #f56c6c; }
.c-purple .stat-value { color: #909bf5; }
.c-gray .stat-value { color: #909399; }
.rate-card { margin-bottom: 12px; }
.rate-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.rate-title { font-size: 14px; font-weight: 600; color: #303133; }
.rate-value { font-size: 22px; font-weight: 700; color: #3370ff; }
.table-card .card-header { display: flex; justify-content: space-between; align-items: center; }
.num-normal { color: #67c23a; }
.num-warn { color: #e6a23c; font-weight: 600; }
.num-bad { color: #f56c6c; font-weight: 600; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
