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
        placeholder="搜索姓名、岗位、手机号或邮箱"
        :prefix-icon="Search"
        clearable
        size="large"
      />
      <div class="filter-group">
        <el-button :icon="Filter">筛选</el-button>
        <el-button :icon="Download">导出</el-button>
        <el-button type="primary" :icon="UserFilled">新增联系人</el-button>
      </div>
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

      <div class="contact-workspace">
        <!-- 左侧：组织树 -->
        <aside class="org-tree">
          <div class="tree-head">
            <span class="tree-title">浙杭集团</span>
            <span class="tree-sub">8 部门 · 142 人</span>
          </div>
          <el-tree
            :data="treeData"
            :default-expanded-keys="['root', 'sales']"
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
              <el-radio-button label="entry">入职排序</el-radio-button>
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
                <span class="m-badge" v-if="m.level">{{ m.level }}</span>
              </div>
              <div class="card-info">
                <div class="info-row"><el-icon><Phone /></el-icon> {{ m.phone }}</div>
                <div class="info-row"><el-icon><Message /></el-icon> {{ m.email }}</div>
                <div class="info-row"><el-icon><OfficeBuilding /></el-icon> {{ m.dept }}</div>
              </div>
              <div class="card-actions">
                <el-button text :icon="ChatDotRound">发消息</el-button>
                <el-button text :icon="VideoCamera">视频</el-button>
                <el-button text :icon="Star">收藏</el-button>
              </div>
            </div>
          </div>

          <!-- 表格视图 -->
          <el-table v-else :data="filteredMembers" stripe class="member-table">
            <el-table-column label="姓名" width="180">
              <template #default="{ row }">
                <div class="cell-name">
                  <div class="member-avatar sm" :style="{ background: row.color }">{{ row.avatar }}</div>
                  <div>
                    <div class="m-name">{{ row.name }}</div>
                    <div class="m-sub">{{ row.englishName }}</div>
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
                <el-tag
                  size="small"
                  :type="row.status === 'on' ? 'success' : row.status === 'busy' ? 'warning' : 'info'"
                  effect="plain"
                >
                  {{ row.status === 'on' ? '在线' : row.status === 'busy' ? '忙碌' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default>
                <el-button text type="primary">发消息</el-button>
                <el-button text>详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search, Filter, Download, UserFilled, Grid, Menu,
  Phone, Message, OfficeBuilding, ChatDotRound, VideoCamera, Star
} from '@element-plus/icons-vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '员工总数', value: '142' },
  { label: '一级部门', value: '8' },
  { label: '今日在线', value: '96' },
  { label: '本月新增', value: '6' }
]

const search = ref('')
const view = ref<'card' | 'table'>('card')
const sortKey = ref('name')
const activeDept = ref('销售中心')

const treeData = [
  {
    id: 'root', label: '浙杭集团', count: 142,
    children: [
      { id: 'exec', label: '总裁办', count: 6 },
      {
        id: 'sales', label: '销售中心', count: 38,
        children: [
          { id: 'sales-east', label: '华东事业部', count: 14 },
          { id: 'sales-south', label: '华南事业部', count: 12 },
          { id: 'sales-key', label: '大客户部', count: 12 }
        ]
      },
      {
        id: 'product', label: '产品研发中心', count: 32,
        children: [
          { id: 'fe', label: '前端组', count: 9 },
          { id: 'be', label: '后端组', count: 14 },
          { id: 'qa', label: '测试组', count: 9 }
        ]
      },
      { id: 'finance', label: '财务部', count: 14 },
      { id: 'hr', label: '人力资源部', count: 12 },
      { id: 'resource', label: '渠道资源部', count: 18 },
      { id: 'market', label: '市场品牌部', count: 14 },
      { id: 'admin', label: '行政后勤部', count: 8 }
    ]
  }
]

function handleNodeClick(data: any) {
  if (data.label !== '浙杭集团') activeDept.value = data.label
  else activeDept.value = '全公司'
}

interface Member {
  id: string; name: string; englishName: string; avatar: string; color: string;
  post: string; dept: string; phone: string; email: string;
  status: 'on' | 'busy' | 'off'; level?: string;
}

const members: Member[] = [
  { id: 'm1', name: '陈雨桐', englishName: 'Chen Yutong', avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
    post: '销售总监', dept: '销售中心', phone: '188-0001-0001', email: 'chen.yt@zhehang.com', status: 'on', level: 'M3' },
  { id: 'm2', name: '李承宇', englishName: 'Li Chengyu', avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)',
    post: '高级销售经理', dept: '华东事业部', phone: '188-0001-0002', email: 'li.cy@zhehang.com', status: 'on', level: 'M2' },
  { id: 'm3', name: '王梓豪', englishName: 'Wang Zihao', avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)',
    post: '客户经理', dept: '大客户部', phone: '188-0001-0003', email: 'wang.zh@zhehang.com', status: 'busy' },
  { id: 'm4', name: '苏静仪', englishName: 'Su Jingyi', avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)',
    post: '销售助理', dept: '华南事业部', phone: '188-0001-0004', email: 'su.jy@zhehang.com', status: 'on' },
  { id: 'm5', name: '林晓彤', englishName: 'Lin Xiaotong', avatar: '林', color: 'linear-gradient(135deg,#3CB371,#1F6B45)',
    post: '渠道经理', dept: '华东事业部', phone: '188-0001-0005', email: 'lin.xt@zhehang.com', status: 'off', level: 'M1' },
  { id: 'm6', name: '赵宇航', englishName: 'Zhao Yuhang', avatar: '赵', color: 'linear-gradient(135deg,#D4AF37,#8B6F1F)',
    post: '区域销售总监', dept: '华南事业部', phone: '188-0001-0006', email: 'zhao.yh@zhehang.com', status: 'on', level: 'M3' },
  { id: 'm7', name: '孙诗涵', englishName: 'Sun Shihan', avatar: '孙', color: 'linear-gradient(135deg,#C44569,#7B2A45)',
    post: '运营专员', dept: '大客户部', phone: '188-0001-0007', email: 'sun.sh@zhehang.com', status: 'on' },
  { id: 'm8', name: '周明哲', englishName: 'Zhou Mingzhe', avatar: '周', color: 'linear-gradient(135deg,#1F6BA8,#0F4675)',
    post: '客户成功', dept: '销售中心', phone: '188-0001-0008', email: 'zhou.mz@zhehang.com', status: 'busy' }
]

const filteredMembers = computed(() => {
  let list = members
  if (search.value) {
    list = list.filter(m =>
      m.name.includes(search.value) ||
      m.post.includes(search.value) ||
      m.phone.includes(search.value) ||
      m.email.includes(search.value)
    )
  }
  return [...list].sort((a, b) => {
    if (sortKey.value === 'post') return a.post.localeCompare(b.post)
    if (sortKey.value === 'entry') return a.id.localeCompare(b.id)
    return a.name.localeCompare(b.name)
  })
})
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
  .filter-group { display: flex; gap: 8px; margin-left: auto; }
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
.card-actions {
  display: flex; gap: 4px;
  padding-top: 10px;
}

.cell-name { display: flex; gap: 10px; align-items: center; }

@media (max-width: 1100px) {
  .contact-workspace { grid-template-columns: 1fr; }
  .org-tree { max-height: 280px; }
  .search-bar { flex-direction: column; align-items: stretch;
    :deep(.el-input) { max-width: 100%; }
    .filter-group { margin-left: 0; }
  }
}
</style>
