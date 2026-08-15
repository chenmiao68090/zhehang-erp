<template>
  <div class="ws">
    <div class="ws-head">
      <div>
        <h2 class="ws-title">员工微信列表</h2>
        <p class="ws-sub">每个销售的微信运营数据,从云客实时拉取:沟通人数、有效沟通、跟进客户等。</p>
      </div>
      <el-button @click="load" plain :loading="loading"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </div>

    <el-alert type="info" :closable="false" show-icon class="ws-alert">
      <template #title>关于数据来源</template>
      下方均为 <b>云客真实数据</b>:好友数 / 消息数(发送·接收) / 沟通人数 / 群数 已接入。回复率 / 未回复 云客开放接口不提供,已去除,不造假数据。消息数由后台每 3 小时同步近 30 天,刚配置好需稍等。
    </el-alert>

    <el-tabs v-model="tab" class="ws-tabs">
      <el-tab-pane label="员工微信列表" name="list" />
      <el-tab-pane label="朋友圈统计" name="moments" />
      <el-tab-pane label="新增好友" name="newfriend" />
      <el-tab-pane label="每日新增好友时间段" name="newtime" />
    </el-tabs>

    <template v-if="tab === 'list'">
      <div class="ws-layout">
        <div class="ws-dept">
          <div class="ws-dept-hd">组织架构</div>
          <el-tree :data="deptTreeData" :props="{ label: 'name', children: 'children' }" node-key="id"
            highlight-current default-expand-all class="ws-tree" @node-click="onDeptClick">
            <template #default="{ data }"><span class="ws-tnode">{{ data.name }}<span class="ws-tcnt">{{ data.count }}</span></span></template>
          </el-tree>
          <el-empty v-if="!deptTreeData.length" description="无部门数据" :image-size="50" />
        </div>
        <div class="ws-main">
      <div class="ws-filter">
        <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" class="f-date" @change="load" />
        <span class="ws-range-tip" v-if="info.beginYmd">统计区间 {{ info.beginYmd }} ~ {{ info.endYmd }}</span>
        <el-tag v-if="currentDeptName" closable size="small" type="success" @close="clearDept" style="margin-left:8px">{{ currentDeptName }} · {{ deptFilteredRows.length }}人</el-tag>
      </div>

      <el-alert v-if="errMsg" :title="errMsg" type="warning" :closable="false" show-icon style="margin-bottom:12px" />

      <el-table :data="deptFilteredRows" v-loading="loading" border class="ws-table" :header-cell-style="{ background: '#F5F7FA', color: '#606266' }">
        <el-table-column label="员工信息" min-width="230">
          <template #default="{ row }">
            <div class="staff">
              <el-avatar v-if="row.headUrl" :src="row.headUrl" :size="38" shape="square" style="cursor:pointer;flex:0 0 auto" @click="openChat(row)" title="点头像看聊天" />
              <div v-else class="avatar" :style="{ background: avatarBg(row.nickname || row.alias), cursor: 'pointer' }" @click="openChat(row)" title="点头像看聊天">{{ (row.nickname || row.alias || '微').slice(0, 1) }}</div>
              <div class="staff-info">
                <div class="s-nick">{{ row.nickname || '—' }}
                  <el-link v-if="row.chatCount" type="primary" :underline="false" style="margin-left:6px;font-size:11px;vertical-align:middle" @click="openChat(row)">看聊天({{ row.chatCount }})</el-link>
                  <span v-else style="margin-left:6px;font-size:11px;color:var(--el-text-color-placeholder)">无聊天记录</span>
                </div>
                <div class="s-sub">微信号 {{ row.alias || '—' }}</div>
                <div class="s-sub">手机 {{ row.phone || '—' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际使用人" width="104">
          <template #default="{ row }">
            <span v-if="row.staffName" style="display:inline-flex;align-items:center;gap:4px;font-weight:600;color:var(--el-text-color-primary)">
              <el-icon style="color:var(--el-color-primary)"><UserFilled /></el-icon>{{ row.staffName }}
            </span>
            <span v-else style="color:var(--el-text-color-placeholder)" title="该工作手机未在组织架构中匹配到员工">—</span>
          </template>
        </el-table-column>
        <el-table-column label="好友/群" width="108">
          <template #default="{ row }">
            <div class="mcell">
              <div class="mrow"><span class="ml">好友数</span><b class="mv" :class="{ na: row.friendCount == null }">{{ row.friendCount ?? '—' }}</b></div>
              <div class="mrow"><span class="ml">微信群数</span><b class="mv" :class="{ na: row.groupCount == null }">{{ row.groupCount ?? '—' }}</b></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="消息数" width="110">
          <template #default="{ row }">
            <div class="mcell">
              <div class="mrow"><span class="ml">发送</span><b class="mv" :class="{ na: row.sendMsg == null }">{{ row.sendMsg ?? '—' }}</b></div>
              <div class="mrow"><span class="ml">接收</span><b class="mv" :class="{ na: row.recvMsg == null }">{{ row.recvMsg ?? '—' }}</b></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="沟通数(真实)" width="150">
          <template #default="{ row }">
            <div class="mcell">
              <div class="mrow"><span class="ml">沟通人数</span><b class="mv blue">{{ row.talkCount ?? 0 }}</b></div>
              <div class="mrow"><span class="ml">主动/被动</span><b class="mv">{{ row.sendTalker ?? 0 }}/{{ row.receiveTalker ?? 0 }}</b></div>
              <div class="mrow"><span class="ml">有效沟通</span><b class="mv blue">{{ row.contactCount ?? 0 }}</b></div>
              <div class="mrow"><span class="ml">跟进客户</span><b class="mv blue">{{ row.followCount ?? 0 }}</b></div>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="loading ? '正在从云客拉取…' : '暂无数据(确认云客对接配置已保存并测试通过)'" :image-size="80" />
        </template>
      </el-table>
      <p class="ws-foot-note" v-if="rows.length">共 {{ info.total || rows.length }} 个员工微信 · 数据来自云客</p>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'newfriend'">
      <div class="ws-filter">
        <el-date-picker v-model="nfRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" class="f-date" @change="loadNewFriends" />
        <el-button @click="loadNewFriends"><el-icon><Search /></el-icon> 查询</el-button>
        <span class="ws-range-tip" v-if="nfTotal">共 {{ nfTotal }} 条新增好友</span>
      </div>
      <el-table :data="nfRows" v-loading="nfLoading" border stripe>
        <el-table-column label="员工" min-width="140">
          <template #default="{ row }"><b class="s-nick">{{ row.userName || '—' }}</b><div class="s-sub">{{ row.userPhone || '' }}</div></template>
        </el-table-column>
        <el-table-column label="新增好友" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.nickName || '—' }}</template>
        </el-table-column>
        <el-table-column label="好友微信号" width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.alias || '—' }}</template>
        </el-table-column>
        <el-table-column label="好友手机" width="140">
          <template #default="{ row }">{{ row.wxPhone || '—' }}</template>
        </el-table-column>
        <el-table-column label="添加时间" width="170">
          <template #default="{ row }">{{ row.addFriendTime || '—' }}</template>
        </el-table-column>
        <template #empty><el-empty :description="nfLoading ? '加载中…' : '该时段暂无新增好友'" :image-size="70" /></template>
      </el-table>
    </template>
    <template v-else-if="tab === 'newtime'">
      <div class="ws-filter">
        <el-date-picker v-model="ntRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" class="f-date" @change="loadNewTime" />
        <span class="ws-range-tip">共 {{ ntTotal }} 条新增好友,按加好友的时段分布</span>
      </div>
      <el-table :data="ntTableData" v-loading="ntLoading" border stripe>
        <el-table-column label="时段" width="140">
          <template #default="{ row }">{{ String(row.hour).padStart(2, '0') }}:00 - {{ String(row.hour).padStart(2, '0') }}:59</template>
        </el-table-column>
        <el-table-column label="新增好友数" width="120" align="center">
          <template #default="{ row }"><b class="s-nick">{{ row.count }}</b></template>
        </el-table-column>
        <el-table-column label="占比">
          <template #default="{ row }"><el-progress :percentage="row.pct" :stroke-width="14" /></template>
        </el-table-column>
        <template #empty><el-empty :description="ntLoading ? '加载中…' : '该时段暂无新增好友'" :image-size="70" /></template>
      </el-table>
    </template>
    <template v-else-if="tab === 'moments'">
      <div class="ws-filter">
        <el-select v-model="mWechatId" placeholder="选择员工微信看朋友圈" filterable clearable @change="loadMoments" style="width:260px">
          <el-option v-for="r in rows" :key="r.wechatId" :label="r.nickname || r.alias || r.wechatId" :value="r.wechatId" />
        </el-select>
        <span class="ws-range-tip" v-if="mWechatId && mList.length">共 {{ mList.length }} 条朋友圈</span>
      </div>
      <div v-loading="mLoading" class="mo-wrap">
        <div v-for="(m, i) in mList" :key="i" class="mo-card">
          <div class="mo-text" v-if="m.content">{{ m.content }}</div>
          <div class="mo-text muted" v-else-if="m.type == 3">[链接] {{ m.title || '' }}</div>
          <div class="mo-text muted" v-else-if="m.type == 15 || m.type == 28">[视频]</div>
          <div class="mo-imgs" v-if="m.urls && m.urls.length">
            <el-image v-for="(u, j) in m.urls" :key="j" :src="u" :preview-src-list="m.urls" fit="cover" class="mo-img" preview-teleported hide-on-click-modal />
          </div>
          <div class="mo-meta">{{ fmtTs(m.createTime) }} · 👍 {{ m.praiseNum || 0 }} · 💬 {{ m.commentNum || 0 }} · {{ moTypeName(m.type) }}</div>
        </div>
        <el-empty v-if="mWechatId && !mList.length && !mLoading" description="该员工暂无朋友圈数据" :image-size="70" />
        <el-empty v-if="!mWechatId" description="↑ 选一个员工,看他发的朋友圈" :image-size="80" />
      </div>
    </template>
    <el-empty v-else :description="`「${tabLabel}」页待接入(会用云客对应接口做)`" :image-size="90" />

    <WechatChatDrawer ref="chatDrawer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { yunkeApi } from '@/api/yunke'
