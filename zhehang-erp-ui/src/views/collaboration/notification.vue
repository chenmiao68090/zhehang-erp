<template>
  <div class="collab-page collab-notify">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 05 / NOTIFY</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">通知中心</span>
          <span class="title-en">Notification Hub</span>
        </h1>
        <p class="page-desc">汇集所有任务、审批、系统与提及消息，一处看尽</p>
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
    <section class="notify-toolbar">
      <div class="toolbar-info">
        <el-icon class="info-ic"><InfoFilled /></el-icon>
        <span>当前共有 <em>{{ unreadCount }}</em> 条未读通知，您可以分类查看或一键标记已读</span>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Setting">通知设置</el-button>
        <el-button :icon="Check" type="primary" @click="markAll">全部标记已读</el-button>
      </div>
    </section>

    <!-- 主体 -->
    <section class="notify-workspace">
      <!-- 左侧分类 -->
      <aside class="cat-pane">
        <div
          v-for="c in categories"
          :key="c.key"
          class="cat-item"
          :class="{ active: activeCat === c.key }"
          @click="activeCat = c.key"
        >
          <div class="cat-icon" :style="{ background: c.bg }">
            <el-icon><component :is="c.icon" /></el-icon>
          </div>
          <div class="cat-info">
            <div class="cat-name">{{ c.label }}</div>
            <div class="cat-sub">{{ c.desc }}</div>
          </div>
          <el-badge :value="c.count" v-if="c.count" :max="99" class="cat-badge" />
        </div>
      </aside>

      <!-- 右侧通知列表 -->
      <main class="list-pane">
        <div class="list-head">
          <div class="list-title">
            <h3>{{ currentCategory.label }}</h3>
            <span class="list-sub">共 {{ filteredNotifications.length }} 条</span>
          </div>
          <el-radio-group v-model="readFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="unread">未读</el-radio-button>
            <el-radio-button label="read">已读</el-radio-button>
          </el-radio-group>
        </div>

        <ul class="notify-list">
          <li
            v-for="n in filteredNotifications"
            :key="n.id"
            class="notify-item"
            :class="{ unread: !n.read, accent: n.accent }"
          >
            <div class="n-left" :style="{ background: n.color }">
              <el-icon><component :is="n.icon" /></el-icon>
            </div>
            <div class="n-main">
              <div class="n-row">
                <div class="n-title">
                  <span v-if="!n.read" class="dot-unread"></span>
                  {{ n.title }}
                  <el-tag v-if="n.tag" size="small" effect="plain" :type="n.tagType" class="n-tag">
                    {{ n.tag }}
                  </el-tag>
                </div>
                <span class="n-time">{{ n.time }}</span>
              </div>
              <div class="n-summary">{{ n.summary }}</div>
              <div class="n-meta" v-if="n.from || n.action">
                <span v-if="n.from"><el-icon><User /></el-icon> {{ n.from }}</span>
                <span v-if="n.action" class="n-action">{{ n.action }} →</span>
              </div>
            </div>
            <div class="n-actions">
              <el-button text v-if="!n.read" :icon="Check" size="small">标已读</el-button>
              <el-button text :icon="Delete" size="small" />
            </div>
          </li>
        </ul>

        <div v-if="filteredNotifications.length === 0" class="empty-tip">
          <el-empty description="暂无通知" :image-size="100" />
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  InfoFilled, Setting, Check, Delete, User,
  Bell, Tickets, Document, Warning, ChatLineSquare, Star,
  Promotion, BellFilled
} from '@element-plus/icons-vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '今日通知', value: '34' },
  { label: '未读', value: '12' },
  { label: '待审批', value: '5' },
  { label: '@我提及', value: '3' }
]

