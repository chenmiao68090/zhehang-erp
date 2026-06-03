<template>
  <div class="main-layout">
    <Sidebar />
    <div class="main-content" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
      <Header />
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <AIAssistant />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import AIAssistant from '@/components/AIAssistant.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
  overflow: hidden;

  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: var(--bg-page);
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
</style>