import WechatChatDrawer from './WechatChatDrawer.vue'

const chatDrawer = ref<any>(null)
const openChat = (row: any) => {
  if (!row.wechatId) { ElMessage.info('该员工微信暂无 id,无法查聊天'); return }
  chatDrawer.value?.open(row.wechatId, row.nickname || row.alias, row.headUrl)
}

const tab = ref('list')
const tabLabel = computed(() => ({ moments: '朋友圈统计', newfriend: '新增好友', newtime: '每日新增好友时间段' } as Record<string, string>)[tab.value] || '')

const loading = ref(false)
const rows = ref<any[]>([])
const range = ref<string[]>([])
const info = ref<any>({})
const errMsg = ref('')

const load = async () => {
  loading.value = true
  errMsg.value = ''
  try {
    const params: any = {}
    if (range.value?.length === 2) { params.beginYmd = range.value[0]; params.endYmd = range.value[1] }
    const res: any = await yunkeApi.wechatStaffList(params)
    const d = res?.data ?? res
    if (d && Array.isArray(d.list)) { rows.value = d.list; info.value = d }
    else { rows.value = []; info.value = {} }
  } catch (e: any) {
    rows.value = []
    errMsg.value = (e?.message || '拉取失败') + '(若提示未配置,请先到「云客对接配置」保存凭证并测试连接)'
  } finally { loading.value = false }
}