const categories = [
  { key: 'all', label: '全部', desc: '所有类型的通知', count: 12, icon: BellFilled, bg: 'linear-gradient(135deg,#D4AF37,#8B6F1F)' },
  { key: 'task', label: '任务', desc: '任务派发与到期提醒', count: 4, icon: Tickets, bg: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
  { key: 'approval', label: '审批', desc: '审批申请与流转节点', count: 5, icon: Document, bg: 'linear-gradient(135deg,#F26522,#A8401A)' },
  { key: 'system', label: '系统', desc: '系统更新与运维公告', count: 0, icon: Warning, bg: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
  { key: 'mention', label: '@我提及', desc: '协作文档与群聊提及', count: 3, icon: ChatLineSquare, bg: 'linear-gradient(135deg,#3CB371,#1F6B45)' },
  { key: 'star', label: '星标', desc: '收藏的重要通知', count: 0, icon: Star, bg: 'linear-gradient(135deg,#C44569,#7B2A45)' }
]
const activeCat = ref('all')
const readFilter = ref('all')
const currentCategory = computed(() => categories.find(c => c.key === activeCat.value)!)

interface NotifyItem {
  id: string; cat: string; title: string; summary: string;
  time: string; read: boolean; from?: string; action?: string;
  icon: any; color: string; tag?: string; tagType?: any; accent?: boolean;
}

const notifications = ref<NotifyItem[]>([
  {
    id: 'n1', cat: 'task', title: '提单系统财务核对任务派发',
    summary: '陈雨桐分配给你一项任务"提单 #ZH-2025-0418 财务复核"，截止时间今日 17:00。',
    time: '5 分钟前', read: false, from: '陈雨桐', action: '查看任务',
    icon: Tickets, color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
    tag: '高优', tagType: 'danger', accent: true
  },
  {
    id: 'n2', cat: 'approval', title: '差旅报销审批待您处理',
    summary: '李承宇提交的"上海客户拜访"差旅报销 ¥3,860.00 等待您的审批。',
    time: '23 分钟前', read: false, from: '李承宇', action: '前往审批',
    icon: Document, color: 'linear-gradient(135deg,#F26522,#A8401A)',
    tag: '审批', tagType: 'warning'
  },
  {
    id: 'n3', cat: 'mention', title: '王梓豪在文档中提及了你',
    summary: '@你 这版驾驶舱视觉规范请帮忙过一遍颜色规范，主色还是用主金色。',
    time: '1 小时前', read: false, from: '王梓豪', action: '打开文档',
    icon: ChatLineSquare, color: 'linear-gradient(135deg,#3CB371,#1F6B45)'
  },
  {
    id: 'n4', cat: 'task', title: '周期性任务即将到期',
    summary: '"每周销售战报整理"还有 2 天到达本周提交节点，请合理安排。',
    time: '2 小时前', read: false,
    icon: Tickets, color: 'linear-gradient(135deg,#5B7CFA,#324BB3)'
  },
  {
    id: 'n5', cat: 'approval', title: '采购合同审批已通过',
    summary: '您提交的"上海泰诚物流采购合同"已由总经理审批通过，可执行下一步。',
    time: '3 小时前', read: true, from: '总经理',
    icon: Document, color: 'linear-gradient(135deg,#F26522,#A8401A)',
    tag: '已通过', tagType: 'success'
  },
  {
    id: 'n6', cat: 'mention', title: '苏静仪在群聊中提及你',
    summary: '【人力周会群】@你 麻烦把本周面试反馈表归档到云盘 / 招聘 / 2026 Q2。',
    time: '今日 09:18', read: true, from: '苏静仪',
    icon: ChatLineSquare, color: 'linear-gradient(135deg,#3CB371,#1F6B45)'
  },
  {
    id: 'n7', cat: 'system', title: 'ERP 系统将于 5 月 26 日凌晨升级',
    summary: '为提升驾驶舱响应速度，系统将于 02:00 - 03:00 进行版本更新，期间可能出现短暂访问中断。',
    time: '昨日 18:00', read: true,
    icon: Warning, color: 'linear-gradient(135deg,#9C5FB6,#5E3779)',
    tag: '系统', tagType: 'info'
  },
  {
    id: 'n8', cat: 'task', title: '一次性任务"客户回访"已完成',
    summary: '李承宇已完成一次性任务"5 月 KA 客户回访"，请确认验收。',
    time: '昨日 16:42', read: true, from: '李承宇',
    icon: Tickets, color: 'linear-gradient(135deg,#5B7CFA,#324BB3)'
  },
  {
    id: 'n9', cat: 'approval', title: '请假审批待您处理',
    summary: '林晓彤申请年假 1 天（5 月 27 日），请您审批。',
    time: '昨日 14:08', read: true, from: '林晓彤',
    icon: Document, color: 'linear-gradient(135deg,#F26522,#A8401A)'
  }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const filteredNotifications = computed(() => {
  let list = notifications.value
  if (activeCat.value !== 'all') list = list.filter(n => n.cat === activeCat.value)
  if (readFilter.value === 'unread') list = list.filter(n => !n.read)
  if (readFilter.value === 'read') list = list.filter(n => n.read)
  return list
})

function markAll() {
  notifications.value.forEach(n => (n.read = true))
}
</script>

<style lang="scss" scoped>
@use './_collab.scss';

/* —— 工具条 —— */
.notify-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(22, 22, 30, 0.4) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 14px 18px;
  gap: 16px;

  .toolbar-info {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px;
    color: var(--text-body, #B8B8C0);

    em {
      font-style: normal;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--gold-primary, #D4AF37);
      padding: 0 4px;
    }
    .info-ic { color: var(--gold-primary, #D4AF37); font-size: 18px; }
  }
  .toolbar-actions { display: flex; gap: 8px; }
}

/* —— 工作区 —— */
.notify-workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px;
  min-height: 640px;
}

/* —— 分类侧栏 —— */
.cat-pane {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;

  &:hover { background: rgba(212, 175, 55, 0.05); }
  &.active {
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04));
    box-shadow: inset 3px 0 0 var(--gold-primary, #D4AF37);

    .cat-name { color: var(--gold-primary, #D4AF37); }
  }

  .cat-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
  }
  .cat-info { flex: 1; min-width: 0; }
  .cat-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  .cat-sub {
    font-size: 11px;
    color: var(--text-muted, #888);
    margin-top: 2px;
  }
  .cat-badge { transform: scale(0.85); }
}

/* —— 通知列表 —— */
.list-pane {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.list-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);

  .list-title {
    display: flex; align-items: baseline; gap: 10px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary, #F5F5F5);
      margin: 0;
    }
    .list-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: rgba(212, 175, 55, 0.5);
    }
  }
}

.notify-list {
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notify-item {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.015);
  transition: all .15s;

  &:hover {
    border-color: rgba(212, 175, 55, 0.24);
    background: rgba(212, 175, 55, 0.04);
  }
  &.unread {
    background: rgba(212, 175, 55, 0.05);
    border-color: rgba(212, 175, 55, 0.2);
  }
  &.accent {
    background: linear-gradient(135deg, rgba(242, 101, 34, 0.08) 0%, rgba(212, 175, 55, 0.05) 100%);
    border-color: rgba(242, 101, 34, 0.3);
  }

  .n-left {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 18px;
    flex-shrink: 0;
  }
  .n-main { min-width: 0; }
  .n-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 4px;
  }
  .n-title {
    display: flex; align-items: center; gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    flex: 1;
    min-width: 0;
  }
  .dot-unread {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #F26522;
    box-shadow: 0 0 8px #F26522;
  }
  .n-tag { margin-left: 4px; }
  .n-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted, #888);
    white-space: nowrap;
    margin-left: 12px;
  }
  .n-summary {
    font-size: 13px;
    color: var(--text-body, #B8B8C0);
    line-height: 1.6;
    margin-bottom: 6px;
  }
  .n-meta {
    display: flex; gap: 14px;
    font-size: 11px;
    color: var(--text-muted, #888);

    span { display: inline-flex; align-items: center; gap: 4px; }
    .n-action {
      color: var(--gold-primary, #D4AF37);
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }
  }
  .n-actions {
    display: flex; flex-direction: column; gap: 4px;
    align-self: center;
  }
}

.empty-tip {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 0;
}

@media (max-width: 1100px) {
  .notify-workspace { grid-template-columns: 1fr; }
  .notify-toolbar { flex-direction: column; align-items: stretch;
    .toolbar-actions { justify-content: flex-end; }
  }
}
</style>
