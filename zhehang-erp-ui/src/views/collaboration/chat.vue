<template>
  <div class="collab-page collab-chat">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 01 / CHAT</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">即时消息</span>
          <span class="title-en">Instant Messaging</span>
        </h1>
        <p class="page-desc">连接同事、群组与外部伙伴的实时沟通空间</p>
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

    <!-- 消息工作区 -->
    <section class="chat-workspace">
      <!-- 左侧会话列表 -->
      <aside class="conv-panel">
        <div class="conv-search">
          <el-input
            v-model="search"
            placeholder="搜索会话或同事"
            :prefix-icon="Search"
            clearable
          />
        </div>
        <div class="conv-tabs">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            class="conv-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <em v-if="tab.unread" class="tab-dot">{{ tab.unread }}</em>
          </span>
        </div>
        <ul class="conv-list">
          <li
            v-for="c in filteredConvs"
            :key="c.id"
            class="conv-item"
            :class="{ active: activeConv === c.id }"
            @click="activeConv = c.id"
          >
            <div class="avatar" :style="{ background: c.color }">
              <span>{{ c.avatar }}</span>
              <i v-if="c.online" class="online-dot"></i>
            </div>
            <div class="conv-main">
              <div class="conv-row">
                <span class="conv-name">{{ c.name }}</span>
                <span class="conv-time">{{ c.time }}</span>
              </div>
              <div class="conv-row">
                <span class="conv-last">{{ c.last }}</span>
                <el-badge v-if="c.unread" :value="c.unread" class="conv-badge" />
              </div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧聊天窗口 -->
      <main class="chat-panel">
        <div class="chat-head">
          <div class="chat-head-left">
            <div class="avatar lg" :style="{ background: currentConv.color }">
              <span>{{ currentConv.avatar }}</span>
            </div>
            <div>
              <div class="chat-name">
                {{ currentConv.name }}
                <span v-if="currentConv.tag" class="chat-tag">{{ currentConv.tag }}</span>
              </div>
              <div class="chat-status">
                <i class="dot" :class="{ on: currentConv.online }"></i>
                {{ currentConv.online ? '在线' : '最近活跃 ' + currentConv.time }}
                <span class="meta-sep"></span>
                {{ currentConv.member }}
              </div>
            </div>
          </div>
          <div class="chat-head-right">
            <el-button text :icon="Phone">语音</el-button>
            <el-button text :icon="VideoCamera">视频</el-button>
            <el-button text :icon="More" />
          </div>
        </div>

        <div class="chat-body">
          <div class="msg-day">— 今天 ·  {{ currentDate }} —</div>
          <div
            v-for="(msg, i) in currentMessages"
            :key="i"
            class="msg-row"
            :class="{ self: msg.self }"
          >
            <div v-if="!msg.self" class="msg-avatar" :style="{ background: msg.color }">
              {{ msg.avatar }}
            </div>
            <div class="msg-block">
              <div v-if="!msg.self" class="msg-sender">{{ msg.sender }} · {{ msg.time }}</div>
              <div class="msg-bubble" :class="{ accent: msg.accent }">
                {{ msg.text }}
              </div>
              <div v-if="msg.self" class="msg-sender right">{{ msg.time }} · 已读</div>
            </div>
            <div v-if="msg.self" class="msg-avatar self">我</div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-toolbar">
            <span class="tool"><el-icon><Picture /></el-icon> 图片</span>
            <span class="tool"><el-icon><Document /></el-icon> 文件</span>
            <span class="tool"><el-icon><Calendar /></el-icon> 日程</span>
            <span class="tool"><el-icon><Microphone /></el-icon> 语音</span>
            <span class="tool"><el-icon><MagicStick /></el-icon> 智能助理</span>
            <span class="tool-divider"></span>
            <span class="tool subtle">回车发送 · Shift + 回车换行</span>
          </div>
          <el-input
            v-model="draft"
            type="textarea"
            :rows="3"
            resize="none"
            placeholder="输入消息……"
          />
          <div class="input-actions">
            <span class="counter">{{ draft.length }} / 2000</span>
            <el-button type="primary" :icon="Promotion">发送</el-button>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search, Phone, VideoCamera, More, Picture, Document,
  Calendar, Microphone, MagicStick, Promotion
} from '@element-plus/icons-vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '今日消息', value: '1,284' },
  { label: '活跃会话', value: '38' },
  { label: '未读提醒', value: '12' },
  { label: '在线同事', value: '96' }
]