const avatarBg = (name: string) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#7B68EE']
  let h = 0
  const s = name || '微'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length
  return colors[h]
}

// 新增好友 tab
const nfRows = ref<any[]>([])
const nfLoading = ref(false)
const nfRange = ref<string[]>([])
const nfTotal = ref(0)
const loadNewFriends = async () => {
  nfLoading.value = true
  try {
    const params: any = {}
    if (nfRange.value?.length === 2) { params.beginYmd = nfRange.value[0]; params.endYmd = nfRange.value[1] }
    const res: any = await yunkeApi.newFriends(params)
    const d = res?.data ?? res
    nfRows.value = d?.list || []
    nfTotal.value = d?.total || 0
  } catch { nfRows.value = []; nfTotal.value = 0 } finally { nfLoading.value = false }
}
// 每日新增好友时间段(复用新增好友数据,按加好友小时分布)
const ntBuckets = ref<number[]>([])
const ntTotal = ref(0)
const ntRange = ref<string[]>([])
const ntLoading = ref(false)
const loadNewTime = async () => {
  ntLoading.value = true
  try {
    const params: any = { pageSize: 500 }
    if (ntRange.value?.length === 2) { params.beginYmd = ntRange.value[0]; params.endYmd = ntRange.value[1] }
    const res: any = await yunkeApi.newFriends(params)
    const d = res?.data ?? res
    const list = d?.list || []
    const b = new Array(24).fill(0)
    list.forEach((f: any) => { const t = f.addFriendTime; if (t) { const h = parseInt(String(t).slice(11, 13)); if (!isNaN(h) && h >= 0 && h < 24) b[h]++ } })
    ntBuckets.value = b
    ntTotal.value = list.length
  } catch { ntBuckets.value = []; ntTotal.value = 0 } finally { ntLoading.value = false }
}
const ntTableData = computed(() => {
  const max = Math.max(1, ...ntBuckets.value)
  return ntBuckets.value.map((c, h) => ({ hour: h, count: c, pct: Math.round((c / max) * 100) })).filter((r) => r.count > 0)
})
watch(tab, (t) => {
  if (t === 'newfriend' && !nfRows.value.length) loadNewFriends()
  if (t === 'newtime' && !ntTotal.value) loadNewTime()
})

