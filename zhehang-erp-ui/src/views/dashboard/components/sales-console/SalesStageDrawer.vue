<template>
  <el-drawer v-model="visible" size="min(1040px, 96vw)" append-to-body destroy-on-close>
    <template #header>
      <div class="drawer-heading">
        <div>
          <h2>{{ stage?.label || '阶段客户' }}</h2>
          <p>点击客户可进入客户360查看完整跟进和交易记录</p>
        </div>
        <el-tag v-if="stage" effect="plain">当前 {{ stage.currentCount }} 个</el-tag>
      </div>
    </template>

    <div class="drawer-toolbar">
      <el-input
        v-model="keyword"
        clearable
        placeholder="搜索公司或负责人"
        :prefix-icon="Search"
        @keyup.enter="search"
        @clear="search"
      />
      <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" row-key="leadId" @row-click="openLead">
      <el-table-column label="公司" min-width="210" show-overflow-tooltip>
        <template #default="{ row }"><b class="company-name">{{ row.companyName || '未命名客户' }}</b></template>
      </el-table-column>
      <el-table-column label="负责人" width="108" show-overflow-tooltip prop="ownerName" />
      <el-table-column label="部门" width="116" show-overflow-tooltip prop="deptName" />
      <el-table-column label="停留" width="82">
        <template #default="{ row }">{{ row.stageAgeDays || 0 }} 天</template>
      </el-table-column>
      <el-table-column label="下一步" min-width="170">
        <template #default="{ row }">
          <span :class="{ overdue: row.overdue }">{{ row.nextActionType || '待安排' }}</span>
          <small class="next-time">{{ dateTime(row.nextActionTime) }}</small>
        </template>
      </el-table-column>
      <el-table-column label="预计金额" width="110" align="right">
        <template #default="{ row }">{{ money(row.expectedAmount) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="72" fixed="right">
        <template #default="{ row }"><el-button link type="primary" @click.stop="openLead(row)">查看</el-button></template>
      </el-table-column>
    </el-table>

    <div class="drawer-pagination">
      <span>共 {{ total }} 个</span>
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="20"
        layout="prev, pager, next"
        :total="total"
        @current-change="load"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSalesStageCustomers, type SalesConsoleQuery, type SalesStageCustomer, type SalesStageItem } from '@/api/sales-console'

const props = defineProps<{
  modelValue: boolean
  stage: SalesStageItem | null
  query: SalesConsoleQuery
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'lead-click', row: SalesStageCustomer): void
}>()

const visible = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const loading = ref(false)
const keyword = ref('')
const pageNum = ref(1)
const total = ref(0)
const rows = ref<SalesStageCustomer[]>([])

watch(() => [props.modelValue, props.stage?.code, props.query.startDate, props.query.endDate, props.query.ownerId, props.query.deptId],
  ([open]) => {
    if (open) {
      pageNum.value = 1
      load()
    }
  })

function search() {
  pageNum.value = 1
  load()
}

async function load() {
  if (!props.stage?.code || !props.modelValue) return
  loading.value = true
  try {
    const response: any = await getSalesStageCustomers(props.stage.code, {
      ...props.query,
      keyword: keyword.value.trim() || undefined,
      pageNum: pageNum.value,
      pageSize: 20
    })
    const data = response?.data ?? response ?? {}
    rows.value = data.records || data.list || []
    total.value = Number(data.total || 0)
  } catch (error: any) {
    rows.value = []
    total.value = 0
    ElMessage.error(error?.message || '阶段客户加载失败')
  } finally {
    loading.value = false
  }
}

function openLead(row: SalesStageCustomer) {
  emit('lead-click', row)
}

function dateTime(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '尚未设置'
}

function money(value?: number) {
  const amount = Number(value || 0)
  return amount === 0 ? '-' : `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}
</script>

<style scoped lang="scss">
.drawer-heading { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.drawer-heading h2 { margin: 0; color: #1b2638; font-size: 20px; }
.drawer-heading p { margin: 5px 0 0; color: #7b8799; font-size: 13px; }
.drawer-toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.drawer-toolbar .el-input { width: min(360px, 70vw); }
.company-name { color: #243147; }
.overdue { color: #c2413a; }
.next-time { display: block; margin-top: 3px; color: #7b8799; font-size: 12px; }
.drawer-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; color: #6d7a8f; font-size: 13px; }

@media (max-width: 680px) {
  .drawer-heading p { display: none; }
  .drawer-toolbar { align-items: stretch; }
}
</style>
