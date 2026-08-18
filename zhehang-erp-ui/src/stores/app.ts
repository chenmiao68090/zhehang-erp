import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(getStorage('sidebarCollapsed') === 'true')
  const isDark = ref<boolean>(getStorage('isDark') === 'true')
  const language = ref<string>(getStorage('language') || 'zh-CN')
  const size = ref<'default' | 'small' | 'large'>(
    (getStorage('size') as 'default' | 'small' | 'large') || 'default'
  )
  const fontScale = ref<'standard' | 'large' | 'xlarge'>(
    (getStorage('fontScale') as 'standard' | 'large' | 'xlarge') || 'standard'
  )

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    setStorage('sidebarCollapsed', String(sidebarCollapsed.value))
  }

  function toggleDark() {
    isDark.value = !isDark.value
    setStorage('isDark', String(isDark.value))
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function setLanguage(lang: string) {
    language.value = lang
    setStorage('language', lang)
  }

  function setSize(val: 'default' | 'small' | 'large') {
    size.value = val
    setStorage('size', val)
  }

  function applyFontScale(val: string) {
    if (val === 'standard') {
      document.documentElement.removeAttribute('data-font-size')
    } else {
      document.documentElement.setAttribute('data-font-size', val)
    }
  }

  function setFontScale(val: 'standard' | 'large' | 'xlarge') {
    fontScale.value = val
    setStorage('fontScale', val)
    applyFontScale(val)
  }

  document.documentElement.classList.toggle('dark', isDark.value)
  applyFontScale(fontScale.value)

  return {
    sidebarCollapsed,
    isDark,
    language,
    size,
    fontScale,
    toggleSidebar,
    toggleDark,
    setLanguage,
    setSize,
    setFontScale
  }
})
