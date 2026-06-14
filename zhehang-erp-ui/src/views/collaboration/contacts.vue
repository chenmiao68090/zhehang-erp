<template>
  <div class="collab-page collab-contacts">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 02 / DIRECTORY</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">通讯录</span>
          <span class="title-en">Corporate Directory</span>
        </h1>
        <p class="page-desc">浏览全公司组织架构、岗位与同事联系方式</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 搜索栏 -->
    <section class="search-bar">
      <el-input
        v-model="search"
        placeholder="搜索姓名、岗位、手机号、邮箱或工号"
        :prefix-icon="Search"
        clearable
        size="large"
      />
    </section>

    <!-- 主体工作区 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">组织 & 成员</h2>
        <span class="section-sub">DIRECTORY / TREE + LIST</span>
        <div class="view-switch">
          <span :class="{ active: view === 'card' }" @click="view = 'card'">
            <el-icon><Grid /></el-icon> 卡片
          </span>
          <span :class="{ active: view === 'table' }" @click="view = 'table'">
            <el-icon><Menu /></el-icon> 列表
          </span>
        </div>
      </div>

      <div class="contact-workspace" v-loading="loading">
        <!-- 左侧：组织树 -->
        <aside class="org-tree">
          <div class="tree-head">
            <span class="tree-title">浙杭集团</span>
            <span class="tree-sub">{{ deptCount }} 部门 · {{ members.length }} 人</span>
          </div>
          <el-tree
            :data="treeData"
            :default-expanded-keys="['root']"
            :highlight-current="true"
            node-key="id"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">{{ data.count }}</span>
              </span>
            </template>
          </el-tree>
        </aside>

        <!-- 右侧：成员展示 -->
        <main class="member-pane">
          <div class="member-pane-head">
            <div class="dept-info">
              <span class="dept-name">{{ activeDept }}</span>
              <span class="dept-meta">共 {{ filteredMembers.length }} 位成员</span>
            </div>
            <el-radio-group v-model="sortKey" size="small">
              <el-radio-button label="name">姓名排序</el-radio-button>
              <el-radio-button label="post">岗位排序</el-radio-button>
              <el-radio-button label="entry">工号排序</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 卡片视图 -->
          <div v-if="view === 'card'" class="member-grid">
            <div v-for="m in filteredMembers" :key="m.id" class="member-card">
              <div class="card-top">
                <div class="member-avatar" :style="{ background: m.color }">{{ m.avatar }}</div>
                <div class="member-meta">
                  <div class="m-name">
                    {{ m.name }}
                    <i class="m-status" :class="m.status"></i>
                  </div>
                  <div class="m-post">{{ m.post }}</div>
                </div>
                <span class="m-badge" v-if="m.empCode">{{ m.empCode }}</span>
              </div>
              <div class="card-info">
                <div class="info-row"><el-icon><Phone /></el-icon> {{ m.phone }}</div>
                <div class="info-row"><el-icon><Message /></el-icon> {{ m.email }}</div>
                <div class="info-row"><el-icon><OfficeBuilding /></el-icon> {{ m.dept }}</div>
              </div>
              <div class="card-foot">
                <el-tag size="small" :type="statusTag(m.statusCode)" effect="plain">{{ statusText(m.statusCode) }}</el-tag>
              </div>
            </div>
            <el-empty v-if="!filteredMembers.length" description="该部门暂无成员" />
          </div>

          <!-- 表格视图 -->
          <el-table v-else :data="filteredMembers" stripe class="member-table">
            <el-table-column label="姓名" width="180">
              <template #default="{ row }">
                <div class="cell-name">
                  <div class="member-avatar sm" :style="{ background: row.color }">{{ row.avatar }}</div>
                  <div>
                    <div class="m-name">{{ row.name }}</div>
                    <div class="m-sub">{{ row.empCode }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="post" label="岗位" width="160" />
            <el-table-column prop="dept" label="所属部门" width="180" />
            <el-table-column prop="phone" label="联系电话" width="160" />
            <el-table-column prop="email" label="电子邮箱" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="statusTag(row.statusCode)" effect="plain">
                  {{ statusText(row.statusCode) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Grid, Menu, Phone, Message, OfficeBuilding } from '@element-plus/icons-vue'
import { deptApi, employeeApi } from '@/api/org'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const search = ref('')
const view = ref<'card' | 'table'>('card')
const sortKey = ref('name')
const activeDept = ref('全公司')
const loading = ref(false)

// 头像底色调色板(按 index 轮换,后端无头像字段)
const COLORS = [
  'linear-gradient(135deg,#5B7CFA,#324BB3)',
  'linear-gradient(135deg,#F26522,#A8401A)',
  'linear-gradient(135deg,#9C5FB6,#5E3779)',
  'linear-gradient(135deg,#3CB371,#1F6B45)',
  'linear-gradient(135deg,#D4AF37,#8B6F1F)',
  'linear-gradient(135deg,#C44569,#7B2A45)',
  'linear-gradient(135deg,#1F6BA8,#0F4675)'
]

// 员工状态 1在职 2试用 3离职 → 复用卡片小圆点 css(on/busy/off)
const STATUS_DOT: Record<number, 'on' | 'busy' | 'off'> = { 1: 'on', 2: 'busy', 3: 'off' }
const STATUS_TEXT: Record<number, string> = { 1: '在职', 2: '试用', 3: '离职' }
const statusText = (c: number) => STATUS_TEXT[c] || '未知'
const statusTag = (c: number) => (c === 1 ? 'success' : c === 2 ? 'warning' : 'info')

interface Member {
  id: string; name: string; empCode: string; avatar: string; color: string;
  post: string; dept: string; phone: string; email: string;
  statusCode: number; status: 'on' | 'busy' | 'off';
}

const members = ref<Member[]>([])
const treeData = ref<any[]>([])

const deptCount = computed(() => treeData.value[0]?.children?.length || 0)

const metrics = computed(() => {
  const total = members.value.length
  const onJob = members.value.filter(m => m.statusCode === 1).length
  const probation = members.value.filter(m => m.statusCode === 2).length
  return [
    { label: '员工总数', value: String(total) },
    { label: '一级部门', value: String(deptCount.value) },
    { label: '在职', value: String(onJob) },
    { label: '试用', value: String(probation) }
  ]
})

// 后端部门树 → el-tree 数据;count=该部门(按 deptName 直配)及子部门员工数
function toTreeNode(dept: any): any {
  const directCount = members.value.filter(m => m.dept === dept.deptName).length
  const children = (dept.children || []).map(toTreeNode)
  const childSum = children.reduce((s: number, c: any) => s + (c.count || 0), 0)
  return {
    id: dept.id, label: dept.deptName, count: directCount + childSum,
    children: children.length ? children : undefined
  }
}

async function loadData() {
  loading.value = true
  try {
    // 员工:真后端 /org/employee/list(分页拉大页),拦截器返回完整 R 包体 → res.data.records
    const empRes: any = await employeeApi.list({ pageNum: 1, pageSize: 500 })
    const rows: any[] = empRes?.data?.records || []
    members.value = rows.map((e, i) => ({
      id: String(e.id ?? i),
      name: e.name || '-',
      empCode: e.empCode || '',
      avatar: (e.name || '?').charAt(0),
      color: COLORS[i % COLORS.length],
      post: e.postName || '-',
      dept: e.deptName || '未分配',
      phone: e.phone || '-',
      email: e.email || '-',
      statusCode: e.status,
      status: STATUS_DOT[e.status] || 'off'
    }))
    // 部门树:真后端 /org/dept/tree(res.data)
    const deptRes: any = await deptApi.tree()
    const depts: any[] = deptRes?.data || []
    treeData.value = [{ id: 'root', label: '浙杭集团', count: members.value.length, children: depts.map(toTreeNode) }]
  } finally {
    loading.value = false
  }
}

function handleNodeClick(data: any) {
  activeDept.value = data.label === '浙杭集团' ? '全公司' : data.label
}

const filteredMembers = computed(() => {
  let list = members.value
  if (activeDept.value && activeDept.value !== '全公司') {
    list = list.filter(m => m.dept === activeDept.value)
  }
  if (search.value) {
    const kw = search.value
    list = list.filter(m =>
      m.name.includes(kw) || m.post.includes(kw) || m.phone.includes(kw) ||
      m.email.includes(kw) || m.empCode.includes(kw)
    )
  }
  return [...list].sort((a, b) => {
    if (sortKey.value === 'post') return a.post.localeCompare(b.post)
    if (sortKey.value === 'entry') return a.empCode.localeCompare(b.empCode)
    return a.name.localeCompare(b.name)
  })
})

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './_collab.scss';

/* —— 搜索条 —— */
.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
  padding: 14px 18px;

  :deep(.el-input) { flex: 1; max-width: 480px; }
}

.view-switch {
  margin-left: auto;
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted, #888);

  span {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 10px;
    border: 1px solid rgba(212, 175, 55, 0.16);
    border-radius: 4px;
    cursor: pointer;
    transition: all .15s;

    &:hover { color: var(--gold-primary, #D4AF37); }
    &.active {
      color: var(--gold-primary, #D4AF37);
      background: rgba(212, 175, 55, 0.1);
      border-color: rgba(212, 175, 55, 0.4);
    }
  }
}

/* —— 工作区 —— */
.contact-workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px;
  min-height: 600px;
}

/* —— 组织树 —— */
.org-tree {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  padding: 14px;
  overflow-y: auto;
  max-height: 700px;
}
.tree-head {
  display: flex; flex-direction: column; gap: 4px;
  padding: 6px 8px 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  margin-bottom: 8px;

  .tree-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    letter-spacing: 0.04em;
  }
  .tree-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(212, 175, 55, 0.5);
    letter-spacing: 0.1em;
  }
}
.tree-node {
  flex: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding-right: 8px;

  .node-label { font-size: 13px; }
  .node-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted, #888);
  }
}

