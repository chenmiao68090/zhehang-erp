<template>
  <div class="my-payslip">
    <header class="mp-head">
      <div>
        <h2 class="mp-title">我的薪资</h2>
        <p class="mp-sub">查看已发放的工资条明细,核对无误请「签字确认」,有疑问请「异常反馈」提交给 HR。</p>
      </div>
      <div class="mp-head-actions">
        <el-input v-model="payMonth" placeholder="按月份筛选 如 2026-06" clearable style="width:180px" @keyup.enter="load" @clear="load" />
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <!-- 总览 -->
    <div class="mp-overview">
      <div class="ov-card"><div class="ov-num">{{ counts.all }}</div><div class="ov-lbl">全部</div></div>
      <div class="ov-card"><div class="ov-num" style="color:#67c23a">{{ counts.confirmed }}</div><div class="ov-lbl">已确认</div></div>
      <div class="ov-card"><div class="ov-num" style="color:#e6a23c">{{ counts.pending }}</div><div class="ov-lbl">待确认</div></div>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe size="small">
      <el-table-column label="月份" prop="payMonth" width="100" align="center" />
      <el-table-column label="基本工资" prop="baseSalary" width="100" align="right"><template #default="{ row }">{{ fmt(row.baseSalary) }}</template></el-table-column>
      <el-table-column label="绩效" prop="performanceSalary" width="90" align="right"><template #default="{ row }">{{ fmt(row.performanceSalary) }}</template></el-table-column>
      <el-table-column label="提成" prop="commission" width="90" align="right"><template #default="{ row }">{{ fmt(row.commission) }}</template></el-table-column>
      <el-table-column label="扣款合计" width="100" align="right"><template #default="{ row }">{{ fmt(totalDeduct(row)) }}</template></el-table-column>
      <el-table-column label="实发工资" prop="netSalary" width="110" align="right"><template #default="{ row }"><b style="color:#409eff">{{ fmt(row.netSalary) }}</b></template></el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="STATUS_TAG[row.confirmStatus] || 'info'" effect="light">{{ STATUS_LABEL[row.confirmStatus] || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openDetail(row)">查看详情</el-button>
          <template v-if="row.confirmStatus === 1">
            <el-button size="small" link type="success" @click="confirm(row)">签字确认</el-button>
            <el-button size="small" link type="danger" @click="openFeedback(row)">异常反馈</el-button>
          </template>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无已发放的工资条" :image-size="80" /></template>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDlg.visible" :title="`工资条详情 · ${cur?.payMonth || ''}`" width="560px" destroy-on-close>
      <el-descriptions v-if="cur" :column="2" border size="small">
        <el-descriptions-item label="月份">{{ cur.payMonth }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ cur.employeeName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ cur.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ cur.postName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="出勤天数">{{ cur.actualAttendanceDays ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="事假/病假">{{ cur.personalLeave ?? 0 }} / {{ cur.sickLeave ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="基本工资">{{ fmt(cur.baseSalary) }}</el-descriptions-item>
        <el-descriptions-item label="绩效工资">{{ fmt(cur.performanceSalary) }}</el-descriptions-item>
        <el-descriptions-item label="提成">{{ fmt(cur.commission) }}</el-descriptions-item>
        <el-descriptions-item label="奖金">{{ fmt(cur.bonus) }}</el-descriptions-item>
        <el-descriptions-item label="补发">{{ fmt(cur.reissue) }}</el-descriptions-item>
        <el-descriptions-item label="社保扣款">{{ fmt(cur.socialInsuranceDeduct) }}</el-descriptions-item>
        <el-descriptions-item label="公积金扣款">{{ fmt(cur.fundDeduct) }}</el-descriptions-item>
        <el-descriptions-item label="个税扣款">{{ fmt(cur.taxDeduct) }}</el-descriptions-item>
        <el-descriptions-item label="其他扣款">{{ fmt(cur.otherDeduct) }}</el-descriptions-item>
        <el-descriptions-item label="实发工资"><b style="color:#409eff;font-size:15px">{{ fmt(cur.netSalary) }}</b></el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ cur.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag size="small" :type="STATUS_TAG[cur.confirmStatus!] || 'info'" effect="light">{{ STATUS_LABEL[cur.confirmStatus!] || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="cur.confirmStatus === 3" label="我的异议" :span="2">
          <span style="color:#f56c6c">{{ cur.feedback || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDlg.visible = false">关闭</el-button>
        <template v-if="cur?.confirmStatus === 1">
          <el-button type="danger" plain @click="openFeedback(cur!)">异常反馈</el-button>
          <el-button type="success" @click="confirm(cur!)">签字确认</el-button>
        </template>
      </template>
    </el-dialog>

    <!-- 异常反馈弹窗 -->
    <el-dialog v-model="fbDlg.visible" title="工资条异常反馈" width="480px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="异议内容" required>
          <el-input v-model="fbContent" type="textarea" :rows="4" placeholder="请说明工资条中有疑问的项目及理由,HR 将核实处理" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fbDlg.visible = false">取消</el-button>
        <el-button type="danger" :loading="fbDlg.saving" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { payslipApi, type Payslip } from '@/api/hrm'

const STATUS_LABEL: Record<number, string> = { 0: '待发放', 1: '待确认', 2: '已确认', 3: '有异议' }
const STATUS_TAG: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }

const loading = ref(false)
const rows = ref<Payslip[]>([])
const payMonth = ref('')
const counts = reactive({ all: 0, confirmed: 0, pending: 0 })

const fmt = (v: any) => (v === null || v === undefined || v === '') ? '0.00' : Number(v).toFixed(2)
const totalDeduct = (r: Payslip) =>
  (Number(r.socialInsuranceDeduct) || 0) + (Number(r.fundDeduct) || 0) + (Number(r.taxDeduct) || 0) + (Number(r.otherDeduct) || 0)

async function load() {
  loading.value = true
  try {
    const list = (await payslipApi.my(payMonth.value || undefined)) as Payslip[] || []
    rows.value = list
    counts.all = list.length
    counts.confirmed = list.filter(x => x.confirmStatus === 2).length
    counts.pending = list.filter(x => x.confirmStatus === 1).length
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 详情
const detailDlg = reactive({ visible: false })
const cur = ref<Payslip | null>(null)
function openDetail(row: Payslip) { cur.value = row; detailDlg.visible = true }

// 确认
async function confirm(row: Payslip) {
  try {
    await ElMessageBox.confirm(`确认 ${row.payMonth} 工资条无误?确认后视为签字。`, '签字确认', { type: 'success' })
    await payslipApi.confirm(row.id!)
    ElMessage.success('已确认')
    detailDlg.visible = false
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '确认失败')
  }
}

// 反馈
const fbDlg = reactive({ visible: false, saving: false })
const fbContent = ref('')
const fbRow = ref<Payslip | null>(null)
function openFeedback(row: Payslip) { fbRow.value = row; fbContent.value = ''; fbDlg.visible = true }
async function submitFeedback() {
  if (!fbContent.value.trim()) { ElMessage.warning('请填写异议内容'); return }
  fbDlg.saving = true
  try {
    await payslipApi.feedback(fbRow.value!.id!, fbContent.value.trim())
    ElMessage.success('反馈已提交')
    fbDlg.visible = false
    detailDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    fbDlg.saving = false
  }
}

onMounted(load)
</script>

<style scoped>
.my-payslip { padding: 4px 2px; }
.mp-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.mp-title { margin: 0 0 4px; font-size: 18px; }
.mp-sub { margin: 0; color: #909399; font-size: 12px; }
.mp-head-actions { display: flex; gap: 8px; }
.mp-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; max-width: 420px; }
.ov-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; text-align: center; background: #fff; }
.ov-num { font-size: 22px; font-weight: 700; }
.ov-lbl { color: #909399; font-size: 12px; margin-top: 2px; }
</style>
