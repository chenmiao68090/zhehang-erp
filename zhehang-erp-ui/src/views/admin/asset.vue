<template>
  <div class="asset-mgr">
    <header class="am-head">
      <div>
        <h2 class="am-title">固定资产管理</h2>
        <p class="am-sub">固定资产全生命周期台账:采购入库 → 领用分配 → 维保维修 → 报废,统一编号登记与状态流转。</p>
      </div>
    </header>

    <div class="am-bar">
      <el-input v-model="kw" class="am-search" placeholder="搜单号/名称/领用人…" clearable @keyup.enter="reload" @clear="reload" />
      <el-select v-model="filterCategory" placeholder="分类" clearable class="am-filter" @change="reload">
        <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable class="am-filter" @change="reload">
        <el-option v-for="s in STATUSES" :key="s" :label="s" :value="s" />
      </el-select>
      <div class="am-bar-right">
        <el-button @click="openOffboard"><el-icon><Search /></el-icon> 离职归还校验</el-button>
        <el-button type="primary" @click="openDlg()"><el-icon><Plus /></el-icon> 新增资产</el-button>
      </div>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="资产编号" prop="assetNo" min-width="130" show-overflow-tooltip />
      <el-table-column label="资产名称" prop="assetName" min-width="140" show-overflow-tooltip />
      <el-table-column label="分类" prop="category" width="120" />
      <el-table-column label="数量" prop="quantity" width="72" align="right" />
      <el-table-column label="总金额" width="120" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="96">
        <template #default="{ row }">
          <el-tag size="small" :type="statusTag(row.status)" effect="plain">{{ row.status || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领用人" prop="holder" width="100" show-overflow-tooltip />
      <el-table-column label="所属部门" prop="holderDept" width="110" show-overflow-tooltip />
      <el-table-column label="入库时间" prop="inDate" width="110" />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" :disabled="isScrapped(row)" @click="openClaim(row)">领用</el-button>
          <el-button size="small" link type="success" :disabled="!row.holderId" @click="doReturn(row)">归还</el-button>
          <el-button size="small" link type="warning" :disabled="isScrapped(row)" @click="openMaintain(row)">维保</el-button>
          <el-button size="small" link type="danger" :disabled="isScrapped(row)" @click="doScrap(row)">报废</el-button>
          <el-button size="small" link @click="openRecords(row)">流水</el-button>
          <el-button size="small" link @click="openDlg(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="remove(row)">删</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有固定资产记录,先把办公设备/电子设备等登记入账" :image-size="80">
          <el-button type="primary" @click="openDlg()">新增资产</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 新增/编辑 -->
    <el-dialog v-model="dlg.visible" :title="form.id ? '编辑资产' : '新增资产'" width="680px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-divider content-position="left">采购入库</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="资产编号" required><el-input v-model="form.assetNo" placeholder="入库单号/资产编号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="资产名称" required><el-input v-model="form.assetName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="资产分类">
            <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
              <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option v-for="s in STATUSES" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="数量"><el-input-number v-model="form.quantity" :min="0" :precision="0" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="总金额"><el-input-number v-model="form.amount" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="入库时间"><el-date-picker v-model="form.inDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="经办人"><el-input v-model="form.operator" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="关联审批单"><el-input v-model="form.relatedApproval" placeholder="关联采购审批单号" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">领用分配</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="领用人"><el-input v-model="form.holder" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所属部门"><el-input v-model="form.holderDept" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="领用日期"><el-date-picker v-model="form.useDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="领用类型">
            <el-select v-model="form.useType" placeholder="选择领用类型" clearable style="width: 100%">
              <el-option v-for="t in USE_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">维保维修</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="维保类型">
            <el-select v-model="form.maintainType" placeholder="选择维保类型" clearable style="width: 100%">
              <el-option v-for="t in MAINTAIN_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="维修费用"><el-input-number v-model="form.maintainFee" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="故障描述"><el-input v-model="form.faultDesc" type="textarea" :rows="2" placeholder="故障/保养情况说明" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">其他</el-divider>
        <el-form-item label="附件"><el-input v-model="form.attach" placeholder="附件URL/说明" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="dlg.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 领用 -->
    <el-dialog v-model="claimDlg.visible" title="资产领用" width="480px" destroy-on-close>
      <el-form :model="claimForm" label-width="90px">
        <el-form-item label="资产"><span class="am-asset-name">{{ claimDlg.asset?.assetName }}({{ claimDlg.asset?.assetNo }})</span></el-form-item>
        <el-form-item label="领用人" required>
          <el-select v-model="claimForm.employeeId" filterable placeholder="选择领用员工" style="width: 100%"
                     :loading="empLoading" @change="onEmpChange">
            <el-option v-for="e in employees" :key="e.id" :label="empLabel(e)" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用日期"><el-date-picker v-model="claimForm.recordDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="claimForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="claimDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="claimDlg.saving" @click="submitClaim">确认领用</el-button>
      </template>
    </el-dialog>

    <!-- 维保 -->
    <el-dialog v-model="maintainDlg.visible" title="资产维保" width="480px" destroy-on-close>
      <el-form :model="maintainForm" label-width="90px">
        <el-form-item label="资产"><span class="am-asset-name">{{ maintainDlg.asset?.assetName }}({{ maintainDlg.asset?.assetNo }})</span></el-form-item>
        <el-form-item label="维保日期"><el-date-picker v-model="maintainForm.recordDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item>
        <el-form-item label="维修费用"><el-input-number v-model="maintainForm.amount" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item>
        <el-form-item label="动作后状态">
          <el-select v-model="maintainForm.status" placeholder="维保后资产状态(可选)" clearable style="width: 100%">
            <el-option v-for="s in STATUSES" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="maintainForm.remark" type="textarea" :rows="2" placeholder="故障/保养情况说明" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintainDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="maintainDlg.saving" @click="submitMaintain">确认维保</el-button>
      </template>
    </el-dialog>

    <!-- 流水抽屉 -->
    <el-drawer v-model="recDrawer.visible" :title="`流水 · ${recDrawer.asset?.assetName || ''}`" size="420px">
      <div v-loading="recDrawer.loading">
        <el-timeline v-if="records.length">
          <el-timeline-item v-for="r in records" :key="r.id"
                            :type="recTagType(r.type)"
                            :timestamp="r.recordDate || (r.createTime || '').slice(0, 10)" placement="top">
            <div class="am-rec">
              <el-tag size="small" :type="recTagType(r.type)" effect="dark">{{ r.type }}</el-tag>
              <span v-if="r.employeeName" class="am-rec-emp">{{ r.employeeName }}</span>
              <span v-if="r.status" class="am-rec-status">→ {{ r.status }}</span>
            </div>
            <div v-if="r.amount" class="am-rec-amount">费用:¥{{ fmtMoney(r.amount) }}</div>
            <div v-if="r.remark" class="am-rec-remark">{{ r.remark }}</div>
            <div class="am-rec-operator">经办:{{ r.operator || '—' }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无流水记录" :image-size="70" />
      </div>
    </el-drawer>

    <!-- 离职归还校验 -->
    <el-dialog v-model="offboardDlg.visible" title="离职归还校验" width="640px" destroy-on-close>
      <div class="am-offboard-bar">
        <el-select v-model="offboardDlg.employeeId" filterable placeholder="选择待离职员工" style="width: 280px"
                   :loading="empLoading" @change="checkOffboard">
          <el-option v-for="e in employees" :key="e.id" :label="empLabel(e)" :value="e.id" />
        </el-select>
        <span v-if="offboardDlg.employeeId" class="am-offboard-hint">
          名下未归还资产 <b>{{ offboardRows.length }}</b> 件
        </span>
      </div>
      <el-table :data="offboardRows" v-loading="offboardDlg.loading" border stripe max-height="360" style="margin-top: 12px">
        <el-table-column label="资产编号" prop="assetNo" min-width="120" show-overflow-tooltip />
        <el-table-column label="资产名称" prop="assetName" min-width="130" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }"><el-tag size="small" :type="statusTag(row.status)" effect="plain">{{ row.status || '—' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }"><el-button size="small" link type="success" @click="returnInOffboard(row)">归还</el-button></template>
        </el-table-column>
        <template #empty>
          <el-empty :description="offboardDlg.employeeId ? '该员工名下无未归还资产,可放行离职' : '请选择员工'" :image-size="70" />
        </template>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { assetApi, type AdminAsset, type AdminAssetRecord } from '@/api/admin'
import { employeeApi } from '@/api/org'

const CATEGORIES = ['办公设备', '电子设备', '税控专用设备', '家具', '其他']
const STATUSES = ['待验收', '已入库', '在用', '闲置', '领用中', '已归还', '维修中', '已报废', '报废', '已驳回']
const USE_TYPES = ['永久领用', '临时领用']
const MAINTAIN_TYPES = ['故障维修', '定期保养']

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const statusTag = (s?: string) => {
  switch (s) {
    case '已入库':
    case '闲置': return 'success'
    case '在用':
    case '领用中': return 'primary'
    case '维修中': return 'warning'
    case '已报废':
    case '报废':
    case '已驳回': return 'danger'
    case '待验收':
    case '已归还': return 'info'
    default: return 'info'
  }
}
const isScrapped = (row: AdminAsset) => row.status === '报废' || row.status === '已报废'

const rows = ref<AdminAsset[]>([])
const loading = ref(false)
const kw = ref('')
const filterStatus = ref<string>()
const filterCategory = ref<string>()

const load = async () => {
  loading.value = true
  try {
    const res: any = await assetApi.list({ keyword: kw.value || undefined, status: filterStatus.value || undefined, category: filterCategory.value || undefined })
    rows.value = (res?.data ?? res) || []
  } catch { rows.value = [] } finally { loading.value = false }
}
const reload = () => load()

// ============ 员工下拉 ============
interface EmpOption { id: number | string; name?: string; empCode?: string; deptName?: string }
const employees = ref<EmpOption[]>([])
const empLoading = ref(false)
const empLabel = (e: EmpOption) => `${e.name || ''}${e.deptName ? ' · ' + e.deptName : ''}${e.empCode ? ' (' + e.empCode + ')' : ''}`
const loadEmployees = async () => {
  if (employees.value.length) return
  empLoading.value = true
  try {
    const res: any = await employeeApi.options()
    const rows = res?.data ?? res
    employees.value = Array.isArray(rows) ? rows : []
  } catch { employees.value = [] } finally { empLoading.value = false }
}

// ============ 新增/编辑 ============
const dlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<AdminAsset>({})
const openDlg = (row?: AdminAsset) => {
  form.value = row ? { ...row } : { category: '办公设备', status: '待验收', quantity: 1, amount: 0, inDate: todayStr() }
  dlg.value = { visible: true, saving: false }
}
const submit = async () => {
  if (!form.value.assetNo) { ElMessage.warning('请填写资产编号'); return }
  if (!form.value.assetName) { ElMessage.warning('请填写资产名称'); return }
  dlg.value.saving = true
  try {
    await assetApi.save(form.value)
    ElMessage.success('已保存'); dlg.value.visible = false; load()
  } catch { ElMessage.error('保存失败') } finally { dlg.value.saving = false }
}
const remove = async (row: AdminAsset) => {
  try { await ElMessageBox.confirm(`删除资产「${row.assetName || row.assetNo}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await assetApi.remove(row.id!); ElMessage.success('已删除'); load() } catch { ElMessage.error('删除失败') }
}

// ============ 领用 ============
const claimDlg = ref<{ visible: boolean; saving: boolean; asset?: AdminAsset }>({ visible: false, saving: false })
const claimForm = ref<{ employeeId?: number | string; employeeName?: string; recordDate?: string; remark?: string }>({})
const openClaim = (row: AdminAsset) => {
  claimDlg.value = { visible: true, saving: false, asset: row }
  claimForm.value = { recordDate: todayStr() }
  loadEmployees()
}
const onEmpChange = (id: number | string) => {
  const e = employees.value.find(x => x.id === id)
  claimForm.value.employeeName = e?.name
}
const submitClaim = async () => {
  if (!claimForm.value.employeeId) { ElMessage.warning('请选择领用人'); return }
  claimDlg.value.saving = true
  try {
    await assetApi.claim(claimDlg.value.asset!.id!, {
      employeeId: claimForm.value.employeeId,
      employeeName: claimForm.value.employeeName,
      recordDate: claimForm.value.recordDate,
      remark: claimForm.value.remark
    })
    ElMessage.success('领用成功'); claimDlg.value.visible = false; load()
  } catch { ElMessage.error('领用失败') } finally { claimDlg.value.saving = false }
}

// ============ 归还 ============
const doReturn = async (row: AdminAsset) => {
  try { await ElMessageBox.confirm(`确认归还资产「${row.assetName || row.assetNo}」(当前领用人:${row.holder || '—'})?`, '归还', { type: 'warning' }) } catch { return }
  try {
    await assetApi.return(row.id!, { recordDate: todayStr() })
    ElMessage.success('已归还'); load()
  } catch { ElMessage.error('归还失败') }
}

// ============ 维保 ============
const maintainDlg = ref<{ visible: boolean; saving: boolean; asset?: AdminAsset }>({ visible: false, saving: false })
const maintainForm = ref<{ recordDate?: string; amount?: number; status?: string; remark?: string }>({})
const openMaintain = (row: AdminAsset) => {
  maintainDlg.value = { visible: true, saving: false, asset: row }
  maintainForm.value = { recordDate: todayStr(), status: '维修中' }
}
const submitMaintain = async () => {
  maintainDlg.value.saving = true
  try {
    await assetApi.maintain(maintainDlg.value.asset!.id!, {
      recordDate: maintainForm.value.recordDate,
      amount: maintainForm.value.amount,
      status: maintainForm.value.status,
      remark: maintainForm.value.remark
    })
    ElMessage.success('维保记录已登记'); maintainDlg.value.visible = false; load()
  } catch { ElMessage.error('维保登记失败') } finally { maintainDlg.value.saving = false }
}

// ============ 报废 ============
const doScrap = async (row: AdminAsset) => {
  try { await ElMessageBox.confirm(`确认报废资产「${row.assetName || row.assetNo}」?报废后不可领用。`, '报废', { type: 'warning' }) } catch { return }
  try {
    await assetApi.scrap(row.id!, { recordDate: todayStr() })
    ElMessage.success('已报废'); load()
  } catch { ElMessage.error('报废失败') }
}

// ============ 流水抽屉 ============
const recDrawer = ref<{ visible: boolean; loading: boolean; asset?: AdminAsset }>({ visible: false, loading: false })
const records = ref<AdminAssetRecord[]>([])
const recTagType = (t?: string) => {
  switch (t) {
    case '入库': return 'success'
    case '领用': return 'primary'
    case '归还': return 'info'
    case '维保': return 'warning'
    case '报废': return 'danger'
    default: return 'info'
  }
}
const openRecords = async (row: AdminAsset) => {
  recDrawer.value = { visible: true, loading: true, asset: row }
  records.value = []
  try {
    const res: any = await assetApi.records(row.id!)
    records.value = (res?.data ?? res) || []
  } catch { records.value = [] } finally { recDrawer.value.loading = false }
}

// ============ 离职归还校验 ============
const offboardDlg = ref<{ visible: boolean; loading: boolean; employeeId?: number | string }>({ visible: false, loading: false })
const offboardRows = ref<AdminAsset[]>([])
const openOffboard = () => {
  offboardDlg.value = { visible: true, loading: false, employeeId: undefined }
  offboardRows.value = []
  loadEmployees()
}
const checkOffboard = async (id: number | string) => {
  if (!id) { offboardRows.value = []; return }
  offboardDlg.value.loading = true
  try {
    const res: any = await assetApi.unreturned(id)
    offboardRows.value = (res?.data ?? res) || []
  } catch { offboardRows.value = [] } finally { offboardDlg.value.loading = false }
}
const returnInOffboard = async (row: AdminAsset) => {
  try { await ElMessageBox.confirm(`确认归还资产「${row.assetName || row.assetNo}」?`, '归还', { type: 'warning' }) } catch { return }
  try {
    await assetApi.return(row.id!, { recordDate: todayStr() })
    ElMessage.success('已归还')
    if (offboardDlg.value.employeeId) checkOffboard(offboardDlg.value.employeeId)
    load()
  } catch { ElMessage.error('归还失败') }
}

onMounted(() => load())
</script>

<style scoped>
.asset-mgr { padding: 16px 18px; }
.am-head { margin-bottom: 6px; }
.am-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.am-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.am-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.am-bar-right { margin-left: auto; display: flex; gap: 12px; }
.am-search { width: 220px; }
.am-filter { width: 130px; }
.am-asset-name { font-weight: 600; color: var(--el-text-color-primary); }
.am-rec { display: flex; align-items: center; gap: 8px; }
.am-rec-emp { font-weight: 600; color: var(--el-text-color-primary); }
.am-rec-status { color: var(--el-text-color-secondary); font-size: 13px; }
.am-rec-amount { margin-top: 4px; font-size: 13px; color: var(--el-color-warning); }
.am-rec-remark { margin-top: 4px; font-size: 13px; color: var(--el-text-color-regular); }
.am-rec-operator { margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); }
.am-offboard-bar { display: flex; align-items: center; gap: 14px; }
.am-offboard-hint { font-size: 13px; color: var(--el-text-color-secondary); }
.am-offboard-hint b { color: var(--el-color-danger); font-size: 15px; }
</style>
