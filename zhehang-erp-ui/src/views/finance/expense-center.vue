<template>
  <div class="page-container expense-center-page">
    <header class="ec-head">
      <div>
        <h2 class="ec-title">支出中心</h2>
        <p class="ec-sub">报销、业务支出、备用金 三类支出单据统一入口</p>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="ec-tabs">
      <el-tab-pane name="reimburse" lazy>
        <template #label><span class="tab-label">报销管理</span></template>
        <Reimburse />
      </el-tab-pane>
      <el-tab-pane name="expense" lazy>
        <template #label><span class="tab-label">业务支出</span></template>
        <Expense />
      </el-tab-pane>
      <el-tab-pane name="petty-cash" lazy>
        <template #label><span class="tab-label">备用金</span></template>
        <PettyCash />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
// 支出中心 = 原[报销管理 + 业务支出管理 + 备用金管理]三个独立菜单合并为一页三标签。
// 三者都是"金额 + 审批流 + 付款"同构的支出单据,合并消除重叠菜单;复用现有三个组件,逻辑零改动。
// lazy 让非当前标签不预加载。支持 ?tab= 直接定位(旧 reimburse/expense/petty-cash 重定向带上)。
import Reimburse from './reimburse.vue'
import Expense from './expense.vue'
import PettyCash from './petty-cash.vue'

const route = useRoute()
const activeTab = ref(['reimburse', 'expense', 'petty-cash'].includes(route.query.tab as string) ? (route.query.tab as string) : 'reimburse')
</script>

<style scoped>
.expense-center-page {
  padding: 16px;
}
.ec-head {
  margin-bottom: 8px;
}
.ec-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.ec-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.ec-tabs :deep(.el-tabs__item) {
  font-size: 15px;
}
.tab-label {
  padding: 0 4px;
}
</style>
