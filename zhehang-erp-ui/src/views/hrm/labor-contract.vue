<template>
  <div class="labor-contract">
    <header class="lc-head">
      <div>
        <h2 class="lc-title">劳动合同管理</h2>
        <p class="lc-sub">登记员工劳动合同(编号/类型/起止/约定薪资/附件),按到期日跟进续签,并可主动提醒即将到期的员工。</p>
      </div>
      <div class="lc-head-actions">
        <el-button type="primary" :icon="Plus" @click="openEdit()">新增合同</el-button>
        <el-button :icon="Bell" @click="remind">发送到期提醒</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <!-- 总览计数(点击筛选) -->
    <div class="lc-overview">
      <div class="ov-card" :class="{ active: query.status === undefined }" @click="filterStatus(undefined)">
        <div class="ov-num">{{ counts.all }}</div>
        <div class="ov-lbl">全部</div>
      </div>
      <div class="ov-card" :class="{ active: query.status === 1 }" @click="filterStatus(1)">
        <div class="ov-num" style="color:#67c23a">{{ counts.active }}</div>
        <div class="ov-lbl">生效</div>
      </div>
      <div class="ov-card" :class="{ active: query.status === 2 }" @click="filterStatus(2)">
        <div class="ov-num" style="color:#f56c6c">{{ counts.expiring }}</div>
        <div class="ov-lbl">即将到期</div>
      </div>
      <div class="ov-card" :class="{ active: query.status === 3 }" @click="filterStatus(3)">
        <div class="ov-num" style="color:#e6a23c">{{ counts.expired }}</div>
        <div class="ov-lbl">已到期</div>
      </div>
      <div class="ov-card" :class="{ active: query.status === 4 }" @click="filterStatus(4)">
        <div class="ov-num" style="color:#909399">{{ counts.terminated }}</div>
        <div class="ov-lbl">已终止</div>
      </div>
    </div>

    <!-- 筛选 -->
    <el-card shadow="never" class="lc-filter">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="员工">
          <el-select v-model="query.employeeId" filterable clearable placeholder="全部员工" style="width: 180px" @change="load">
            <el-option v-for="e in employees" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同类型">
          <el-select
            v-model="query.contractType"
            clearable
            :loading="contractTypeLoading"
            :disabled="!contractTypeResolved"
            placeholder="全部类型"
            style="width: 200px"
            @change="load"
          >
            <el-option v-for="t in contractTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期区间">
          <el-date-picker
            v-model="endRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 260px"
            @change="load" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="reset">重置</el-button>
          <el-button link type="danger" @click="quickExpiring">即将到期(30天)</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="lc-table-card">
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column label="员工" prop="employeeName" min-width="100" />
        <el-table-column label="部门" prop="deptName" min-width="120" show-overflow-tooltip />
        <el-table-column label="合同编号" prop="contractNo" min-width="140" show-overflow-tooltip />
        <el-table-column label="合同类型" prop="contractType" min-width="150" show-overflow-tooltip />
        <el-table-column label="起止" min-width="200" align="center">
          <template #default="{ row }">
            {{ row.startDate || '-' }} ~ {{ row.endDate || '长期' }}
          </template>
        </el-table-column>
        <el-table-column label="剩余天数" width="110" align="center">
          <template #default="{ row }">
            <span v-if="!row.endDate" style="color:#909399">-</span>
            <span v-else :style="remainStyle(row.endDate)">{{ remainDays(row.endDate) }} 天</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无劳动合同" :image-size="80" />
        </template>
      </el-table>
      <div class="lc-pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="query.pageNum"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          @current-change="(p:number) => { query.pageNum = p; load() }"
          @size-change="(s:number) => { query.pageSize = s; query.pageNum = 1; load() }" />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dlg.visible" :title="dlg.form.id ? '编辑劳动合同' : '新增劳动合同'" width="620px" @closed="onDlgClosed">
      <el-form :model="dlg.form" label-width="96px">
        <el-form-item label="员工" required>
          <el-select v-model="dlg.form.employeeId" filterable placeholder="选择员工" style="width: 100%" @change="onEmpChange">
            <el-option v-for="e in employees" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="dlg.form.contractNo" placeholder="合同编号" />
        </el-form-item>
        <el-form-item label="合同类型" required>
          <el-select
            v-model="dlg.form.contractType"
            :loading="contractTypeLoading"
            :disabled="!contractTypeResolved"
            placeholder="选择合同类型"
            style="width: 100%"
          >
            <el-option
              v-for="t in contractTypeEditOptions"
              :key="t.value"
              :label="t.label"
              :value="t.value"
              :disabled="t.disabled"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker v-model="dlg.form.signDate" type="date" value-format="YYYY-MM-DD" placeholder="签订日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合同期限">
          <el-date-picker v-model="dlg.form.startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" style="width: 47%" />
          <span style="margin: 0 6px">~</span>
          <el-date-picker v-model="dlg.form.endDate" type="date" value-format="YYYY-MM-DD" placeholder="结束日期(无固定期限可空)" style="width: 47%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dlg.form.status" style="width: 100%">
            <el-option v-for="s in STATUS_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="约定薪资">
          <el-input-number v-model="dlg.form.salaryAgreed" :min="0" :precision="2" :controls="false" placeholder="约定薪资(元)" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合同附件">
          <el-upload
            :show-file-list="false"
            :before-upload="onUpload"
            :disabled="dlg.uploading">
            <el-button :loading="dlg.uploading" :icon="Upload">{{ dlg.attachmentName || '上传附件' }}</el-button>
          </el-upload>
          <el-button v-if="dlg.form.attachmentFileId" link type="danger" style="margin-left:8px" @click="clearAttachment">移除</el-button>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dlg.form.remark" type="textarea" :rows="2" placeholder="备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="dlg.saving" :disabled="!contractTypeResolved" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Refresh, Bell, Upload } from '@element-plus/icons-vue'
