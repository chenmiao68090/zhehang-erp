<template>
  <div class="page-container tax-calendar-page">
    <header class="tc-head">
      <div>
        <h2>报税日历 · 申报待办</h2>
        <p>根据每个客户税务档案里的「申报周期」，自动算出本月该报哪些税、几号截止，防漏报防罚款。</p>
      </div>
      <div class="head-actions">
        <el-date-picker v-model="month" type="month" value-format="YYYY-MM" placeholder="选择月份" @change="load" />
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <div class="kpi-card">
        <span>本月应申报</span><strong>{{ list.length }}</strong><small>户客户</small>
      </div>
      <div class="kpi-card">
        <span>月报客户</span><strong>{{ countCycle('月') }}</strong><small>每月申报</small>
      </div>
      <div class="kpi-card">
        <span>季报客户</span><strong>{{ countCycle('季') }}</strong><small>季度申报</small>
      </div>
      <div class="kpi-card">
        <span>临期(7天内)</span><strong :class="{ urgent: urgentCount > 0 }">{{ urgentCount }}</strong><small>需优先处理</small>
      </div>
    </section>

    <el-table :data="list" v-loading="loading" border stripe class="tc-table">
      <el-table-column label="客户" min-width="220">
        <template #default="{ row }">
          <div class="name-cell">
            <strong>{{ row.companyName }}</strong>
            <span>{{ row.creditCode }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="纳税人" width="110">
        <template #default="{ row }">
          {{ row.taxpayerType === 1 ? '一般纳税人' : row.taxpayerType === 2 ? '小规模' : '—' }}
        </template>
      </el-table-column>
      <el-table-column label="涉及税种" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="t in parseTaxTypes(row.taxTypes)" :key="t" size="small" class="tax-tag" effect="plain">{{ t }}</el-tag>
          <span v-if="!parseTaxTypes(row.taxTypes).length" class="muted">未配置</span>
        </template>
      </el-table-column>
      <el-table-column label="申报周期" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.filingCycle && row.filingCycle.includes('月') ? 'success' : 'warning'">
            {{ row.filingCycle || '—' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="taxAuthority" label="主管税务局" min-width="200" show-overflow-tooltip />
      <el-table-column prop="taxOfficer" label="办税人" width="100" />
      <el-table-column label="截止日" width="120">
        <template #default="{ row }"><span :class="{ 'deadline-urgent': isUrgent(row.deadline) }">{{ row.deadline }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }"><el-tag size="small" type="info">{{ row.status }}</el-tag></template>
      </el-table-column>
    </el-table>
    <div v-if="!list.length && !loading" class="tc-empty">
      本月暂无申报待办——可能客户的税务档案还没配置「申报周期」，去「企业主体库 → 详情 → 税务档案」补上即可。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { taxCalendarApi, type TaxCalendarItem } from '@/api/tax'

const loading = ref(false)
const month = ref('')
const list = ref<TaxCalendarItem[]>([])

function parseTaxTypes(s?: string): string[] {
  if (!s) return []
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

function countCycle(k: string) {
  return list.value.filter((r) => r.filingCycle && r.filingCycle.includes(k)).length
}

function isUrgent(deadline?: string) {
  if (!deadline) return false
  const diff = (new Date(deadline).getTime() - Date.now()) / 86400000
  return diff >= 0 && diff <= 7
}

const urgentCount = computed(() => list.value.filter((r) => isUrgent(r.deadline)).length)

async function load() {
  loading.value = true
  try {
    list.value = (await taxCalendarApi.list(month.value || undefined)) || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.tax-calendar-page { padding: 16px; }
.tc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.tc-head h2 { margin: 0 0 4px; font-size: 20px; color: #303133; }
.tc-head p { margin: 0; color: #909399; font-size: 13px; max-width: 620px; }
.head-actions { display: flex; gap: 8px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.kpi-card { background: #fff; border: 1px solid #ebeef5; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.kpi-card span { font-size: 12px; color: #909399; }
.kpi-card strong { font-size: 24px; color: #303133; }
.kpi-card strong.urgent { color: #f56c6c; }
.kpi-card small { font-size: 12px; color: #c0c4cc; }
.tc-table { margin-top: 4px; }
.name-cell { display: flex; flex-direction: column; }
.name-cell strong { color: #303133; }
.name-cell span { font-size: 12px; color: #909399; }
.tax-tag { margin: 2px 4px 2px 0; }
.muted { color: #c0c4cc; font-size: 12px; }
.deadline-urgent { color: #f56c6c; font-weight: 600; }
.tc-empty { text-align: center; color: #909399; padding: 30px; }
</style>
