<template>
  <div class="seal-new-sign">
    <header class="sns-head">
      <div>
        <h2 class="sns-title">新签客户数据</h2>
        <p class="sns-sub">来自「刻章业务提单」中新客户数据，按月份汇总新签收款。</p>
      </div>
      <div class="sns-actions">
        <el-date-picker v-model="monthFilter" type="month" value-format="YYYY-MM" placeholder="筛选月份" clearable class="sns-month" />
        <el-input v-model="keyword" placeholder="搜公司/对接人" clearable class="sns-search" @keyup.enter="reload" @clear="reload">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button :loading="loading" @click="loadData"><el-icon><Refresh /></el-icon> 刷新</el-button>
        <el-button type="primary" @click="exportCsv"><el-icon><Download /></el-icon> 导出表格</el-button>
      </div>
    </header>

    <section class="sns-stats">
      <div class="sns-stat">
        <span class="sns-stat-num">{{ filteredRows.length }}</span>
        <span class="sns-stat-label">新签个数</span>
      </div>
      <div class="sns-stat sns-stat--money">
        <span class="sns-stat-num">¥{{ fmtMoney(totalAmount) }}</span>
        <span class="sns-stat-label">收款总金额/新签当月</span>
      </div>
      <div class="sns-stat">
        <span class="sns-stat-num">{{ monthFilter || '全部' }}</span>
        <span class="sns-stat-label">当前月份</span>
      </div>
      <div class="sns-stat">
        <span class="sns-stat-num">{{ ownerCount }}</span>
        <span class="sns-stat-label">新签对接人数</span>
      </div>
    </section>

    <el-table :data="pagedRows" v-loading="loading" border stripe>
      <el-table-column label="日期" prop="regDate" width="120" />
      <el-table-column label="月份" width="110">
        <template #default="{ row }">{{ rowMonth(row) || '—' }}</template>
      </el-table-column>
      <el-table-column label="新签对接人" min-width="140">
        <template #default="{ row }">{{ row.ownerName || '—' }}</template>
      </el-table-column>
      <el-table-column label="公司名称" prop="companyName" min-width="230" show-overflow-tooltip />
      <el-table-column label="收款总金额/新签当月" width="180" align="right">
        <template #default="{ row }"><b class="sns-money">¥{{ fmtMoney(row.fee) }}</b></template>
      </el-table-column>
      <el-table-column label="收款方式" prop="payMethod" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }"><el-tag size="small" :type="statusType(row.status)" effect="plain">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="备注" min-width="220">
        <template #default="{ row }"><span class="sns-remark">{{ row.remark || '—' }}</span></template>
      </el-table-column>
      <template #empty>
        <el-empty description="当前筛选条件下暂无新签客户数据" :image-size="80" />
      </template>
    </el-table>

    <div class="sns-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="filteredRows.length" :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { sealOrderApi, type SealOrder } from '@/api/seal'

const todayMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const rows = ref<SealOrder[]>([])
const loading = ref(false)
const keyword = ref('')
const monthFilter = ref(todayMonth())
const pageNum = ref(1)
const pageSize = ref(10)

const rowMonth = (row: SealOrder) => {
  if (row.regDate && row.regDate.length >= 7) return row.regDate.slice(0, 7)
  if (row.billYear && row.billMonth) return `${row.billYear}-${String(row.billMonth).padStart(2, '0')}`
  return ''
}

const filteredRows = computed(() => {
  const kw = keyword.value.trim()
  return rows.value
    .filter((r) => r.bizType === 'new')
    .filter((r) => !monthFilter.value || rowMonth(r) === monthFilter.value)
    .filter((r) => !kw || `${r.companyName || ''}${r.ownerName || ''}`.includes(kw))
})

const pagedRows = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const totalAmount = computed(() => filteredRows.value.reduce((sum, row) => sum + Number(row.fee || 0), 0))
const ownerCount = computed(() => new Set(filteredRows.value.map((row) => row.ownerName).filter(Boolean)).size)

watch([keyword, monthFilter], () => { pageNum.value = 1 })

const unwrapPage = (res: any) => {
  const page = res?.data ?? res
  return {
    list: page?.records || page?.list || [],
    total: Number(page?.total || 0)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const pageSizeAll = 500
    const first = unwrapPage(await sealOrderApi.list({ pageNum: 1, pageSize: pageSizeAll }))
    const list: SealOrder[] = [...first.list]
    const total = first.total || list.length
    for (let page = 2; list.length < total && page <= 10; page++) {
      const next = unwrapPage(await sealOrderApi.list({ pageNum: page, pageSize: pageSizeAll }))
      list.push(...next.list)
      if (!next.list.length) break
    }
    rows.value = list
  } catch {
    rows.value = []
    ElMessage.error('新签客户数据加载失败')
  } finally {
    loading.value = false
  }
}

const reload = () => { pageNum.value = 1 }

const fmtMoney = (n?: number) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const statusMap: Record<string, string> = {
  lack: '缺资料',
  recorded: '已备案',
  pending: '待刻章',
  engraved: '已刻制',
  mailed: '已邮寄',
  taken: '已取走',
  done: '已完成'
}
const statusLabel = (v?: string) => statusMap[v || ''] || '待处理'
const statusType = (v?: string) => (v === 'done' ? 'success' : (v === 'lack' ? 'warning' : 'info'))

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
const exportCsv = () => {
  if (!filteredRows.value.length) {
    ElMessage.warning('当前没有可导出的新签数据')
    return
  }
  const header = ['日期', '月份', '新签对接人', '公司名称', '收款总金额/新签当月', '收款方式', '状态', '备注']
  const lines = filteredRows.value.map((row) => [
    row.regDate || '',
    rowMonth(row),
    row.ownerName || '',
    row.companyName || '',
    fmtMoney(row.fee),
    row.payMethod || '',
    statusLabel(row.status),
    row.remark || ''
  ].map(csvCell).join(','))
  const blob = new Blob(['\ufeff' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `新签客户数据-${monthFilter.value || '全部'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 300)
}

onMounted(loadData)
</script>

<style scoped>
.seal-new-sign { padding: 16px 18px; }
.sns-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.sns-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.sns-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.sns-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sns-month { width: 150px; }
.sns-search { width: 190px; }
.sns-stats { display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 12px; margin-bottom: 14px; }
.sns-stat { min-height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 12px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-fill-color-light); }
.sns-stat-num { font-size: 20px; font-weight: 700; color: var(--el-text-color-primary); }
.sns-stat-label { margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); }
.sns-stat--money .sns-stat-num,
.sns-money { color: var(--el-color-success); }
.sns-remark { display: block; white-space: pre-wrap; word-break: break-word; line-height: 1.55; }
.sns-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
@media (max-width: 900px) {
  .sns-stats { grid-template-columns: repeat(2, minmax(140px, 1fr)); }
}
@media (max-width: 560px) {
  .sns-stats { grid-template-columns: 1fr; }
  .sns-month,
  .sns-search { width: 100%; }
}
</style>
