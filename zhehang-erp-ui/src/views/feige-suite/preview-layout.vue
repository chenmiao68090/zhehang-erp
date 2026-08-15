<template>
  <div class="preview-shell">
    <header class="preview-topbar">
      <div class="brand"><span>ZH</span><div><strong>浙杭集团</strong><small>业务中心 · 本地完整验收</small></div></div>
      <div class="top-stats"><span><strong>9</strong>个业务中心</span><span><strong>55</strong>个真实子页面</span></div>
      <div class="warning"><el-icon><Warning /></el-icon>LOCAL-DEMO虚构数据，不连接生产</div>
    </header>
    <div class="preview-body">
      <aside class="sidebar">
        <el-scrollbar>
          <div class="sidebar-title">业务模块</div>
          <section v-for="group in groups" :key="group.code" class="menu-group">
            <button class="group-button" :class="{ active: currentGroup === group.code }" @click="toggle(group.code)">
              <span class="group-icon" :style="{ color: group.color, background: `${group.color}14` }"><el-icon><component :is="iconOf(group.icon)" /></el-icon></span>
              <strong>{{ group.title }}</strong><small>{{ pagesBy(group.code).length }}</small>
              <el-icon class="caret"><ArrowDown v-if="expanded.includes(group.code)" /><ArrowRight v-else /></el-icon>
            </button>
            <nav v-show="expanded.includes(group.code)">
              <router-link v-for="page in pagesBy(group.code)" :key="page.code" :to="`/local-preview/feige-suite/${page.group}/${page.code}?suitePreview=1`" :class="{ active: currentPage === page.code }">
                <span></span><el-icon><component :is="iconOf(page.icon)" /></el-icon><strong>{{ page.title }}</strong>
              </router-link>
            </nav>
          </section>
        </el-scrollbar>
      </aside>
      <main class="content">
        <div class="breadcrumb"><span>业务中心</span><el-icon><ArrowRight /></el-icon><span>{{ currentGroupTitle }}</span><el-icon><ArrowRight /></el-icon><strong>{{ route.meta.title }}</strong><em>旧路由：{{ route.meta.legacyPath || '-' }}</em></div>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as ElementIcons from '@element-plus/icons-vue'
import { ArrowDown, ArrowRight, Warning } from '@element-plus/icons-vue'
import { FEIGE_SUITE_GROUPS, pagesByGroup } from './catalog'
import type { FeigeSuiteGroupCode } from './types'

const route = useRoute()
const router = useRouter()
const groups = FEIGE_SUITE_GROUPS
const currentPage = computed(() => String(route.meta.pageCode || ''))
const currentGroup = computed(() => (route.path.split('/')[3] || 'learning') as FeigeSuiteGroupCode)
const currentGroupTitle = computed(() => groups.find((item) => item.code === currentGroup.value)?.title || '')
const expanded = ref<string[]>([currentGroup.value])

watch(currentGroup, (value) => { if (!expanded.value.includes(value)) expanded.value.push(value) })
function pagesBy(group: FeigeSuiteGroupCode) { return pagesByGroup(group) }
function iconOf(name: string) { return markRaw((ElementIcons as any)[name] || ElementIcons.Document) }
function toggle(code: FeigeSuiteGroupCode): void {
  if (expanded.value.includes(code)) expanded.value = expanded.value.filter((item) => item !== code)
  else { expanded.value.push(code); const first = pagesBy(code)[0]; if (first) router.push(`/local-preview/feige-suite/${code}/${first.code}?suitePreview=1`) }
}
</script>

<style scoped>
.preview-shell { width: 100vw; height: 100vh; overflow: hidden; color: #1e293b; background: #f5f7fa; }
.preview-topbar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 64px; padding: 0 22px; border-bottom: 1px solid #e2e8f0; background: #fff; box-sizing: border-box; }
.brand { display: flex; align-items: center; gap: 11px; }
.brand > span { display: grid; width: 38px; height: 38px; place-items: center; color: #fff; background: #1d4ed8; border-radius: 7px; font-weight: 800; }
.brand > div { display: flex; flex-direction: column; gap: 2px; }
.brand strong { font-size: 17px; }.brand small { color: #64748b; }
.top-stats { display: flex; gap: 28px; color: #64748b; font-size: 13px; }.top-stats strong { margin-right: 4px; color: #0f172a; font-size: 18px; }
.warning { justify-self: end; display: flex; align-items: center; gap: 7px; padding: 7px 11px; border: 1px solid #fed7aa; border-radius: 6px; color: #c2410c; background: #fff7ed; font-size: 13px; }
.preview-body { display: flex; height: calc(100vh - 64px); }
.sidebar { width: 252px; flex: 0 0 252px; border-right: 1px solid #e2e8f0; background: #fff; }
.sidebar-title { padding: 17px 17px 9px; color: #94a3b8; font-size: 12px; font-weight: 700; }
.menu-group { padding: 0 8px; }
.group-button { display: flex; width: 100%; min-height: 48px; align-items: center; gap: 10px; padding: 0 10px; border: 0; border-radius: 6px; color: #334155; background: transparent; cursor: pointer; text-align: left; }
.group-button:hover, .group-button.active { background: #f1f5f9; }
.group-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 5px; font-size: 17px; }
.group-button strong { flex: 1; font-size: 15px; }.group-button small { color: #94a3b8; }.caret { color: #94a3b8; }
nav { padding: 1px 0 6px 39px; }
nav a { position: relative; display: flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 9px; border-radius: 5px; color: #64748b; text-decoration: none; }
nav a > span { position: absolute; left: -12px; width: 1px; height: 100%; background: #e2e8f0; }
nav a:hover { color: #1d4ed8; background: #f8fafc; }nav a.active { color: #1d4ed8; background: #eff6ff; }
nav a.active > span { width: 2px; background: #2563eb; }nav a strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.content { flex: 1; min-width: 0; overflow-y: auto; }
.breadcrumb { display: flex; align-items: center; gap: 7px; height: 44px; padding: 0 24px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; background: #fff; box-sizing: border-box; font-size: 13px; }
.breadcrumb strong { color: #475569; }.breadcrumb em { margin-left: auto; overflow: hidden; max-width: 360px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 960px) { .sidebar { width: 72px; flex-basis: 72px; }.sidebar-title, .group-button strong, .group-button small, .caret, nav { display: none; }.group-button { justify-content: center; }.top-stats { display: none; }.preview-topbar { grid-template-columns: 1fr 1fr; } }
</style>
