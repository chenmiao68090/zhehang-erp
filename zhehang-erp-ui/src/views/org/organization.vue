<template>
  <div class="page-container org-organization">
    <header class="org-head">
      <div>
        <h2 class="org-title">组织架构</h2>
        <p class="org-sub">部门、岗位与组织架构图统一管理</p>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="org-tabs">
      <!-- 架构图:一眼看全公司组织树(只读可视化) -->
      <el-tab-pane name="chart" lazy>
        <template #label><span class="tab-label">组织架构图</span></template>
        <OrgChart />
      </el-tab-pane>
      <!-- 部门管理:左部门树 + 右详情,增删改 -->
      <el-tab-pane name="dept" lazy>
        <template #label><span class="tab-label">部门管理</span></template>
        <DeptManage />
      </el-tab-pane>
      <!-- 岗位管理:岗位列表,增删改 -->
      <el-tab-pane name="post" lazy>
        <template #label><span class="tab-label">岗位管理</span></template>
        <PostManage />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
// 组织架构 = 原[组织架构图 + 部门管理 + 岗位管理]三个独立菜单合并为一页三标签。
// 复用现有三个组件,逻辑零改动;lazy 让非当前标签不预渲染,避免三个接口一次性并发。
import OrgChart from './structure.vue'
import DeptManage from './dept.vue'
import PostManage from './post.vue'

// 支持外部用 ?tab=dept 直接定位到某标签(旧 /hrm/dept、/hrm/post 重定向过来时带上)
const route = useRoute()
const activeTab = ref(['chart', 'dept', 'post'].includes(route.query.tab as string) ? (route.query.tab as string) : 'chart')
</script>

<style scoped>
.org-organization {
  padding: 16px;
}
.org-head {
  margin-bottom: 12px;
}
.org-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.org-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.org-tabs :deep(.el-tabs__item) {
  font-size: 15px;
}
.tab-label {
  padding: 0 4px;
}
/* 内嵌子页原本按整页高度(100vh-140px)布局,这里在标签内再留出标题/标签栏的空间 */
.org-tabs :deep(.dept-layout),
.org-tabs :deep(.structure-page) {
  height: calc(100vh - 260px);
}
.org-tabs :deep(.page-container) {
  padding: 0;
}
</style>
