<template>
  <div class="collab-page collab-meeting">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 03 / MEETING</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">视频会议</span>
          <span class="title-en">Video Conference</span>
        </h1>
        <p class="page-desc">高清音视频会议室，让远程协作如同面对面</p>
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

    <!-- 快速发起 -->
    <section class="quick-launch">
      <div class="launch-card primary">
        <div class="launch-icon">
          <el-icon><VideoCameraFilled /></el-icon>
        </div>
        <div class="launch-info">
          <div class="launch-title">快速会议</div>
          <div class="launch-sub">立即创建一个会议室并邀请成员加入</div>
        </div>
        <el-button type="primary" round :icon="VideoCameraFilled">立即开会</el-button>
      </div>
      <div class="launch-card">
        <div class="launch-icon"><el-icon><Calendar /></el-icon></div>
        <div class="launch-info">
          <div class="launch-title">预约会议</div>
          <div class="launch-sub">提前预定时间与会议室资源</div>
        </div>
        <el-button :icon="Calendar">预约</el-button>
      </div>
      <div class="launch-card">
        <div class="launch-icon"><el-icon><Connection /></el-icon></div>
        <div class="launch-info">
          <div class="launch-title">加入会议</div>
          <div class="launch-sub">输入九位会议号即可快速加入</div>
        </div>
        <el-button :icon="Connection">加入</el-button>
      </div>
      <div class="launch-card">
        <div class="launch-icon"><el-icon><Monitor /></el-icon></div>
        <div class="launch-info">
          <div class="launch-title">屏幕共享</div>
          <div class="launch-sub">直接发起一个无视频的演示会议</div>
        </div>
        <el-button :icon="Monitor">共享</el-button>
      </div>
    </section>

    <!-- 会议列表 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">即将开始</h2>
        <span class="section-sub">UPCOMING / TODAY</span>
        <el-radio-group v-model="upcomingFilter" size="small" class="head-filter">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="my">我组织</el-radio-button>
          <el-radio-button label="invited">受邀</el-radio-button>
        </el-radio-group>
      </div>

      <div class="meeting-grid">
        <div v-for="m in upcoming" :key="m.id" class="meeting-card">
          <div class="card-stripe" :class="m.color"></div>
          <div class="meeting-time">
            <div class="m-hour">{{ m.hour }}</div>
            <div class="m-day">{{ m.day }}</div>
          </div>
          <div class="meeting-main">
            <div class="m-title">{{ m.title }}</div>
            <div class="m-tags">
              <span class="m-tag" v-for="t in m.tags" :key="t">{{ t }}</span>
            </div>
            <div class="m-info">
              <span><el-icon><Clock /></el-icon> {{ m.duration }}</span>
              <span><el-icon><User /></el-icon> {{ m.members }} 位参与人</span>
              <span><el-icon><LocationFilled /></el-icon> {{ m.room }}</span>
            </div>
            <div class="m-attendees">
              <div
                v-for="(a, i) in m.attendees"
                :key="i"
                class="att-avatar"
                :style="{ background: a.color, marginLeft: i === 0 ? 0 : '-8px' }"
              >
                {{ a.avatar }}
              </div>
              <span class="att-more" v-if="m.members > m.attendees.length">+{{ m.members - m.attendees.length }}</span>
            </div>
          </div>
          <div class="meeting-actions">
            <el-tag :type="m.status === '即将开始' ? 'warning' : 'info'" effect="plain" size="small">
              {{ m.status }}
            </el-tag>
            <el-button type="primary" :icon="VideoCamera" size="small">进入会议</el-button>
            <el-button text size="small">详情</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 历史会议 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">历史会议</h2>
        <span class="section-sub">HISTORY / RECORDS</span>
      </div>

      <el-table :data="history" stripe class="history-table">
        <el-table-column label="会议主题" min-width="220">
          <template #default="{ row }">
            <div class="history-title">
              <i class="title-bar"></i>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="organizer" label="组织者" width="120" />
        <el-table-column prop="time" label="开始时间" width="180" />
        <el-table-column prop="duration" label="时长" width="100" />
        <el-table-column prop="members" label="参与人数" width="100" align="center" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain" v-if="row.status === '已结束'">已结束</el-tag>
            <el-tag size="small" type="info" effect="plain" v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button text type="primary">查看纪要</el-button>
            <el-button text>回放</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  VideoCameraFilled, Calendar, Connection, Monitor,
  Clock, User, LocationFilled, VideoCamera
} from '@element-plus/icons-vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '今日会议', value: '12' },
  { label: '正在进行', value: '2' },
  { label: '本周累计', value: '48' },
  { label: '会议时长（h）', value: '92.5' }
]

const upcomingFilter = ref('all')

