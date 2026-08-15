<template>
  <div class="contract-expiring">
    <header class="ce-header">
      <div class="ce-header-main">
        <h1 class="ce-title">合同到期提醒</h1>
        <p class="ce-desc">列出劳动合同即将到期的在职员工,请 HR 及时跟进续签</p>
      </div>
      <div class="ce-header-filter">
        <span class="ce-filter-label">到期范围</span>
        <el-select v-model="days" style="width: 140px" @change="loadData">
          <el-option :value="15" label="15 天内" />
          <el-option :value="30" label="30 天内" />
          <el-option :value="60" label="60 天内" />
          <el-option :value="90" label="90 天内" />
        </el-select>
      </div>
    </header>

    <el-card shadow="never" class="ce-card">
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column label="姓名" prop="name" min-width="110" />
        <el-table-column label="部门" min-width="140">
          <template #default="{ row }">{{ row.deptName ?? row.deptId ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="岗位" min-width="140">
          <template #default="{ row }">{{ row.postName ?? row.postId ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="合同开始" prop="contractStart" width="130" align="center" />
        <el-table-column label="合同结束" prop="contractEnd" width="130" align="center" />
        <el-table-column label="剩余天数" width="120" align="center">
          <template #default="{ row }">
            <span :style="remainStyle(row.contractEnd)">{{ remainDays(row.contractEnd) }} 天</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="`未来 ${days} 天内没有合同到期的在职员工`" :image-size="80" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { employeeApi } from '@/api/org'

const days = ref(30)
const loading = ref(false)
const list = ref<any[]>([])

// 计算合同结束日期距今天还有多少天
function remainDays(contractEnd?: string): number {
  if (!contractEnd) return 0
  const end = new Date(contractEnd)
  const today = new Date()
  // 归零时分秒,只按自然日算差值
  end.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86400000)
}

// 剩余 <=7 天标红,<=15 天标橙
function remainStyle(contractEnd?: string) {
  const d = remainDays(contractEnd)
  if (d <= 7) return { color: '#f56c6c', fontWeight: 600 }
  if (d <= 15) return { color: '#e6a23c', fontWeight: 600 }
  return {}
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await employeeApi.contractExpiring(days.value)
    // 兼容拦截器已拆信封 / 未拆信封两种返回形态
    list.value = res?.data ?? res ?? []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.contract-expiring {
  padding: 16px;
}
.ce-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.ce-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.ce-desc {
  margin: 6px 0 0;
  color: #909399;
  font-size: 13px;
}
.ce-header-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ce-filter-label {
  font-size: 13px;
  color: #606266;
}
.ce-card {
  border-radius: 8px;
}
</style>
