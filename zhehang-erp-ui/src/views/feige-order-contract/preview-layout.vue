<template>
  <div class="feige-preview-shell">
    <header class="preview-topbar"><div class="preview-brand"><span class="preview-logo">ZH</span><div><strong>浙杭集团</strong><small>订单与合同 · 本地验收</small></div></div><div class="preview-warning"><el-icon><Warning /></el-icon>LOCAL-DEMO 虚构数据，不连接生产</div></header>
    <div class="preview-body">
      <aside class="preview-sidebar"><div class="preview-module"><el-icon><DocumentChecked /></el-icon><div><strong>订单与合同</strong><small>独立模块</small></div></div><nav><router-link v-for="item in menus" :key="item.path" :to="`${base}/${item.path}?zhehangPreview=1`" :class="{ active: route.path.endsWith(`/${item.path}`) }"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span></router-link></nav><div class="preview-note">本入口仅用于本机验收<br />关闭服务后即不可访问</div></aside>
      <main class="preview-content"><div class="preview-breadcrumb">订单与合同 / {{ route.meta.title }}</div><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Document, DocumentChecked, List, RefreshLeft, Wallet, Warning, CircleCheck } from '@element-plus/icons-vue'
const route = useRoute(); const base = '/local-preview/feige-order-contract'
const menus = [{ path: 'orders', label: '订单管理', icon: List }, { path: 'new-order', label: '待财务审核', icon: CircleCheck }, { path: 'refunds', label: '退费订单', icon: RefreshLeft }, { path: 'unreceived', label: '未收款订单', icon: Wallet }, { path: 'contracts', label: '代理记账合同', icon: Document }]
</script>

<style scoped lang="scss">
.feige-preview-shell { width: 100vw; height: 100vh; overflow: hidden; color: #1f2937; background: #f4f6f9; }
.preview-topbar { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 24px; border-bottom: 1px solid #e5e7eb; background: #fff; }
.preview-brand { display: flex; align-items: center; gap: 12px; }.preview-brand > div { display: flex; flex-direction: column; gap: 2px; }.preview-brand strong { font-size: 17px; }.preview-brand small { color: #667085; font-size: 12px; }.preview-logo { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 7px; color: #fff; background: #155eef; font-weight: 800; }
.preview-warning { display: flex; align-items: center; gap: 7px; padding: 7px 11px; border: 1px solid #fedf89; border-radius: 6px; color: #b54708; background: #fffaeb; font-size: 13px; }
.preview-body { display: flex; height: calc(100vh - 64px); }.preview-sidebar { display: flex; flex-direction: column; width: 220px; border-right: 1px solid #e5e7eb; background: #fff; }.preview-module { display: flex; align-items: center; gap: 11px; margin: 16px 12px 10px; padding: 13px; border-radius: 7px; color: #0f766e; background: #effbf8; }.preview-module .el-icon { font-size: 22px; }.preview-module > div { display: flex; flex-direction: column; gap: 2px; }.preview-module small { color: #5e7772; }
nav { padding: 4px 10px; }nav a { display: flex; align-items: center; gap: 11px; min-height: 46px; margin: 3px 0; padding: 0 13px; border-radius: 6px; color: #475467; text-decoration: none; font-size: 15px; }nav a:hover { background: #f5f7fa; }nav a.active { color: #155eef; background: #eaf2ff; font-weight: 650; }nav .el-icon { font-size: 18px; }.preview-note { margin-top: auto; padding: 18px; color: #98a2b3; font-size: 12px; line-height: 1.7; }
.preview-content { flex: 1; min-width: 0; overflow-y: auto; }.preview-breadcrumb { height: 46px; padding: 13px 24px; border-bottom: 1px solid #e5e7eb; color: #667085; background: #fff; font-size: 14px; box-sizing: border-box; }
@media (max-width: 900px) { .preview-sidebar { width: 72px; }.preview-module > div, nav a span, .preview-note { display: none; }.preview-module { justify-content: center; padding: 12px 0; }nav a { justify-content: center; padding: 0; } }
</style>
