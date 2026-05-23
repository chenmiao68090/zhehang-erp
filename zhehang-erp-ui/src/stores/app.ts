import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(getStorage('sidebarCollapsed') === 'true')
  // isDark 始终为 true（黑金主题固定深色模式）
  const isDark = ref<boolean>(true)
  const language = ref<string>(getStorage('language') || 'zh-CN')
  const size = ref<'default' | 'small' | 'large'>(
    (getStorage('size') as 'default' | 'small' | 'large') || 'default'
  )

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    setStorage('sidebarCollapsed', String(sidebarCollapsed.value))
  }

  function toggleDark() {
    // 黑金主题固定为深色模式，无需切换
  }

  function setLanguage(lang: string) {
    language.value = lang
    setStorage('language', lang)
  }

  function setSize(val: 'default' | 'small' | 'large') {
    size.value = val
    setStorage('size', val)
  }

  // 初始化时始终设置 dark class
  document.documentElement.classList.add('dark')

  return {
    sidebarCollapsed,
    isDark,
    language,
    size,
    toggleSidebar,
    toggleDark,
    setLanguage,
    setSize
  }
})
