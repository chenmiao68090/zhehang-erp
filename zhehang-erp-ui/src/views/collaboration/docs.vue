<template>
  <div class="collab-page collab-docs">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 04 / DOCS</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">协作文档</span>
          <span class="title-en">Collaborative Docs</span>
        </h1>
        <p class="page-desc">在线编辑、多人共创，沉淀团队的每一份知识资产</p>
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

    <!-- 操作栏 -->
    <section class="docs-toolbar">
      <div class="toolbar-left">
        <el-dropdown split-button type="primary" @click="onCreate">
          <template #default><el-icon><Plus /></el-icon> 新建文档</template>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="Document">空白文档</el-dropdown-item>
              <el-dropdown-item :icon="Tickets">从模板创建</el-dropdown-item>
              <el-dropdown-item :icon="Files">新建表格</el-dropdown-item>
              <el-dropdown-item :icon="DataLine">新建多维表</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :icon="Folder">新建文件夹</el-button>
        <el-button :icon="Upload">上传文件</el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="search"
          placeholder="搜索文档名称、标签或内容"
          :prefix-icon="Search"
          clearable
          style="width: 320px"
        />
      </div>
    </section>

    <!-- 模板速建 -->
    <section class="template-strip">
      <div class="tmpl-card" v-for="t in templates" :key="t.title">
        <div class="tmpl-icon" :style="{ background: t.bg }">
          <el-icon><component :is="t.icon" /></el-icon>
        </div>
        <div>
          <div class="tmpl-title">{{ t.title }}</div>
          <div class="tmpl-sub">{{ t.sub }}</div>
        </div>
      </div>
    </section>

    <!-- 文档列表 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">文档列表</h2>
        <span class="section-sub">DOCUMENTS / RECENTLY EDITED</span>
        <el-radio-group v-model="filter" size="small" class="head-filter">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="mine">我创建</el-radio-button>
          <el-radio-button label="shared">共享给我</el-radio-button>
          <el-radio-button label="star">星标</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="filteredDocs" stripe class="docs-table">
        <el-table-column label="文档名称" min-width="320">
          <template #default="{ row }">
            <div class="doc-name">
              <div class="doc-icon" :class="row.type">
                <el-icon v-if="row.type === 'doc'"><Document /></el-icon>
                <el-icon v-if="row.type === 'sheet'"><Files /></el-icon>
                <el-icon v-if="row.type === 'mind'"><Share /></el-icon>
                <el-icon v-if="row.type === 'slide'"><Picture /></el-icon>
              </div>
              <div class="doc-meta">
                <div class="doc-title">
                  {{ row.title }}
                  <el-icon v-if="row.star" class="star-icon"><StarFilled /></el-icon>
                </div>
                <div class="doc-path">
                  <el-icon><FolderOpened /></el-icon>
                  {{ row.path }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="160">
          <template #default="{ row }">
            <div class="creator">
              <span class="c-avatar" :style="{ background: row.creatorColor }">{{ row.creatorAvatar }}</span>
              <span>{{ row.creator }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="editedAt" label="最近编辑" width="160" />
        <el-table-column label="协作者" width="180">
          <template #default="{ row }">
            <div class="collaborators">
              <div
                v-for="(c, i) in row.collaborators"
                :key="i"
                class="c-avatar sm"
                :style="{ background: c.color, marginLeft: i === 0 ? 0 : '-6px' }"
              >
                {{ c.avatar }}
              </div>
              <span class="c-count">{{ row.collaboratorCount }} 人</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain"
              :type="row.access === '可编辑' ? 'success' : row.access === '只读' ? 'info' : 'warning'">
              {{ row.access }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button text type="primary">打开</el-button>
            <el-button text>分享</el-button>
            <el-button text>历史</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Document, Tickets, Files, DataLine, Folder, Upload, Search,
  Share, Picture, StarFilled, FolderOpened
} from '@element-plus/icons-vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '我的文档', value: '128' },
  { label: '今日编辑', value: '24' },
  { label: '共享文档', value: '67' },
  { label: '协作成员', value: '42' }
]

const filter = ref('all')
const search = ref('')

function onCreate() { /* placeholder */ }

const templates = [
  { title: '会议纪要', sub: '标准会议记录模板', icon: 'Tickets', bg: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
  { title: '项目周报', sub: '每周项目汇报范式', icon: 'TrendCharts', bg: 'linear-gradient(135deg,#F26522,#A8401A)' },
  { title: '需求文档', sub: 'PRD 标准结构', icon: 'Document', bg: 'linear-gradient(135deg,#3CB371,#1F6B45)' },
  { title: 'OKR 跟踪', sub: '季度目标跟踪表', icon: 'DataAnalysis', bg: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
  { title: '复盘报告', sub: '项目复盘四象限', icon: 'Notebook', bg: 'linear-gradient(135deg,#D4AF37,#8B6F1F)' }
]

interface Doc {
  id: string; title: string; type: 'doc' | 'sheet' | 'mind' | 'slide';
  path: string; creator: string; creatorAvatar: string; creatorColor: string;
  editedAt: string; collaboratorCount: number; access: string; star?: boolean;
  collaborators: { avatar: string; color: string }[];
}

const docs: Doc[] = [
  {
    id: 'd1', title: '2026 Q2 销售战略规划', type: 'doc', path: '销售中心 / 战略规划',
    creator: '陈雨桐', creatorAvatar: '陈', creatorColor: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
    editedAt: '5 分钟前', collaboratorCount: 8, access: '可编辑', star: true,
    collaborators: [
      { avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)' },
      { avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
      { avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)' }
    ]
  },
  {
    id: 'd2', title: '提单系统财务核对方案 V3', type: 'doc', path: '产品中心 / 提单',
    creator: '李承宇', creatorAvatar: '李', creatorColor: 'linear-gradient(135deg,#F26522,#A8401A)',
    editedAt: '1 小时前', collaboratorCount: 12, access: '可编辑',
    collaborators: [
      { avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
      { avatar: '林', color: 'linear-gradient(135deg,#3CB371,#1F6B45)' }
    ]
  },
  {
    id: 'd3', title: '驾驶舱大屏视觉规范', type: 'slide', path: '设计 / 视觉资产',
    creator: '王梓豪', creatorAvatar: '王', creatorColor: 'linear-gradient(135deg,#9C5FB6,#5E3779)',
    editedAt: '今日 10:24', collaboratorCount: 5, access: '只读', star: true,
    collaborators: [
      { avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
      { avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)' }
    ]
  },
  {
    id: 'd4', title: '5 月销售业绩明细表', type: 'sheet', path: '销售中心 / 业绩报表',
    creator: '赵宇航', creatorAvatar: '赵', creatorColor: 'linear-gradient(135deg,#D4AF37,#8B6F1F)',
    editedAt: '昨日 22:18', collaboratorCount: 16, access: '可编辑',
    collaborators: [
      { avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
      { avatar: '孙', color: 'linear-gradient(135deg,#C44569,#7B2A45)' },
      { avatar: '周', color: 'linear-gradient(135deg,#1F6BA8,#0F4675)' }
    ]
  },
  {
    id: 'd5', title: '招聘流程优化思维导图', type: 'mind', path: '人力资源 / 招聘',
    creator: '苏静仪', creatorAvatar: '苏', creatorColor: 'linear-gradient(135deg,#E9967A,#A85F45)',
    editedAt: '2 天前', collaboratorCount: 4, access: '审阅',
    collaborators: [
      { avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)' },
      { avatar: '林', color: 'linear-gradient(135deg,#3CB371,#1F6B45)' }
    ]
  },
  {
    id: 'd6', title: '2026 年度技术演进路线', type: 'doc', path: '研发 / 技术规划',
    creator: '王梓豪', creatorAvatar: '王', creatorColor: 'linear-gradient(135deg,#9C5FB6,#5E3779)',
    editedAt: '3 天前', collaboratorCount: 9, access: '可编辑',
    collaborators: [
      { avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
      { avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)' },
      { avatar: '周', color: 'linear-gradient(135deg,#1F6BA8,#0F4675)' }
    ]
  },
  {
    id: 'd7', title: '客户成功季度复盘报告', type: 'doc', path: '销售中心 / 复盘',
    creator: '陈雨桐', creatorAvatar: '陈', creatorColor: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
    editedAt: '上周', collaboratorCount: 11, access: '只读',
    collaborators: [
      { avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
      { avatar: '赵', color: 'linear-gradient(135deg,#D4AF37,#8B6F1F)' }
    ]
  }
]

const filteredDocs = computed(() => {
  let list = docs
  if (search.value) list = list.filter(d => d.title.includes(search.value) || d.path.includes(search.value))
  if (filter.value === 'star') list = list.filter(d => d.star)
  return list
})
</script>

<style lang="scss" scoped>
@use './_collab.scss';

/* —— 工具条 —— */
.docs-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
  padding: 14px 18px;
  gap: 12px;

  .toolbar-left { display: flex; gap: 8px; }
  .toolbar-right { display: flex; gap: 8px; }
}

/* —— 模板栏 —— */
.template-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.tmpl-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all .2s;

  &:hover {
    border-color: rgba(212, 175, 55, 0.3);
    transform: translateY(-2px);
    background: rgba(212, 175, 55, 0.04);
  }
  .tmpl-icon {
    width: 38px; height: 38px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 18px;
    flex-shrink: 0;
  }
  .tmpl-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 2px;
  }
  .tmpl-sub {
    font-size: 11px;
    color: var(--text-muted, #888);
    letter-spacing: 0.04em;
  }
}

.head-filter { margin-left: auto; }

/* —— 表格 —— */
.docs-table { background: transparent !important; }

.doc-name { display: flex; gap: 12px; align-items: center; }
.doc-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  &.doc { background: rgba(91, 124, 250, 0.15); color: #5B7CFA; }
  &.sheet { background: rgba(60, 179, 113, 0.15); color: #3CB371; }
  &.mind { background: rgba(156, 95, 182, 0.15); color: #9C5FB6; }
  &.slide { background: rgba(242, 101, 34, 0.15); color: #F26522; }
}
.doc-meta { min-width: 0; }
.doc-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);

  .star-icon { color: var(--gold-primary, #D4AF37); font-size: 14px; }
}
.doc-path {
  display: flex; align-items: center; gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted, #888);
  letter-spacing: 0.04em;
}

.creator { display: flex; align-items: center; gap: 8px; }
.c-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 600;

  &.sm {
    width: 22px; height: 22px;
    border: 2px solid #16161E;
    font-size: 10px;
  }
}
.collaborators { display: flex; align-items: center; }
.c-count {
  margin-left: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--gold-primary, #D4AF37);
}

@media (max-width: 1100px) {
  .template-strip { grid-template-columns: repeat(2, 1fr); }
  .docs-toolbar { flex-direction: column; align-items: stretch;
    .toolbar-right :deep(.el-input) { width: 100% !important; }
  }
}
</style>
