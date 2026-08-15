<template>
  <div class="task-preview-shell">
    <header class="task-preview-topbar">
      <div class="task-preview-brand">
        <span class="task-preview-logo">ZH</span>
        <div><strong>浙杭集团</strong><small>任务工单 · 本地验收</small></div>
      </div>
      <div class="task-preview-warning"><el-icon><Warning /></el-icon>LOCAL-DEMO 虚构数据，不连接生产</div>
    </header>
    <div class="task-preview-body">
      <aside class="task-preview-sidebar">
        <div class="task-preview-group"><el-icon><Tickets /></el-icon><strong>任务工单</strong></div>
        <router-link v-for="item in menu" :key="item.path" :to="`${item.path}?taskPreview=1`" class="task-preview-link" active-class="is-active">
          <el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span>
        </router-link>
        <div class="task-preview-divider" />
        <div class="task-preview-legacy"><el-icon><Warning /></el-icon><span>服务工单为线上既有页面，本地十页预览不改其数据。</span></div>
      </aside>
      <main class="task-preview-main"><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Checked, DataAnalysis, Document, Flag, List, Tickets, TrendCharts, User, Warning } from '@element-plus/icons-vue'

const base = '/local-preview/feige-task'
const menu = [
  { path: `${base}/business-task`, label: '业务任务', icon: List },
  { path: `${base}/one-time-task`, label: '一次性任务', icon: Checked },
  { path: `${base}/recurring-task`, label: '周期任务', icon: Calendar },
  { path: `${base}/project-dept-task`, label: '项目部门任务', icon: Tickets },
  { path: `${base}/special-task`, label: '专项任务', icon: Flag },
  { path: `${base}/workflow-task`, label: '工作计划任务', icon: Calendar },
  { path: `${base}/workflow-report`, label: '工作计划报表', icon: DataAnalysis },
  { path: `${base}/goal-setting`, label: '目标设置', icon: TrendCharts },
  { path: `${base}/workflow-template`, label: '计划模板', icon: Document },
  { path: `${base}/subordinate-view`, label: '下属工作视图', icon: User }
]
</script>

<style scoped>
.task-preview-shell{min-height:100vh;background:#f4f6f9;color:#1f2937}.task-preview-topbar{height:68px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 26px;box-sizing:border-box;position:sticky;top:0;z-index:20}.task-preview-brand{display:flex;align-items:center;gap:12px}.task-preview-brand>div{display:flex;flex-direction:column;gap:3px}.task-preview-brand strong{font-size:20px}.task-preview-brand small{color:#64748b}.task-preview-logo{width:42px;height:42px;border-radius:12px;background:#2563eb;color:#fff;display:grid;place-items:center;font-weight:800;font-size:20px}.task-preview-warning{display:flex;align-items:center;gap:7px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:9px 13px;font-size:13px}.task-preview-body{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:calc(100vh - 68px)}.task-preview-sidebar{background:#fff;border-right:1px solid #e5e7eb;padding:18px 12px;position:sticky;top:68px;height:calc(100vh - 68px);overflow:auto;box-sizing:border-box}.task-preview-group{display:flex;align-items:center;gap:8px;padding:8px 10px 14px;color:#2563eb}.task-preview-link{height:42px;display:flex;align-items:center;gap:10px;padding:0 12px;margin:2px 0;border-radius:7px;color:#475569;text-decoration:none;font-size:14px}.task-preview-link:hover{background:#f1f5f9;color:#1d4ed8}.task-preview-link.is-active{background:#eaf2ff;color:#2563eb;font-weight:600}.task-preview-divider{border-top:1px solid #eef2f7;margin:16px 8px}.task-preview-legacy{display:flex;gap:8px;padding:10px;color:#64748b;background:#f8fafc;border-radius:7px;font-size:12px;line-height:1.55}.task-preview-main{min-width:0;padding:18px;overflow:auto}@media(max-width:900px){.task-preview-body{grid-template-columns:1fr}.task-preview-sidebar{position:static;height:auto;display:flex;overflow:auto;border-right:0;border-bottom:1px solid #e5e7eb;padding:8px}.task-preview-group,.task-preview-divider,.task-preview-legacy{display:none}.task-preview-link{white-space:nowrap;flex:0 0 auto}.task-preview-main{padding:10px}.task-preview-warning{font-size:0}.task-preview-warning .el-icon{font-size:16px}}
</style>

