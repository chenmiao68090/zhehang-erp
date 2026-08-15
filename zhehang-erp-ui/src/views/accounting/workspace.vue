<template>
  <div class="acc-workspace">
    <!-- 顶部标题 -->
    <header class="acc-head">
      <div>
        <h2 class="acc-title">会计体系 · 代理记账工作台</h2>
        <p class="acc-sub">代理记账业务线：给客户做账/报税的进度台账与记账工具入口（区别于公司自己的财务中心）。</p>
      </div>
    </header>

    <!-- 概览统计卡（基于代账台账真实数据） -->
    <div class="acc-stats">
      <div class="acc-stat acc-stat--total">
        <span class="acc-stat-num">{{ counts.total || 0 }}</span>
        <span class="acc-stat-label">代账客户数</span>
      </div>
      <div class="acc-stat acc-stat--todo">
        <span class="acc-stat-num">{{ counts.bkTodo || 0 }}</span>
        <span class="acc-stat-label">待记账</span>
      </div>
      <div class="acc-stat acc-stat--doing">
        <span class="acc-stat-num">{{ counts.bkDoing || 0 }}</span>
        <span class="acc-stat-label">记账中</span>
      </div>
      <div class="acc-stat acc-stat--done">
        <span class="acc-stat-num">{{ counts.bkDone || 0 }}</span>
        <span class="acc-stat-label">已完成</span>
      </div>
      <div class="acc-stat acc-stat--tax">
        <span class="acc-stat-num">{{ counts.taxTodo || 0 }}</span>
        <span class="acc-stat-label">待申报</span>
      </div>
    </div>

    <!-- 快捷入口：链到公司已有的记账工具（真实路由） -->
    <!-- 代账客户台账 -->
    <section class="acc-section">
      <div class="acc-section-head">
        <h3 class="acc-section-title">代账客户台账</h3>
        <div class="acc-toolbar">
          <el-input
            v-model="keyword"
            class="acc-search"
            placeholder="搜客户名/会计…"
            clearable
            @keyup.enter="reload"
            @clear="reload"
          />
          <el-date-picker
            v-model="periodFilter"
            type="month"
            value-format="YYYY-MM"
            placeholder="账期(月)"
            class="acc-period"
            clearable
            @change="reload"
          />
          <el-select v-model="bkStatusFilter" placeholder="记账状态" clearable class="acc-filter" @change="reload">
            <el-option v-for="s in BK_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
          <el-select v-model="taxStatusFilter" placeholder="报税状态" clearable class="acc-filter" @change="reload">
            <el-option v-for="s in TAX_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
          <el-button type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 新增</el-button>
        </div>
      </div>

      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column label="客户名" prop="clientName" min-width="180" show-overflow-tooltip />
        <el-table-column label="账期" prop="period" width="100" align="center" />
        <el-table-column label="记账状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="bkType(row.bookkeepingStatus)">{{ bkLabel(row.bookkeepingStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报税状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="taxType(row.taxFilingStatus)">{{ taxLabel(row.taxFilingStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责会计" prop="accountantName" width="110">
          <template #default="{ row }">{{ row.accountantName || '—' }}</template>
        </el-table-column>
        <el-table-column label="本期费用" width="110" align="right">
          <template #default="{ row }">{{ row.amount != null ? '¥' + fmtMoney(row.amount) : '—' }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openForm(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无代账客户，点右上角「新增」建立台账" />
        </template>
      </el-table>

      <div class="acc-pager" v-if="total > 0">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :current-page="pageNum"
          :page-size="pageSize"
          @current-change="onPage"
        />
      </div>
    </section>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑代账台账' : '新增代账台账'" width="520px">
      <el-form :model="form" label-width="88px" :rules="rules" ref="formRef">
        <el-form-item label="客户名" prop="clientName">
          <el-input v-model="form.clientName" placeholder="代账客户公司名" />
        </el-form-item>
        <el-form-item label="账期" prop="period">
          <el-date-picker v-model="form.period" type="month" value-format="YYYY-MM" placeholder="选择账期月份" style="width: 100%" />
        </el-form-item>
        <el-form-item label="记账状态">
          <el-select v-model="form.bookkeepingStatus" style="width: 100%">
            <el-option v-for="s in BK_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="报税状态">
          <el-select v-model="form.taxFilingStatus" style="width: 100%">
            <el-option v-for="s in TAX_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责会计">
          <el-select v-model="form.accountantId" placeholder="选择会计" clearable filterable style="width: 100%" @change="onAccountantChange">
            <el-option v-for="c in colleagues" :key="c.userId" :label="c.deptName ? c.name + '（' + c.deptName + '）' : c.name" :value="c.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期费用">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :controls="false" placeholder="可空" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { bookkeepingLedgerApi } from '@/api/finance'

// 状态枚举
const BK_OPTIONS = [
  { label: '待记账', value: 0 },
  { label: '记账中', value: 1 },
  { label: '已完成', value: 2 }
]
const TAX_OPTIONS = [
  { label: '待申报', value: 0 },
  { label: '已申报', value: 1 },
  { label: '无需申报', value: 2 }
]