const tabs = [
  { key: 'all', label: '全部', unread: 12 },
  { key: 'group', label: '群聊', unread: 5 },
  { key: 'star', label: '星标' },
  { key: 'at', label: '@我', unread: 2 }
]
const activeTab = ref('all')
const search = ref('')

interface Conv {
  id: string; name: string; avatar: string; color: string;
  last: string; time: string; unread?: number; online?: boolean;
  tag?: string; member?: string;
}

const conversations: Conv[] = [
  { id: 'c1', name: '提单审批协作群', avatar: '提', color: 'linear-gradient(135deg,#D4AF37,#8B6F1F)',
    last: '【陈雨桐】下午三点之前请把最新合同发我审核', time: '14:28', unread: 3, online: true,
    tag: '群组', member: '15 位成员 · 8 在线' },
  { id: 'c2', name: '陈雨桐', avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
    last: '财务核对那张报表的口径需要再对一下', time: '13:55', unread: 2, online: true,
    tag: '财务部 · 主管', member: '工作时间 09:00 - 18:30' },
  { id: 'c3', name: '李承宇', avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)',
    last: '收到，订单系统那边我同步给运维', time: '11:30', online: true,
    tag: '订单中心', member: '今日活跃' },
  { id: 'c4', name: '采购供应商对接群', avatar: '供', color: 'linear-gradient(135deg,#3CB371,#1F6B45)',
    last: '【林晓彤】新供应商资质已经上传，请审核', time: '昨天', unread: 7,
    tag: '群组', member: '24 位成员' },
  { id: 'c5', name: '王梓豪', avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)',
    last: '驾驶舱大屏的颜色我再调一版', time: '昨天',
    tag: '前端组', member: '最近活跃 昨天 22:15' },
  { id: 'c6', name: '人力周会群', avatar: '人', color: 'linear-gradient(135deg,#C44569,#7B2A45)',
    last: '本周招聘进度同步已提交至云盘', time: '周一',
    tag: '群组', member: '12 位成员' },
  { id: 'c7', name: '总经理直通车', avatar: '总', color: 'linear-gradient(135deg,#1F1F2C,#3A3A52)',
    last: '把上个季度复盘材料整理一份给我', time: '上周',
    tag: '高管', member: '5 位成员' },
  { id: 'c8', name: '苏静仪', avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)',
    last: '面试反馈已经发到您邮箱了', time: '上周',
    tag: '人力资源', member: '在线' }
]

const filteredConvs = computed(() => {
  if (!search.value) return conversations
  return conversations.filter(c => c.name.includes(search.value) || c.last.includes(search.value))
})

const activeConv = ref('c1')
const currentConv = computed(() => conversations.find(c => c.id === activeConv.value)!)

const draft = ref('收到，已与财务部对齐口径，下午会议前更新版本。')

const messageMap: Record<string, any[]> = {
  c1: [
    { sender: '陈雨桐', avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
      text: '各位，提单 #ZH-2025-0418 审批流程卡在财务核对节点，请确认是否需要补充明细。', time: '14:08' },
    { sender: '李承宇', avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)',
      text: '我这边已经把地址资源明细补齐了，财务那边可以直接看到成本口径。', time: '14:12' },
    { self: true, text: '我同步一下，财务核对一般在下午两点的批次跑，三点前应当处理完。', time: '14:16' },
    { sender: '陈雨桐', avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
      text: '辛苦，下午三点之前请把最新合同发我审核 🙏', time: '14:28', accent: true }
  ],
  c2: [
    { sender: '陈雨桐', avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)',
      text: '财务核对那张报表的口径需要再对一下，特别是费用归口。', time: '13:55' }
  ]
}

const currentMessages = computed(() => messageMap[activeConv.value] || messageMap.c1)
</script>

<style lang="scss" scoped>
@use './_collab.scss';

.chat-workspace {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px;
  min-height: 640px;
}

/* —— 会话列表 —— */
.conv-panel {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  overflow: hidden;
}
.conv-search { padding: 12px; border-bottom: 1px solid rgba(212, 175, 55, 0.08); }