:deep(.el-tree) {
  background: transparent;
  color: var(--text-body, #B8B8C0);

  .el-tree-node__content {
    height: 32px;
    border-radius: 6px;

    &:hover { background: rgba(212, 175, 55, 0.08); }
  }
  .el-tree-node.is-current > .el-tree-node__content {
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04));
    color: var(--gold-primary, #D4AF37);
  }
}

/* —— 成员区 —— */
.member-pane {
  display: flex; flex-direction: column;
}
.member-pane-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 4px 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  margin-bottom: 16px;

  .dept-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-right: 12px;
  }
  .dept-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(212, 175, 55, 0.5);
  }
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.member-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  padding: 16px 18px;
  position: relative;
  transition: all .2s;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
  }
  &:hover {
    border-color: rgba(212, 175, 55, 0.3);
    background: rgba(212, 175, 55, 0.04);
    transform: translateY(-2px);
  }
}
.card-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.member-avatar {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px; font-weight: 600;
  flex-shrink: 0;

  &.sm { width: 32px; height: 32px; font-size: 12px; }
}
.member-meta { flex: 1; min-width: 0; }
.m-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  display: flex; align-items: center; gap: 6px;
}
.m-sub { font-size: 11px; color: rgba(212, 175, 55, 0.5); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
.m-status {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #888;

  &.on { background: #3CB371; box-shadow: 0 0 6px #3CB371; }
  &.busy { background: #F26522; box-shadow: 0 0 6px #F26522; }
}
.m-post { font-size: 12px; color: var(--text-body, #B8B8C0); margin-top: 4px; }
.m-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 2px 6px;
  color: var(--gold-primary, #D4AF37);
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 3px;
}
.card-info {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 12px;
  color: var(--text-body, #B8B8C0);
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.08);

  .info-row { display: flex; align-items: center; gap: 6px; }
}
.card-foot {
  display: flex; gap: 4px;
  padding-top: 10px;
}

.cell-name { display: flex; gap: 10px; align-items: center; }

@media (max-width: 1100px) {
  .contact-workspace { grid-template-columns: 1fr; }
  .org-tree { max-height: 280px; }
  .search-bar { flex-direction: column; align-items: stretch;
    :deep(.el-input) { max-width: 100%; }
  }
}
</style>
