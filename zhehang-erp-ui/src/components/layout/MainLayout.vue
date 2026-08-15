<template>
  <div
    class="main-layout"
    :class="{
      'is-message-layout': route.path.startsWith('/message'),
      'is-review-layout': route.path === '/business-review' || route.path.startsWith('/order/review'),
      'is-sales-console-layout': route.path === '/customer/perf-board',
      'is-offboarding-layout': route.path === '/sys-org/resigned-staff' || route.path === '/hrm/resigned-staff'
    }"
  >
    <TopNav />
    <ImpersonationBanner />
    <div class="ml-body">
      <Sidebar />
      <div class="main-content">
        <Header />
        <main class="content-area" :class="contentClasses">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
    <Watermark />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import Watermark from './Watermark.vue'
import ImpersonationBanner from '@/components/impersonation/ImpersonationBanner.vue'

const route = useRoute()
const contentClasses = computed(() => ({
  'sales-system': route.path.startsWith('/customer'),
  'message-system': route.path.startsWith('/message')
}))
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

.ml-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: var(--bg-page);
}

.content-area.message-system {
  padding: 0;
  overflow: hidden;
}

.fade-enter-active {
  animation: fadeSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-leave-to {
  opacity: 0;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .main-layout.is-message-layout,
  .main-layout.is-review-layout,
  .main-layout.is-sales-console-layout,
  .main-layout.is-offboarding-layout {
    :deep(.topnav),
    :deep(.sidebar),
    :deep(.header),
    :deep(.wm-badge) {
      display: none;
    }

    .main-content,
    .content-area {
      width: 100%;
      height: 100%;
    }

    .content-area {
      padding: 0;
    }
  }
}
</style>
