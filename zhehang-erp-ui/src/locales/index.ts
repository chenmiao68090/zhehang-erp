import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import crmZhCN from './crm-zh-CN'
import crmEnUS from './crm-en-US'
import hrmZhCN from './hrm-zh-CN'
import hrmEnUS from './hrm-en-US'
import salesZhCN from './sales-zh-CN'
import salesEnUS from './sales-en-US'
import multidimZhCN from './multidim-zh-CN'
import multidimEnUS from './multidim-en-US'
import ccZhCN from './cc-zh-CN'
import ccEnUS from './cc-en-US'
import acquisitionZhCN from './acquisition-zh-CN'
import acquisitionEnUS from './acquisition-en-US'
import { getStorage } from '@/utils/storage'

const messages = {
  'zh-CN': { ...zhCN, ...crmZhCN, ...hrmZhCN, ...salesZhCN, ...multidimZhCN, ...ccZhCN, ...acquisitionZhCN },
  'en-US': { ...enUS, ...crmEnUS, ...hrmEnUS, ...salesEnUS, ...multidimEnUS, ...ccEnUS, ...acquisitionEnUS }
}

export const i18n = createI18n({
  legacy: false,
  locale: getStorage('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n
