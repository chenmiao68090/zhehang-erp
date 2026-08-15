import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import crmZhCN from './crm-zh-CN'
import crmEnUS from './crm-en-US'
import hrmZhCN from './hrm-zh-CN'
import hrmEnUS from './hrm-en-US'
import bizZhCN from './biz-zh-CN'
import { getStorage } from '@/utils/storage'

const messages = {
  'zh-CN': { ...zhCN, ...crmZhCN, ...hrmZhCN, ...bizZhCN },
  'en-US': { ...enUS, ...crmEnUS, ...hrmEnUS }
}

export const i18n = createI18n({
  legacy: false,
  locale: getStorage('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n