import { laborContractApi, type LaborContract } from '@/api/hrm'
import { employeeApi } from '@/api/org'
import { fileInfoApi } from '@/api/file'
import { useFieldOptions } from '@/composables/useFieldOptions'

const CONTRACT_TYPES = ['固定期限', '无固定期限', '以完成一定工作为期限']
const {
  options: contractTypeOptions,
  loading: contractTypeLoading,
  resolved: contractTypeResolved,
  defaultValue: contractTypeDefaultValue,
  withHistoricalValues: withContractTypeHistory,
  isSelectable: isContractTypeSelectable
} = useFieldOptions('hr_labor_contract_type', CONTRACT_TYPES)
const STATUS_OPTIONS = [
  { value: 1, label: '生效' },
  { value: 2, label: '即将到期' },
  { value: 3, label: '已到期' },
  { value: 4, label: '已终止' },
  { value: 5, label: '已续签' }
]

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const counts = reactive({ all: 0, active: 0, expiring: 0, expired: 0, terminated: 0 })
const employees = ref<any[]>([])
const endRange = ref<string[] | null>(null)

const query = reactive<{
  pageNum: number; pageSize: number; employeeId?: number; contractType?: string; status?: number
}>({ pageNum: 1, pageSize: 10 })

const dlg = reactive<{
  visible: boolean; saving: boolean; uploading: boolean; attachmentName: string; form: LaborContract
}>({ visible: false, saving: false, uploading: false, attachmentName: '', form: {} })
const contractTypeEditOptions = computed(() => withContractTypeHistory(dlg.form.contractType))

function applyContractTypeDefault() {
  if (!dlg.visible || dlg.form.id || dlg.form.contractType || !contractTypeResolved.value) return
  dlg.form.contractType = contractTypeDefaultValue.value || undefined
}

watch([contractTypeResolved, contractTypeDefaultValue], applyContractTypeDefault)

// 计算结束日期距今天还有多少天(只按自然日算差值)
function remainDays(endDate?: string): number {
  if (!endDate) return 0
  const end = new Date(endDate)
  const today = new Date()
  end.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86400000)
}
function remainStyle(endDate?: string) {
  const d = remainDays(endDate)
  return d <= 30 ? { color: '#f56c6c', fontWeight: 600 } : {}
}
function statusText(s?: number) {
  return STATUS_OPTIONS.find(o => o.value === s)?.label || '-'
}
function statusTag(s?: number): any {
  return ({ 1: 'success', 2: 'danger', 3: 'warning', 4: 'info', 5: 'primary' } as any)[s ?? 0] || 'info'
}

