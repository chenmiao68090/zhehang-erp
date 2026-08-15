<template>
  <div class="active-staff">
    <header class="as-head">
      <div>
        <h2 class="as-title">在职人员</h2>
        <p class="as-sub">在职 + 试用期员工花名册(数据来自员工管理,只读展示;如需修改请到「系统管理 · 员工管理」)。</p>
      </div>
      <div class="as-head-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <!-- 总览计数 -->
    <div class="as-overview">
      <div class="ov-card">
        <div class="ov-num">{{ counts.total }}</div>
        <div class="ov-lbl">在职总数</div>
      </div>
      <div class="ov-card">
        <div class="ov-num" style="color:#67c23a">{{ counts.formal }}</div>
        <div class="ov-lbl">正式在职</div>
      </div>
      <div class="ov-card">
        <div class="ov-num" style="color:#e6a23c">{{ counts.probation }}</div>
        <div class="ov-lbl">试用期</div>
      </div>
    </div>

    <!-- 筛选 -->
    <el-card shadow="never" class="as-filter">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="姓名">
          <el-input v-model="query.name" clearable placeholder="姓名" style="width: 160px" @keyup.enter="search" @clear="search" />
        </el-form-item>
        <el-form-item label="部门">
          <el-tree-select
            v-model="query.deptId"
            :data="deptTree"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            check-strictly
            clearable
            placeholder="全部部门"
            style="width: 200px"
            @change="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="在职+试用" style="width: 140px" @change="search">
            <el-option label="正式在职" :value="1" />
            <el-option label="试用期" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="as-table-card">
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column label="工号" prop="empCode" min-width="110" show-overflow-tooltip />
        <el-table-column label="姓名" prop="name" min-width="90" />
        <el-table-column label="部门" prop="deptName" min-width="130" show-overflow-tooltip />
        <el-table-column label="岗位" prop="postName" min-width="130" show-overflow-tooltip />
        <el-table-column label="入职日期" prop="hireDate" min-width="120" align="center">
          <template #default="{ row }">{{ row.hireDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="转正日期" prop="regularDate" min-width="120" align="center">
          <template #default="{ row }">{{ row.regularDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="手机" prop="phone" min-width="130" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 2 ? 'warning' : 'success'" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无在职人员" :image-size="80" />
        </template>
      </el-table>
      <div class="as-pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="query.pageNum"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="(p:number) => { query.pageNum = p; load() }"
          @size-change="(s:number) => { query.pageSize = s; query.pageNum = 1; load() }" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { employeeApi, deptApi } from '@/api/org'

// 在职人员 = status 1(正式在职)+ 2(试用期);默认两者都取
const ACTIVE_STATUSES = [1, 2]

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const counts = reactive({ total: 0, formal: 0, probation: 0 })
const deptTree = ref<any[]>([])

const query = reactive<{
  pageNum: number; pageSize: number; name?: string; deptId?: number; status?: number
}>({ pageNum: 1, pageSize: 20 })

function statusText(s?: number) {
  return s === 2 ? '试用期' : s === 1 ? '正式在职' : '-'
}

// /org/employee/list 只接受单个 status。选了具体状态就直接传;否则分别拉 1、2 再合并。
async function load() {
  loading.value = true
  try {
    const base: any = { pageNum: query.pageNum, pageSize: query.pageSize }
    if (query.name) base.name = query.name
    if (query.deptId) base.deptId = query.deptId

    if (query.status !== undefined) {
      const res: any = await employeeApi.list({ ...base, status: query.status })
      list.value = res?.records || []
      total.value = res?.total || 0
    } else {
      // 未指定状态:合并 status=1 与 status=2(各自分页,前端拼接;总数相加)
      const [r1, r2]: any[] = await Promise.all([
        employeeApi.list({ ...base, status: 1 }),
        employeeApi.list({ ...base, status: 2 })
      ])
      list.value = [...(r1?.records || []), ...(r2?.records || [])]
      total.value = (r1?.total || 0) + (r2?.total || 0)
    }
    await loadCounts()
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 统计:不带分页干扰,单独按状态取 total(pageSize=1 只要拿计数)
async function loadCounts() {
  try {
    const cbase: any = {}
    if (query.name) cbase.name = query.name
    if (query.deptId) cbase.deptId = query.deptId
    const [f, p]: any[] = await Promise.all([
      employeeApi.list({ ...cbase, status: 1, pageNum: 1, pageSize: 1 }),
      employeeApi.list({ ...cbase, status: 2, pageNum: 1, pageSize: 1 })
    ])
    counts.formal = f?.total || 0
    counts.probation = p?.total || 0
    counts.total = counts.formal + counts.probation
  } catch {
    counts.formal = 0
    counts.probation = 0
    counts.total = 0
  }
}

function search() {
  query.pageNum = 1
  load()
}
function reset() {
  query.name = undefined
  query.deptId = undefined
  query.status = undefined
  query.pageNum = 1
  load()
}

async function loadDeptTree() {
  try {
    deptTree.value = (await deptApi.tree()) as any[] || []
  } catch { deptTree.value = [] }
}

onMounted(() => { load(); loadDeptTree() })
// 供未来在筛选被清空时快速回默认;引用 ACTIVE_STATUSES 避免未使用告警
void ACTIVE_STATUSES
</script>

<style scoped>
.active-staff { padding: 4px 2px; }
.as-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.as-title { margin: 0 0 4px; font-size: 18px; }
.as-sub { margin: 0; color: #909399; font-size: 12px; }
.as-head-actions { display: flex; gap: 8px; }
.as-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.ov-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; text-align: center; background: #fff; }
.ov-num { font-size: 22px; font-weight: 700; }
.ov-lbl { color: #909399; font-size: 12px; margin-top: 2px; }
.as-filter { margin-bottom: 12px; }
.as-table-card :deep(.el-card__body) { padding: 12px; }
.as-pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