const upcoming = [
  {
    id: 'mt1', title: '提单系统财务核对方案评审', hour: '14:30', day: '今日',
    duration: '60 分钟', members: 8, room: '云端会议室 A', status: '即将开始',
    color: 'gold', tags: ['提单', '财务', '高优'],
    attendees: [
      { avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
      { avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)' },
      { avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
      { avatar: '苏', color: 'linear-gradient(135deg,#E9967A,#A85F45)' }
    ]
  },
  {
    id: 'mt2', title: '驾驶舱视觉版本评审', hour: '15:45', day: '今日',
    duration: '45 分钟', members: 5, room: '云端会议室 B', status: '今日',
    color: 'orange', tags: ['驾驶舱', '设计'],
    attendees: [
      { avatar: '王', color: 'linear-gradient(135deg,#9C5FB6,#5E3779)' },
      { avatar: '林', color: 'linear-gradient(135deg,#3CB371,#1F6B45)' },
      { avatar: '赵', color: 'linear-gradient(135deg,#D4AF37,#8B6F1F)' }
    ]
  },
  {
    id: 'mt3', title: '本周销售战报例会', hour: '09:30', day: '明日',
    duration: '90 分钟', members: 18, room: '一号会议室', status: '明日',
    color: 'blue', tags: ['销售', '例会', '周会'],
    attendees: [
      { avatar: '陈', color: 'linear-gradient(135deg,#5B7CFA,#324BB3)' },
      { avatar: '李', color: 'linear-gradient(135deg,#F26522,#A8401A)' },
      { avatar: '赵', color: 'linear-gradient(135deg,#D4AF37,#8B6F1F)' },
      { avatar: '孙', color: 'linear-gradient(135deg,#C44569,#7B2A45)' }
    ]
  },
  {
    id: 'mt4', title: '地址资源上架流程优化讨论', hour: '14:00', day: '后天',
    duration: '60 分钟', members: 6, room: '云端会议室 C', status: '已预约',
    color: 'green', tags: ['渠道资源', '流程'],
    attendees: [
      { avatar: '林', color: 'linear-gradient(135deg,#3CB371,#1F6B45)' },
      { avatar: '周', color: 'linear-gradient(135deg,#1F6BA8,#0F4675)' }
    ]
  }
]

const history = [
  { title: '客户成功季度复盘', organizer: '陈雨桐', time: '2026-05-22 14:00', duration: '95 分钟', members: 14, status: '已结束' },
  { title: '前端组架构升级评审', organizer: '王梓豪', time: '2026-05-21 10:30', duration: '70 分钟', members: 9, status: '已结束' },
  { title: '招聘进展周会', organizer: '苏静仪', time: '2026-05-20 09:30', duration: '40 分钟', members: 6, status: '已结束' },
  { title: '财务月结对齐会', organizer: '陈雨桐', time: '2026-05-19 16:00', duration: '120 分钟', members: 11, status: '已结束' },
  { title: '驾驶舱大屏 V3 评审', organizer: '王梓豪', time: '2026-05-18 14:30', duration: '60 分钟', members: 8, status: '已结束' }
]
</script>

<style lang="scss" scoped>
@use './_collab.scss';

/* —— 快速发起 —— */
.quick-launch {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.launch-card {
  position: relative;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all .2s;
  overflow: hidden;

  &:hover {
    border-color: rgba(212, 175, 55, 0.32);
    transform: translateY(-2px);
  }

  &.primary {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(31, 26, 18, 1) 60%);
    border-color: rgba(212, 175, 55, 0.4);

    &::after {
      content: '';
      position: absolute;
      right: -30px; top: -30px;
      width: 120px; height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
      pointer-events: none;
    }
    .launch-icon { background: linear-gradient(135deg, #D4AF37, #8B6F1F); color: #1A1A24; }
  }

  .launch-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212, 175, 55, 0.1);
    color: var(--gold-primary, #D4AF37);
    font-size: 22px;
    flex-shrink: 0;
  }
  .launch-info { flex: 1; min-width: 0; position: relative; z-index: 1; }
  .launch-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 4px;
  }
  .launch-sub {
    font-size: 12px;
    color: var(--text-muted, #888);
    line-height: 1.4;
  }
}

/* —— Section 复用 head-filter —— */
.head-filter { margin-left: auto; }

/* —— 会议卡片 —— */
.meeting-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.meeting-card {
  position: relative;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 20px 22px 18px 28px;
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 18px;
  transition: all .2s;
  overflow: hidden;

  &:hover {
    border-color: rgba(212, 175, 55, 0.32);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  }
}
.card-stripe {
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--gold-primary, #D4AF37);

  &.orange { background: #F26522; }
  &.blue { background: #5B7CFA; }
  &.green { background: #3CB371; }
}
.meeting-time {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-right: 1px solid rgba(212, 175, 55, 0.1);
  padding-right: 18px;

  .m-hour {
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: var(--gold-primary, #D4AF37);
    line-height: 1;
  }
  .m-day {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-muted, #888);
    letter-spacing: 0.1em;
  }
}
.meeting-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .m-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    line-height: 1.4;
  }
  .m-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .m-tag {
    font-size: 11px;
    padding: 1px 8px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 3px;
    color: rgba(212, 175, 55, 0.8);
    background: rgba(212, 175, 55, 0.06);
    letter-spacing: 0.04em;
  }
  .m-info {
    display: flex; gap: 16px; flex-wrap: wrap;
    font-size: 12px;
    color: var(--text-body, #B8B8C0);

    span { display: inline-flex; align-items: center; gap: 4px; }
  }
}
.m-attendees {
  display: flex; align-items: center; margin-top: 4px;

  .att-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    border: 2px solid #16161E;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
  }
  .att-more {
    margin-left: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--gold-primary, #D4AF37);
  }
}
.meeting-actions {
  grid-column: 1 / -1;
  display: flex; align-items: center; gap: 12px;
  padding-top: 14px;
  border-top: 1px dashed rgba(212, 175, 55, 0.1);
  margin-top: 6px;

  .el-button { margin-left: auto; }
  .el-button + .el-button { margin-left: 0; }
}

/* —— 历史表 —— */
.history-table {
  background: transparent !important;
}
.history-title {
  display: flex; align-items: center; gap: 10px;

  .title-bar {
    width: 3px; height: 14px;
    background: var(--gold-primary, #D4AF37);
    border-radius: 1px;
  }
}

@media (max-width: 1100px) {
  .quick-launch { grid-template-columns: repeat(2, 1fr); }
  .meeting-grid { grid-template-columns: 1fr; }
}
</style>