function bkLabel(v: number) {
  return BK_OPTIONS.find((o) => o.value === v)?.label ?? '—'
}
function bkType(v: number) {
  return v === 2 ? 'success' : v === 1 ? 'warning' : 'info'
}
function taxLabel(v: number) {
  return TAX_OPTIONS.find((o) => o.value === v)?.label ?? '—'
}
function taxType(v: number) {
  return v === 1 ? 'success' : v === 2 ? '' : 'info'
}
function fmtMoney(val: any) {
  return Number(val ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 列表 + 筛选
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const periodFilter = ref('')
const bkStatusFilter = ref<number | ''>('')
const taxStatusFilter = ref<number | ''>('')
const counts = reactive<Record<string, number>>({})

async function loadList() {
  loading.value = true
  try {
    const res: any = await bookkeepingLedgerApi.list({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      period: periodFilter.value || undefined,
      bookkeepingStatus: bkStatusFilter.value === '' ? undefined : bkStatusFilter.value,
      taxFilingStatus: taxStatusFilter.value === '' ? undefined : taxStatusFilter.value
    })
    const data = res?.data ?? res
    rows.value = data?.records || []
    total.value = data?.total || 0
  } catch (e) {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const res: any = await bookkeepingLedgerApi.statusCount({
      keyword: keyword.value || undefined,
      period: periodFilter.value || undefined
    })
    const data = res?.data ?? res ?? {}
    Object.keys(data).forEach((k) => {
      counts[k] = Number(data[k] ?? 0)
    })
  } catch (e) {
    /* 忽略统计失败 */
  }
}

function reload() {
  pageNum.value = 1
  loadList()
  loadCounts()
}
function onPage(p: number) {
  pageNum.value = p
  loadList()
}

// 选人
const colleagues = ref<any[]>([])
async function loadColleagues() {
  try {
    const res: any = await bookkeepingLedgerApi.colleagues()
    colleagues.value = res?.data ?? res ?? []
  } catch (e) {
    colleagues.value = []
  }
}

// 弹窗
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<any>({
  id: null,
  clientName: '',
  clientId: null,
  period: '',
  bookkeepingStatus: 0,
  taxFilingStatus: 0,
  accountantId: null,
  accountantName: '',
  amount: undefined,
  remark: ''
})
const rules = {
  clientName: [{ required: true, message: '请输入客户名', trigger: 'blur' }],
  period: [{ required: true, message: '请选择账期', trigger: 'change' }]
}

function resetForm() {
  form.id = null
  form.clientName = ''
  form.clientId = null
  form.period = ''
  form.bookkeepingStatus = 0
  form.taxFilingStatus = 0
  form.accountantId = null
  form.accountantName = ''
  form.amount = undefined
  form.remark = ''
}

function openForm(row?: any) {
  resetForm()
  if (row) {
    Object.assign(form, {
      id: row.id,
      clientName: row.clientName,
      clientId: row.clientId ?? null,
      period: row.period,
      bookkeepingStatus: row.bookkeepingStatus ?? 0,
      taxFilingStatus: row.taxFilingStatus ?? 0,
      accountantId: row.accountantId ?? null,
      accountantName: row.accountantName ?? '',
      amount: row.amount ?? undefined,
      remark: row.remark ?? ''
    })
  }
  dialogVisible.value = true
}

function onAccountantChange(userId: number | null) {
  const c = colleagues.value.find((it) => it.userId === userId)
  form.accountantName = c ? c.name : ''
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { ...form }
      if (payload.amount === undefined || payload.amount === null || payload.amount === '') {
        payload.amount = null
      }
      if (form.id) {
        await bookkeepingLedgerApi.update(payload)
      } else {
        delete payload.id
        await bookkeepingLedgerApi.add(payload)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadList()
      loadCounts()
    } catch (e) {
      /* 拦截器已提示 */
    } finally {
      saving.value = false
    }
  })
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除「${row.clientName}」${row.period} 的台账记录？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await bookkeepingLedgerApi.remove(row.id)
      ElMessage.success('已删除')
      loadList()
      loadCounts()
    })
    .catch(() => {})
}

onMounted(() => {
  loadList()
  loadCounts()
  loadColleagues()
})
</script>

<style lang="scss" scoped>
.acc-workspace {
  padding: 16px;
}
.acc-head {
  margin-bottom: 16px;
  .acc-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .acc-sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
.acc-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.acc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  .acc-stat-num {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
  }
  .acc-stat-label {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
.acc-stat--total .acc-stat-num {
  color: var(--el-color-primary);
}
.acc-stat--todo .acc-stat-num {
  color: var(--el-color-info);
}
.acc-stat--doing .acc-stat-num {
  color: var(--el-color-warning);
}
.acc-stat--done .acc-stat-num {
  color: var(--el-color-success);
}
.acc-stat--tax .acc-stat-num {
  color: var(--el-color-danger);
}

.acc-section {
  margin-bottom: 24px;
}
.acc-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  .acc-section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .acc-section-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
.acc-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  .acc-search {
    width: 160px;
  }
  .acc-period {
    width: 130px;
  }
  .acc-filter {
    width: 120px;
  }
}

.acc-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.acc-shortcut {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
  .acc-shortcut-icon {
    font-size: 22px;
    color: var(--el-color-primary);
  }
  .acc-shortcut-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .acc-shortcut-name {
    font-size: 14px;
    font-weight: 600;
  }
  .acc-shortcut-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .acc-shortcut-arrow {
    color: var(--el-text-color-placeholder);
  }
}

.acc-pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