// 朋友圈 tab(选员工看其朋友圈)
const mWechatId = ref('')
const mList = ref<any[]>([])
const mLoading = ref(false)
const loadMoments = async () => {
  if (!mWechatId.value) { mList.value = []; return }
  mLoading.value = true
  try {
    const res: any = await yunkeApi.moments({ wechatId: mWechatId.value })
    const d = res?.data ?? res
    mList.value = d?.list || []
  } catch { mList.value = [] } finally { mLoading.value = false }
}
const fmtTs = (ts: any) => {
  if (!ts) return ''
  const d = new Date(Number(ts) * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
const moTypeName = (t: any) => (({ 1: '图文', 2: '文本', 3: '链接', 15: '视频', 28: '视频号' } as any)[t] || '朋友圈')

// 组织架构树:按部门筛选员工微信(部门成员手机号 ↔ 员工 userPhone)
const deptTreeData = ref<any[]>([])
const currentDeptPhones = ref<string[]>([])
const currentDeptName = ref('')
const loadDeptTree = async () => {
  try {
    const res: any = await yunkeApi.deptTree()
    deptTreeData.value = (res?.data ?? res) || []
  } catch { deptTreeData.value = [] }
}
const onDeptClick = (data: any) => {
  currentDeptName.value = data.name
  currentDeptPhones.value = data.phones || []
}
const clearDept = () => { currentDeptName.value = ''; currentDeptPhones.value = [] }
const deptFilteredRows = computed(() => {
  if (!currentDeptPhones.value.length) return rows.value
  const set = new Set(currentDeptPhones.value)
  return rows.value.filter((r) => set.has(r.userPhone) || set.has(r.phone))
})

onMounted(() => { load(); loadDeptTree() })
</script>

<style scoped>
.ws { padding: 16px 18px; }
.ws-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.ws-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.ws-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.ws-alert { margin-bottom: 12px; }
.ws-alert :deep(.el-alert__description) { font-size: 12.5px; line-height: 1.6; }
.ws-tabs { margin-bottom: 6px; }
.ws-filter { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
.f-date { width: 260px; }
.ws-range-tip { font-size: 12px; color: var(--el-text-color-secondary); }

.ws-table { width: 100%; }
.staff { display: flex; gap: 10px; align-items: flex-start; }
.avatar { width: 36px; height: 36px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; flex: 0 0 auto; }
.staff-info { min-width: 0; }
.s-nick { font-size: 13px; font-weight: 600; color: var(--el-color-primary); line-height: 1.4; word-break: break-all; }
.s-sub { font-size: 11.5px; color: var(--el-text-color-secondary); margin-top: 1px; word-break: break-all; }

.mcell { line-height: 1.7; }
.mrow { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 12px; }
.mrow .ml { color: var(--el-text-color-secondary); }
.mrow .mv { font-weight: 600; color: var(--el-text-color-primary); font-variant-numeric: tabular-nums; }
.mrow .mv.blue { color: var(--el-color-primary); }
.mrow .mv.na { color: var(--el-text-color-placeholder); font-weight: 400; }
.ws-foot-note { margin: 10px 2px 0; font-size: 12px; color: var(--el-text-color-secondary); text-align: right; }
.ws-layout { display: flex; gap: 14px; align-items: flex-start; }
.ws-dept { width: 195px; flex: 0 0 auto; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; padding: 8px; background: var(--el-fill-color-lighter); max-height: calc(100vh - 230px); overflow-y: auto; }
.ws-dept-hd { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); padding: 4px 6px 8px; }
.ws-tree { background: transparent; }
.ws-tnode { display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 13px; padding-right: 6px; }
.ws-tcnt { font-size: 11px; color: var(--el-text-color-placeholder); background: var(--el-fill-color); border-radius: 8px; padding: 0 6px; margin-left: 6px; }
.ws-main { flex: 1; min-width: 0; }
.mo-wrap { max-width: 640px; }
.mo-card { padding: 14px 16px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; margin-bottom: 10px; background: var(--el-fill-color-blank); }
.mo-text { font-size: 14px; color: var(--el-text-color-primary); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.mo-text.muted { color: var(--el-text-color-secondary); }
.mo-imgs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.mo-img { width: 92px; height: 92px; border-radius: 6px; }
.mo-meta { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 8px; }
</style>
