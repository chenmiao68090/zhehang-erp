<template>
  <div class="wf">
    <header class="wf-head">
      <div>
        <h2 class="wf-title">微信好友</h2>
        <p class="wf-sub">系统按云客配置主动同步工作手机里的个人微信好友，页面展示最近一次同步结果。</p>
      </div>
      <el-button @click="reload" plain><el-icon><Refresh /></el-icon> 刷新</el-button>
    </header>

    <div class="wf-stats">
      <div class="wf-stat"><span class="wf-num">{{ stats.total || 0 }}</span><span class="wf-lbl">好友总数</span></div>
      <div class="wf-stat"><span class="wf-num">{{ stats.staffCount || 0 }}</span><span class="wf-lbl">工作手机(员工微信)数</span></div>
    </div>

    <div class="wf-toolbar">
      <el-input v-model="keyword" class="wf-search" placeholder="搜昵称/备注/微信号/手机" clearable @keyup.enter="reload" @clear="reload" />
      <el-select v-model="wxId" placeholder="按员工微信筛选" clearable filterable class="wf-filter" @change="reload">
        <el-option v-for="w in (stats.staffWxIds || [])" :key="w" :label="w" :value="w" />
      </el-select>
      <el-button @click="reload"><el-icon><Search /></el-icon> 查询</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="好友昵称" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.friendNickname || '—' }}</template>
      </el-table-column>
      <el-table-column label="备注" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.friendRemark || '—' }}</template>
      </el-table-column>
      <el-table-column label="微信号" width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.friendAlias || '—' }}</template>
      </el-table-column>
      <el-table-column label="手机号" width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.friendWxPhone || '—' }}</template>
      </el-table-column>
      <el-table-column label="性别" width="64" align="center">
        <template #default="{ row }">{{ genderText(row.gender) }}</template>
      </el-table-column>
      <el-table-column label="地区" width="110" show-overflow-tooltip>
        <template #default="{ row }">{{ row.region || '—' }}</template>
      </el-table-column>
      <el-table-column label="标签" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag v-for="t in splitLabels(row.contactLabelValues)" :key="t" size="small" effect="plain" style="margin:2px">{{ t }}</el-tag>
          <span v-if="!row.contactLabelValues">—</span>
        </template>
      </el-table-column>
      <el-table-column label="所属员工微信" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.wxId || '—' }}</template>
      </el-table-column>
      <el-table-column label="来源" width="96">
        <template #default="{ row }">{{ row.fromType || '—' }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="150">
        <template #default="{ row }">{{ fmtTime(row.updateTime) }}</template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有同步到微信好友" :image-size="80">
          <p class="wf-empty-tip">系统会按<b>「云客对接配置」</b>主动同步微信好友。若暂未显示，请检查云客配置和员工云客关联，再刷新页面。</p>
        </el-empty>
      </template>
    </el-table>

    <div class="wf-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="loadData" @size-change="reload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { wechatFriendApi, type WechatFriend } from '@/api/wechat'

const genderText = (g?: number) => (g === 1 ? '男' : g === 2 ? '女' : '—')
const splitLabels = (s?: string) => (s ? s.split(/[，,]/).map((x) => x.trim()).filter(Boolean) : [])
const fmtTime = (t?: string) => (t ? String(t).replace('T', ' ').slice(0, 16) : '—')

const rows = ref<WechatFriend[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const wxId = ref('')
const stats = ref<any>({})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await wechatFriendApi.list({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value || undefined, wxId: wxId.value || undefined })
    const page = res?.data ?? res
    rows.value = page?.records || []
    total.value = Number(page?.total ?? 0)
  } catch { rows.value = []; total.value = 0 } finally { loading.value = false }
  loadStats()
}
const reload = () => { pageNum.value = 1; loadData() }
const loadStats = async () => { try { const res: any = await wechatFriendApi.stats(); stats.value = (res?.data ?? res) || {} } catch { /* ignore */ } }

onMounted(loadData)
</script>

<style scoped>
.wf { padding: 16px 18px; }
.wf-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.wf-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.wf-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.wf-stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.wf-stat { flex: 0 0 auto; min-width: 150px; display: flex; flex-direction: column; align-items: center; padding: 12px 20px; border-radius: 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); }
.wf-num { font-size: 24px; font-weight: 700; color: var(--el-color-success); }
.wf-lbl { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 2px; }
.wf-toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.wf-search { width: 220px; }
.wf-filter { width: 180px; }
.wf-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
.wf-empty-tip { max-width: 520px; margin: 8px auto 0; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.7; }
</style>
