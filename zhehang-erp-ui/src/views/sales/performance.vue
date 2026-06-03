<template>
  <div class="sales-perf">
    <PerfTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      show-summary
      summary-text="合计"
      empty-text="暂无业绩数据"
    >
      <template #tabs>
        <el-tabs v-model="activeTab" class="perf-tabs" @tab-change="loadData">
          <el-tab-pane label="合同签订(人员)" name="signer" />
        </el-tabs>
      </template>

      <template #toolbar>
        <el-select v-model="query.year" placeholder="签约年份" clearable style="width: 120px" @change="loadData">
          <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
        </el-select>
        <el-select v-model="query.status" placeholder="合同状态" clearable style="width: 130px" @change="loadData">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" plain :loading="loading" @click="loadData">查询</el-button>
      </template>

      <template #footer>
        <span>合计签订人数:{{ rows.length }}</span>
        <span>合计合同数量:{{ totalCount }}</span>
        <span>合计合同金额:{{ totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
      </template>
    </PerfTable>

    <p class="perf-note">
      数据来源:真实合同(crm_contract)按签订人聚合,自动租户隔离。
      「新签 / 续签(有增值/无增值)」拆分与「核定成本 / 退费 / 业绩计提」需扩展合同表字段后补全(见改造路线 P4)。
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PerfTable, { type PerfColumn } from '@/components/common/PerfTable.vue'
import { contractApi } from '@/api/crm'

interface PerfRow {
  ownerId: number
  ownerName: string
  contractCount: number
  contractAmount: number
}

const activeTab = ref('signer')
const loading = ref(false)
const rows = ref<PerfRow[]>([])

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear, currentYear - 1, currentYear - 2]
const statusOptions = [
  { label: '已签署', value: 3 },
  { label: '执行中', value: 4 },
  { label: '已完成', value: 5 }
]

const query = reactive<{ year?: number; status?: number }>({ year: currentYear })

const columns: PerfColumn[] = [
  { prop: 'ownerName', label: '签订人', minWidth: 140, align: 'left', fixed: 'left' },
  {
    label: '合同',
    children: [
      { prop: 'contractCount', label: '合同数量', format: 'int', minWidth: 110 },
      { prop: 'contractAmount', label: '合同金额', format: 'money', minWidth: 140 }
    ]
  }
]

const totalCount = computed(() => rows.value.reduce((s, r) => s + Number(r.contractCount || 0), 0))
const totalAmount = computed(() => rows.value.reduce((s, r) => s + Number(r.contractAmount || 0), 0))

async function loadData() {
  loading.value = true
  try {
    const resp: any = await contractApi.performance({ year: query.year, status: query.status })
    const list = resp?.data ?? resp
    rows.value = Array.isArray(list)
      ? list.map((r: any) => ({
          ownerId: Number(r.ownerId),
          ownerName: r.ownerName || `用户${r.ownerId}`,
          contractCount: Number(r.contractCount || 0),
          contractAmount: Number(r.contractAmount || 0)
        }))
      : []
  } catch (e: any) {
    rows.value = []
    ElMessage.error(e?.message || '业绩数据加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
.sales-perf {
  padding: 8px 4px 24px;
}
.perf-tabs {
  margin-bottom: -14px;
}
.perf-note {
  margin-top: 14px;
  color: #909399;
  font-size: 12px;
  line-height: 1.7;
}
</style>
