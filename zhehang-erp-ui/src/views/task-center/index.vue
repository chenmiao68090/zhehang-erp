<template>
  <div class="page-container task-center-page">
    <header class="tc-head">
      <div>
        <h2 class="tc-title">任务管理</h2>
        <p class="tc-sub">一次性、周期性与老板安排任务统一入口</p>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="task-tabs">
      <el-tab-pane name="once" lazy>
        <template #label><span class="tab-label">一次性任务</span></template>
        <TaskOnce />
      </el-tab-pane>
      <el-tab-pane name="periodic" lazy>
        <template #label><span class="tab-label">周期性任务</span></template>
        <TaskPeriodic />
      </el-tab-pane>
      <el-tab-pane name="boss" lazy>
        <template #label><span class="tab-label">老板安排</span></template>
        <TaskBoss />
      </el-tab-pane>
      <el-tab-pane name="department" lazy>
        <template #label><span class="tab-label">项目部任务</span></template>
        <TaskDepartment />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
// 任务管理 = 原[一次性任务 + 周期性任务 + 老板安排任务 + 项目部任务]四个独立菜单合并为一页四标签。
// 四者本是同一张 biz_task 表按 remark 前缀 A/B/D/C 切分,合并消除重叠菜单;复用现有四个组件,逻辑零改动。
// lazy 让非当前标签不预加载(避免多个 taskApi 一次性并发)。支持 ?tab= 直接定位(旧 once/periodic/boss/department 重定向带上)。
import TaskOnce from './once.vue'
import TaskPeriodic from './periodic.vue'
import TaskBoss from './boss.vue'
import TaskDepartment from './department.vue'

const route = useRoute()
const activeTab = ref(['once', 'periodic', 'boss', 'department'].includes(route.query.tab as string) ? (route.query.tab as string) : 'once')
</script>

<style scoped>
.task-center-page {
  padding: 16px;
}
.tc-head {
  margin-bottom: 8px;
}
.tc-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.tc-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.task-tabs :deep(.el-tabs__item) {
  font-size: 15px;
}
.tab-label {
  padding: 0 4px;
}
/* 内嵌的三个任务页各自有 .task-page 外壳,去掉其顶部多余留白,避免与标签栏叠加过高 */
.task-tabs :deep(.task-page) {
  padding-top: 8px;
}
</style>
