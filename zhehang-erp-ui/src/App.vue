<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
    <Softphone />
    <CallPopup />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import Softphone from '@/components/call-center/Softphone.vue'
import CallPopup from '@/components/call-center/CallPopup.vue'

const appStore = useAppStore()

const locale = computed(() => {
  return appStore.language === 'zh-CN' ? zhCn : en
})

const size = computed(() => appStore.size)
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