async function load() {
  loading.value = true
  try {
    const params: any = { pageNum: query.pageNum, pageSize: query.pageSize }
    if (query.employeeId) params.employeeId = query.employeeId
    if (query.contractType) params.contractType = query.contractType
    if (query.status !== undefined) params.status = query.status
    if (endRange.value && endRange.value.length === 2) {
      params.endFrom = endRange.value[0]
      params.endTo = endRange.value[1]
    }
    const res: any = await laborContractApi.list(params)
    const page = res?.page || {}
    list.value = page.records || []
    total.value = page.total || 0
    const c = res?.counts || {}
    counts.all = c.all || 0
    counts.active = c.active || 0
    counts.expiring = c.expiring || 0
    counts.expired = c.expired || 0
    counts.terminated = c.terminated || 0
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function filterStatus(s?: number) {
  query.status = s
  query.pageNum = 1
  load()
}
function reset() {
  query.employeeId = undefined
  query.contractType = undefined
  query.status = undefined
  endRange.value = null
  query.pageNum = 1
  load()
}
// 快捷:查未来 30 天内到期(即将到期状态)
function quickExpiring() {
  const today = new Date()
  const later = new Date(today.getTime() + 30 * 86400000)
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  endRange.value = [fmt(today), fmt(later)]
  query.status = undefined
  query.pageNum = 1
  load()
}

async function loadEmployees() {
  try {
    const l = (await employeeApi.roster()) as any[] || []
    employees.value = l.filter(e => e.status !== 3) // 过滤离职
  } catch { employees.value = [] }
}

function openEdit(row?: any) {
  if (row) {
    dlg.form = { ...row }
    dlg.attachmentName = row.attachmentFileId ? '已上传附件' : ''
  } else {
    dlg.form = { status: 1 }
    dlg.attachmentName = ''
  }
  dlg.visible = true
  applyContractTypeDefault()
}
function onDlgClosed() {
  dlg.form = {}
  dlg.attachmentName = ''
  dlg.uploading = false
}
// 选员工时带出姓名/部门(roster 提供 name/deptName)
function onEmpChange(id: number) {
  const e = employees.value.find(x => x.id === id)
  if (e) {
    dlg.form.employeeName = e.name
    dlg.form.deptName = e.deptName
  }
}
async function onUpload(file: File) {
  dlg.uploading = true
  try {
    const res: any = await fileInfoApi.upload(file)
    const d = res?.data ?? res
    dlg.form.attachmentFileId = d?.id
    dlg.attachmentName = d?.originalName || d?.fileName || file.name
    ElMessage.success('附件上传成功')
  } catch {
    ElMessage.error('附件上传失败')
  } finally {
    dlg.uploading = false
  }
  return false // 阻止 el-upload 默认上传
}
function clearAttachment() {
  dlg.form.attachmentFileId = undefined
  dlg.attachmentName = ''
}

async function submit() {
  if (!contractTypeResolved.value) return ElMessage.warning('合同类型正在加载，请稍后保存')
  if (!dlg.form.employeeId) return ElMessage.warning('请选择员工')
  if (!dlg.form.contractType) return ElMessage.warning('请选择合同类型')
  // 编辑时允许旧合同保留停用类型；新增合同只能选择当前启用类型。
  if (!dlg.form.id && !isContractTypeSelectable(dlg.form.contractType)) {
    return ElMessage.warning('所选合同类型已停用，请重新选择')
  }
  dlg.saving = true
  try {
    await laborContractApi.save(dlg.form)
    ElMessage.success('保存成功')
    dlg.visible = false
    load()
  } catch {
    // 拦截器已提示
  } finally {
    dlg.saving = false
  }
}

async function remove(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除员工「${row.employeeName || ''}」的这份劳动合同?`, '删除确认', { type: 'warning' })
  } catch { return }
  try {
    await laborContractApi.remove(row.id)
    ElMessage.success('已删除')
    load()
  } catch { /* 拦截器已提示 */ }
}

async function remind() {
  try {
    await ElMessageBox.confirm('将给未来 30 天内到期的合同员工本人发送到期提醒,是否继续?', '发送到期提醒', { type: 'info' })
  } catch { return }
  try {
    const n: any = await laborContractApi.remindExpiring(30)
    ElMessage.success(`已发送 ${n ?? 0} 条到期提醒`)
  } catch { /* 拦截器已提示 */ }
}

onMounted(() => { load(); loadEmployees() })
</script>

<style scoped>
.labor-contract { padding: 4px 2px; }
.lc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.lc-title { margin: 0 0 4px; font-size: 18px; }
.lc-sub { margin: 0; color: #909399; font-size: 12px; }
.lc-head-actions { display: flex; gap: 8px; }
.lc-overview { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 12px; }
.ov-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all .15s; background: #fff; }
.ov-card:hover { border-color: #409eff; }
.ov-card.active { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,.15); }
.ov-num { font-size: 22px; font-weight: 700; }
.ov-lbl { color: #909399; font-size: 12px; margin-top: 2px; }
.lc-filter { margin-bottom: 12px; }
.lc-table-card :deep(.el-card__body) { padding: 12px; }
.lc-pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
