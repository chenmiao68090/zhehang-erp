<template>
  <div class="yum">
    <header class="yum-head">
      <div>
        <h2 class="yum-title">员工云客关联(点击拨打)</h2>
        <p class="yum-sub">给员工选好他的云客账号(工作手机)并"开通外呼"后,在电销外呼页点「拨打」,就会用该员工的云客工作手机拨打客户号码。</p>
      </div>
      <el-button @click="load" plain :loading="loading"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </header>

    <el-alert type="warning" :closable="false" show-icon class="yum-alert">
      <template #title>怎么用(重要)</template>
      系统登录手机 和 云客工作手机<b>通常不是同一个号</b>,所以要给每个员工<b>选他对应的云客成员(姓名·部门·手机)</b>——下拉里是云客组织架构里的真实成员,已按姓名帮你<b>智能预选</b>了一部分,核对一下。选好 → 勾选 → 点<b>「批量开通外呼」</b>。<b>前提</b>:该云客工作手机要登录<b>云客工作台 app 并联网在线</b>,否则拨号发不出去。
    </el-alert>

    <div class="yum-toolbar">
      <el-input v-model="keyword" class="yum-search" placeholder="搜姓名" clearable />
      <el-button type="primary" :disabled="!selected.length" :loading="enabling" @click="enableSelected">
        批量开通外呼{{ selected.length ? `(${selected.length})` : '' }}
      </el-button>
      <span class="yum-stat">已开通 {{ enabledCount }} / 共 {{ rows.length }} 人 · 云客成员 {{ accounts.length }} 个</span>
    </div>

    <el-table :data="filteredRows" v-loading="loading" border stripe @selection-change="onSel" row-key="id">
      <el-table-column type="selection" width="46" :selectable="(r) => !!r.yunkeAccountPhone" />
      <el-table-column label="员工" min-width="120">
        <template #default="{ row }">
          <span class="emp-name">{{ row.name || '—' }}</span>
          <div class="yum-sub2">系统手机 {{ row.phone || '—' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="关联云客成员" min-width="300">
        <template #default="{ row }">
          <el-select v-model="row.yunkeAccountPhone" filterable clearable placeholder="选该员工对应的云客成员" size="small" style="width:100%">
            <el-option
              v-for="a in accounts"
              :key="a.phone"
              :label="`${a.name || a.phone}(${a.phone})${a.dept ? ' · ' + a.dept : ''}`"
              :value="a.phone"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="外呼状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.enabled" type="success" size="small">已开通</el-tag>
          <el-tag v-else type="info" size="small" effect="plain">未开通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain :disabled="!row.yunkeAccountPhone" :loading="row._loading" @click="enableOne(row)">
            {{ row.enabled ? '重新开通' : '开通外呼' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-card v-if="lastResult" class="yum-result" shadow="never">
      <div>开通结果:成功 <b class="ok">{{ lastResult.success }}</b> 人,失败 <b class="bad">{{ lastResult.fail }}</b> 人</div>
      <ul v-if="lastResult.errors && lastResult.errors.length" class="yum-errs">
        <li v-for="(e, i) in lastResult.errors" :key="i">{{ e }}</li>
      </ul>
      <p v-if="lastResult.fail" class="yum-tip">失败多为"登录账户不存在"=选的云客账号不对,或该工作手机没登录过云客工作台。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { yunkeApi } from '@/api/yunke'

const loading = ref(false)
const enabling = ref(false)
const rows = ref<any[]>([])
const accounts = ref<any[]>([])
const selected = ref<any[]>([])
const keyword = ref('')
const lastResult = ref<any>(null)

const enabledCount = computed(() => rows.value.filter((r) => r.enabled).length)
const filteredRows = computed(() => {
  const k = keyword.value.trim()
  if (!k) return rows.value
  return rows.value.filter((r) => (r.name || '').includes(k))
})

const load = async () => {
  loading.value = true
  try {
    let users: any[] = []
    try {
      const uRes: any = await yunkeApi.staffCandidates()
      const d = uRes?.data ?? uRes
      users = Array.isArray(d) ? d : (d?.records || d?.list || [])
    } catch { ElMessage.error('员工列表加载失败,请重试') }
    try {
      const aRes: any = await yunkeApi.yunkeMembers()
      accounts.value = (aRes?.data ?? aRes) || []
    } catch { accounts.value = [] }
    let maps: any[] = []
    try {
      const mRes: any = await yunkeApi.userMap()
      maps = (mRes?.data ?? mRes) || []
    } catch { /* 没有映射也没关系 */ }
    const mapById: Record<string, any> = {}
    maps.forEach((m) => { mapById[String(m.userId)] = m })
    rows.value = users.map((u) => {
      const name = u.name || u.nickName || u.nickname || u.username
      const m = mapById[String(u.id)]
      // 已关联的用存的云客手机;否则按姓名在云客成员里智能预选
      let acc = m?.yunkePhone || ''
      if (!acc && name) {
        const matched = accounts.value.find((a) => a.name && (a.name === name || a.name.includes(name) || name.includes(a.name)))
        if (matched) acc = matched.phone
      }
      return { id: u.id, name, phone: u.phone || u.phonenumber || u.mobile || '', yunkeAccountPhone: acc, enabled: !!(m && m.yunkeUserId), _loading: false }
    })
  } finally { loading.value = false }
}

const onSel = (rowsSel: any[]) => { selected.value = rowsSel }

const doEnable = async (emps: any[]) => {
  const payload = emps.filter((e) => e.yunkeAccountPhone).map((e) => ({ userId: e.id, name: e.name, phone: e.yunkeAccountPhone }))
  if (!payload.length) { ElMessage.warning('请先给员工选云客账号(工作手机)'); return }
  const res: any = await yunkeApi.enableDial(payload)
  lastResult.value = res?.data ?? res
  const ok = lastResult.value?.success ?? 0
  if (ok > 0) ElMessage.success(`开通成功 ${ok} 人`)
  else ElMessage.warning('开通 0 人,看下方失败原因')
  load()
}

const enableSelected = async () => {
  enabling.value = true
  try { await doEnable(selected.value) } finally { enabling.value = false }
}
const enableOne = async (row: any) => {
  row._loading = true
  try { await doEnable([row]) } finally { row._loading = false }
}

onMounted(load)
</script>

<style scoped>
.yum { padding: 16px 18px; }
.yum-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.yum-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.yum-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.yum-alert { margin-bottom: 14px; }
.yum-alert :deep(.el-alert__description) { font-size: 12.5px; line-height: 1.7; }
.yum-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.yum-search { width: 200px; }
.yum-stat { font-size: 13px; color: var(--el-text-color-secondary); margin-left: auto; }
.emp-name { font-weight: 600; color: var(--el-text-color-primary); }
.yum-sub2 { font-size: 11.5px; color: var(--el-text-color-secondary); margin-top: 1px; }
.yum-result { margin-top: 14px; border-radius: 8px; }
.yum-result .ok { color: var(--el-color-success); }
.yum-result .bad { color: var(--el-color-danger); }
.yum-errs { margin: 8px 0 0; padding-left: 18px; font-size: 12px; color: var(--el-color-danger); }
.yum-tip { margin: 8px 0 0; font-size: 12px; color: var(--el-text-color-secondary); }
</style>
