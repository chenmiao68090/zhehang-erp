<template>
  <div class="self-service">
    <header class="ss-head">
      <div>
        <h2 class="ss-title">员工自助服务</h2>
        <p class="ss-sub">一站式查看个人档案、人事异动记录，并快速进入我的薪资、绩效、合同等自助功能。</p>
      </div>
      <el-button :icon="Refresh" @click="loadAll" :loading="loading">刷新</el-button>
    </header>

    <div class="ss-grid">
      <!-- 个人档案卡 -->
      <section class="ss-card profile-card">
        <div class="card-title"><el-icon><User /></el-icon><span>个人档案</span></div>
        <div class="profile-body">
          <div class="avatar">{{ avatarText }}</div>
          <div class="profile-info">
            <div class="pi-name">{{ profile.name || '-' }}</div>
            <div class="pi-tags">
              <el-tag size="small" effect="plain">{{ profile.deptName || '部门未登记' }}</el-tag>
              <el-tag size="small" effect="plain" type="success">{{ profile.postName || '岗位未登记' }}</el-tag>
            </div>
          </div>
        </div>
        <el-descriptions :column="1" border size="small" class="profile-desc">
          <el-descriptions-item label="工号">{{ profile.empCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ profile.deptName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ profile.postName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ profile.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ profile.hireDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="在职天数">
            <span v-if="workedDays !== null">已入职 {{ workedDays }} 天</span>
            <span v-else>—</span>
          </el-descriptions-item>
        </el-descriptions>
        <p class="card-hint">档案数据来自登录信息及本人已发放工资条/合同，仅供本人查看。如有错漏请联系 HR 更正。</p>
      </section>

      <!-- 人事异动时间线 -->
      <section class="ss-card timeline-card">
        <div class="card-title"><el-icon><Switch /></el-icon><span>人事异动时间线</span></div>
        <div v-loading="loading" class="timeline-body">
          <el-timeline v-if="transfers.length">
            <el-timeline-item
              v-for="t in transfers"
              :key="t.id"
              :timestamp="fmtDate(t.effectiveDate) || fmtDate(t.createTime)"
              placement="top"
              :type="TRANSFER_DOT[t.transferType] || 'primary'"
              :hollow="t.status === 0"
            >
              <div class="tl-item">
                <div class="tl-head">
                  <b>{{ TRANSFER_TYPE[t.transferType] || '异动' }}</b>
                  <el-tag size="small" :type="STATUS_TAG[t.status] || 'info'" effect="light">
                    {{ STATUS_LABEL[t.status] || '—' }}
                  </el-tag>
                </div>
                <div v-if="t.fromDeptName || t.toDeptName" class="tl-line">
                  部门：{{ t.fromDeptName || '—' }} → {{ t.toDeptName || '—' }}
                </div>
                <div v-if="t.fromPostName || t.toPostName" class="tl-line">
                  岗位：{{ t.fromPostName || '—' }} → {{ t.toPostName || '—' }}
                </div>
                <div v-if="t.reason" class="tl-line tl-reason">原因：{{ t.reason }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无人事异动记录" :image-size="70" />
        </div>
        <p class="card-hint">异动记录来自「人事异动」，仅显示本人（入职/转正/调岗/晋升/离职）。奖惩记录待接入。</p>
      </section>

      <!-- 快捷入口卡 -->
      <section class="ss-card entries-card">
        <div class="card-title"><el-icon><Grid /></el-icon><span>快捷入口</span></div>
        <div class="entries-grid">
          <div
            v-for="e in entries"
            :key="e.title"
            class="entry"
            :class="{ 'entry-disabled': e.disabled }"
            @click="onEntry(e)"
          >
            <el-icon class="entry-icon" :style="{ background: e.color }"><component :is="e.icon" /></el-icon>
            <div class="entry-text">
              <div class="entry-title">{{ e.title }}</div>
              <div class="entry-desc">{{ e.desc }}</div>
            </div>
            <el-tag v-if="e.disabled" size="small" type="info" effect="plain">敬请期待</el-tag>
          </div>
        </div>
      </section>

      <!-- 我的合同(内嵌简版,数据走 laborContractApi.my) -->
      <section class="ss-card contract-card">
        <div class="card-title"><el-icon><Document /></el-icon><span>我的合同</span></div>
        <div v-loading="loading">
          <el-table v-if="contracts.length" :data="contracts" border stripe size="small">
            <el-table-column label="合同编号" prop="contractNo" min-width="130" />
            <el-table-column label="类型" prop="contractType" width="100" align="center" />
            <el-table-column label="开始日期" width="110" align="center"><template #default="{ row }">{{ fmtDate(row.startDate) }}</template></el-table-column>
            <el-table-column label="结束日期" width="110" align="center"><template #default="{ row }">{{ fmtDate(row.endDate) }}</template></el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="CONTRACT_TAG[row.status] || 'info'" effect="light">{{ CONTRACT_LABEL[row.status] || '—' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无本人劳动合同记录" :image-size="60" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, User, Switch, Grid, Document, Wallet, Aim, Calendar, Present } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { employeeApi, transferApi } from '@/api/org'
import { laborContractApi, payslipApi, type LaborContract } from '@/api/hrm'

const router = useRouter()
const userStore = useUserStore()

// —— 异动类型 / 状态 映射(与后端 org_transfer 枚举对齐:1入职 2转正 3调岗 4晋升 5离职;status 0待审批 1已通过 2已拒绝)——
const TRANSFER_TYPE: Record<number, string> = { 1: '入职', 2: '转正', 3: '调岗', 4: '晋升', 5: '离职' }
const TRANSFER_DOT: Record<number, string> = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' }
const STATUS_LABEL: Record<number, string> = { 0: '待审批', 1: '已生效', 2: '已拒绝' }
const STATUS_TAG: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }
const CONTRACT_LABEL: Record<number, string> = { 0: '未生效', 1: '生效中', 2: '即将到期', 3: '已到期', 4: '已解除' }
const CONTRACT_TAG: Record<number, string> = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger', 4: 'info' }

const loading = ref(false)

// —— 个人档案:基础信息取登录用户 store(/auth/info,全员可读),部门/岗位/工号 best-effort 从本人工资条或合同补全 ——
const profile = reactive<{ name: string; empCode: string; deptName: string; postName: string; phone: string; hireDate: string }>({
  name: '', empCode: '', deptName: '', postName: '', phone: '', hireDate: ''
})

const avatarText = computed(() => (profile.name || 'U').slice(0, 1).toUpperCase())
const workedDays = computed<number | null>(() => {
  if (!profile.hireDate) return null
  const d = new Date(profile.hireDate)
  if (isNaN(d.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
})

const transfers = ref<any[]>([])
const contracts = ref<LaborContract[]>([])

function fmtDate(v: any): string {
  if (!v) return ''
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

// 快捷入口
const entries = [
  { title: '我的薪资', desc: '查看工资条并签字确认', icon: Wallet, color: '#409eff', path: '/culture/my-payslip', disabled: false },
  { title: '我的假勤', desc: '请假 / 考勤申请与记录', icon: Calendar, color: '#e6a23c', path: '/hrm/attendance', disabled: false },
  { title: '我的关怀', desc: '生日 / 入职周年提醒', icon: Present, color: '#f56c6c', path: '', disabled: true }
]
function onEntry(e: any) {
  if (e.disabled) { ElMessage.info('该功能敬请期待'); return }
  router.push(e.path)
}

function fillProfileFromRow(row: any) {
  if (!row) return
  if (!profile.name && (row.employeeName || row.name)) profile.name = row.employeeName || row.name
  if (!profile.deptName && row.deptName) profile.deptName = row.deptName
  if (!profile.postName && row.postName) profile.postName = row.postName
  if (!profile.empCode && (row.empCode || row.employeeCode)) profile.empCode = row.empCode || row.employeeCode
  if (!profile.phone && row.phone) profile.phone = row.phone
  if (!profile.hireDate && row.hireDate) profile.hireDate = fmtDate(row.hireDate)
}

async function loadAll() {
  loading.value = true
  // 基础信息:登录用户
  const u: any = userStore.userInfo || {}
  profile.name = u.nickname || u.username || ''
  profile.phone = u.phone || ''
  profile.hireDate = fmtDate(u.hireDate)

  // 先读系统员工档案本人接口,确保部门/岗位/工号与「员工与账号」同步。
  try {
    const me: any = await employeeApi.me()
    fillProfileFromRow(me?.data || me)
  } catch {
    // 旧账号未关联员工档案时继续走下方工资条/合同兜底
  }

  // 人事异动(本人):transferApi.list 不传 employeeId,后端按数据权限自动收敛为本人
  try {
    const res: any = await transferApi.list({ pageNum: 1, pageSize: 100 })
    const records = res?.records || res?.list || (Array.isArray(res) ? res : [])
    // 按生效日期倒序(新→旧)
    transfers.value = [...records].sort((a: any, b: any) => {
      const da = new Date(a.effectiveDate || a.createTime || 0).getTime()
      const db = new Date(b.effectiveDate || b.createTime || 0).getTime()
      return db - da
    })
    // 用最近一条异动补全部门/岗位/工号(best-effort)
    const latest = records.find((r: any) => r.toDeptName || r.toPostName || r.empCode)
    if (latest) {
      if (!profile.deptName && latest.toDeptName) profile.deptName = latest.toDeptName
      if (!profile.postName && latest.toPostName) profile.postName = latest.toPostName
      if (!profile.empCode && latest.empCode) profile.empCode = latest.empCode
      if (!profile.name && latest.employeeName) profile.name = latest.employeeName
    }
  } catch (e) {
    transfers.value = []
  }

  // 我的合同(本人)
  try {
    const list: any = await laborContractApi.my()
    contracts.value = (Array.isArray(list) ? list : (list?.records || [])) as LaborContract[]
    fillProfileFromRow(contracts.value[0])
  } catch (e) {
    contracts.value = []
  }

  // 部门/岗位/工号仍缺 → 从本人工资条补全(全员可读、自动收敛本人)
  if (!profile.deptName || !profile.postName || !profile.empCode) {
    try {
      const ps: any = await payslipApi.my()
      const rows = Array.isArray(ps) ? ps : (ps?.records || [])
      if (rows.length) fillProfileFromRow(rows[0])
    } catch (e) { /* 忽略:无工资条也不影响档案主体 */ }
  }

  loading.value = false
}

onMounted(async () => {
  // 确保有登录用户信息(未加载时兜底拉一次)
  if (!userStore.userInfo || !userStore.userInfo.username) {
    try { await userStore.getUserInfo() } catch (e) { /* ignore */ }
  }
  loadAll()
})
</script>

<style scoped>
.self-service { padding: 4px 2px; }
.ss-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.ss-title { margin: 0 0 4px; font-size: 18px; }
.ss-sub { margin: 0; color: #909399; font-size: 12px; }

.ss-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.ss-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}
.card-title { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #303133; }
.card-hint { margin: 12px 0 0; color: #c0c4cc; font-size: 11px; line-height: 1.5; }

/* 个人档案 */
.profile-body { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #409eff, #79bbff); color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
.profile-info { min-width: 0; }
.pi-name { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.pi-tags { display: flex; gap: 6px; flex-wrap: wrap; }

/* 时间线 */
.timeline-body { min-height: 60px; }
.tl-item { padding-bottom: 2px; }
.tl-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.tl-line { color: #606266; font-size: 12px; line-height: 1.7; }
.tl-reason { color: #909399; }

/* 快捷入口 */
.entries-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.entry { display: flex; align-items: center; gap: 10px; border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; cursor: pointer; transition: all .18s; }
.entry:hover { border-color: #409eff; box-shadow: 0 2px 10px rgba(64,158,255,.12); transform: translateY(-1px); }
.entry-disabled { cursor: not-allowed; opacity: .7; }
.entry-disabled:hover { border-color: #ebeef5; box-shadow: none; transform: none; }
.entry-icon { width: 36px; height: 36px; border-radius: 8px; color: #fff; font-size: 18px; flex: 0 0 auto; }
.entry-text { min-width: 0; flex: 1; }
.entry-title { font-size: 14px; font-weight: 600; color: #303133; }
.entry-desc { font-size: 11px; color: #909399; margin-top: 2px; }

@media (max-width: 900px) {
  .ss-grid { grid-template-columns: 1fr; }
}
</style>