.conv-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 8px 0;
}
.conv-tab {
  position: relative;
  padding: 6px 10px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-muted, #888);
  border-radius: 6px;
  cursor: pointer;
  transition: all .15s;

  &:hover { color: var(--gold-primary, #D4AF37); }
  &.active {
    color: var(--gold-primary, #D4AF37);
    background: rgba(212, 175, 55, 0.1);
  }
  .tab-dot {
    margin-left: 4px;
    padding: 1px 6px;
    font-size: 10px;
    font-style: normal;
    color: #fff;
    background: #F26522;
    border-radius: 8px;
  }
}

.conv-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0 8px 8px;
  overflow-y: auto;
  max-height: 540px;
}
.conv-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s;

  &:hover { background: rgba(212, 175, 55, 0.05); }
  &.active {
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.16), rgba(212, 175, 55, 0.04));
    box-shadow: inset 3px 0 0 var(--gold-primary, #D4AF37);
  }
}

.avatar {
  position: relative;
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;

  &.lg { width: 44px; height: 44px; font-size: 16px; }
  .online-dot {
    position: absolute; right: -2px; bottom: -2px;
    width: 10px; height: 10px;
    background: #3CB371;
    border-radius: 50%;
    border: 2px solid #16161E;
  }
}

.conv-main { flex: 1; min-width: 0; }
.conv-row {
  display: flex; justify-content: space-between; align-items: center;
  &:first-child { margin-bottom: 4px; }
}
.conv-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 160px;
}
.conv-time { font-size: 11px; color: var(--text-muted, #888); font-family: 'JetBrains Mono', monospace; }
.conv-last {
  font-size: 12px;
  color: var(--text-body, #B8B8C0);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 200px;
}
.conv-badge { transform: scale(0.85); }

/* —— 聊天主区 —— */
.chat-panel {
  display: flex; flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.chat-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.06), transparent);
}
.chat-head-left { display: flex; gap: 12px; align-items: center; }
.chat-name {
  font-size: 15px; font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  display: flex; align-items: center; gap: 8px;
}
.chat-tag {
  font-size: 11px;
  padding: 1px 8px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 3px;
  color: var(--gold-primary, #D4AF37);
  letter-spacing: 0.04em;
  font-weight: 400;
}
.chat-status {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-muted, #888);
  display: flex; align-items: center; gap: 6px;

  .dot { width: 6px; height: 6px; border-radius: 50%; background: #888; }
  .dot.on { background: #3CB371; box-shadow: 0 0 6px #3CB371; }
  .meta-sep { width: 1px; height: 10px; background: rgba(212, 175, 55, 0.2); margin: 0 2px; }
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 16px;
  min-height: 360px;
}
.msg-day {
  align-self: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(212, 175, 55, 0.45);
  padding: 4px 0;
}
.msg-row {
  display: flex; gap: 10px; align-items: flex-start;
  &.self { flex-direction: row-reverse; }
}
.msg-avatar {
  width: 34px; height: 34px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 600;
  background: linear-gradient(135deg, #5B7CFA, #324BB3);
  flex-shrink: 0;

  &.self {
    background: linear-gradient(135deg, #D4AF37, #8B6F1F);
    color: #1A1A24;
  }
}
.msg-block { max-width: 60%; }
.msg-sender {
  font-size: 11px;
  color: var(--text-muted, #888);
  margin-bottom: 4px;
  letter-spacing: 0.04em;

  &.right { text-align: right; }
}
.msg-bubble {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.1);
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--text-primary, #F5F5F5);
  font-size: 13px;
  line-height: 1.6;
  word-break: break-all;

  &.accent {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(242, 101, 34, 0.06));
    border-color: rgba(212, 175, 55, 0.3);
  }
}
.msg-row.self .msg-bubble {
  background: linear-gradient(135deg, #D4AF37 0%, #B8902A 100%);
  border-color: transparent;
  color: #1A1A24;
}

/* —— 输入框 —— */
.chat-input {
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  padding: 12px 16px 14px;
  background: rgba(255, 255, 255, 0.015);
}
.input-toolbar {
  display: flex; align-items: center; gap: 14px;
  font-size: 12px;
  color: var(--text-muted, #888);
  margin-bottom: 8px;
  flex-wrap: wrap;

  .tool {
    display: flex; align-items: center; gap: 4px;
    cursor: pointer;
    transition: color .15s;
    &:hover { color: var(--gold-primary, #D4AF37); }
  }
  .tool-divider { width: 1px; height: 12px; background: rgba(212, 175, 55, 0.2); }
  .subtle { color: rgba(212, 175, 55, 0.4); font-family: 'JetBrains Mono', monospace; font-size: 11px; }
}
.input-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 8px;

  .counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted, #888);
  }
}

@media (max-width: 1100px) {
  .chat-workspace { grid-template-columns: 1fr; }
  .conv-panel { max-height: 320px; }
}
</style>
