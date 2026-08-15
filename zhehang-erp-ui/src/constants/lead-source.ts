export interface LeadSourceOption {
  value: number
  label: string
  description: string
  platforms: string[]
}

export interface LeadImportSourceScene {
  key: string
  label: string
  description: string
  defaultSourceType: number
  platforms: string[]
  platformSourceTypes?: Record<string, number>
}

export type LeadImportSourceRequirement = 'platform' | 'detail' | 'either'

/**
 * CRM 线索一级来源唯一口径。
 * 具体渠道、广告平台或名单供应渠道继续写入 sourcePlatform，避免一级来源无限膨胀。
 */
export const LEAD_SOURCE_OPTIONS: readonly LeadSourceOption[] = [
  {
    value: 1,
    label: '工商公开名单',
    description: '工商公示、企业信息平台或园区企业名录',
    platforms: ['天眼查', '企查查', '爱企查', '国家企业信用信息公示系统', '园区工商名单']
  },
  {
    value: 2,
    label: '客户转介绍',
    description: '兼容原“老客户转介绍”来源码',
    platforms: ['客户转介绍', '员工转介绍']
  },
  {
    value: 3,
    label: '运营投流·美团',
    description: '兼容原“运营-美团”来源码',
    platforms: ['美团', '大众点评']
  },
  {
    value: 4,
    label: '运营投流·抖音',
    description: '兼容原“运营-抖音”来源码',
    platforms: ['抖音']
  },
  {
    value: 5,
    label: '线下来客',
    description: '上门咨询、地推、扫楼、展会等线下触点',
    platforms: ['上门咨询', '地推', '扫楼', '展会活动']
  },
  {
    value: 6,
    label: '运营投流·其他',
    description: '除美团、抖音外的广告、内容运营或官网咨询',
    platforms: ['小红书', '快手', '视频号', '高德导航', '百度', '微信广告', '官网', '其他投流']
  },
  {
    value: 7,
    label: '名单采购/电销',
    description: '采购名单、行业名录或专门用于外呼的客户名单',
    platforms: ['名单供应商', '行业名录', '展会名录', '电销外呼名单']
  },
  {
    value: 8,
    label: '渠道合作',
    description: '园区、商会、异业伙伴或其他合作渠道提供',
    platforms: ['渠道伙伴', '园区合作', '商会协会', '异业合作']
  },
  {
    value: 9,
    label: '私域/存量二次开发',
    description: '私域沉淀或存量业务二次开发；已签约客户不能重复进公海',
    platforms: ['微信私域', '公众号', '社群', '刻章二次开发', '存量客户二开']
  },
  {
    value: 10,
    label: '其他',
    description: '暂不属于上述类别的真实来源',
    platforms: ['其他', '未分类']
  }
] as const

/** 导入页只展示8个业务场景；运营投流按具体平台落到兼容的3/4/6来源码。 */
export const LEAD_IMPORT_SOURCE_SCENES: readonly LeadImportSourceScene[] = [
  {
    key: 'business-registry',
    label: '工商公开名单',
    description: '工商公示、企业信息平台或园区企业名录',
    defaultSourceType: 1,
    platforms: ['天眼查', '企查查', '爱企查', '国家企业信用信息公示系统', '园区工商名单']
  },
  {
    key: 'purchased-list',
    label: '名单采购/电销',
    description: '采购名单、行业名录或专门用于外呼的客户名单',
    defaultSourceType: 7,
    platforms: ['名单供应商', '行业名录', '展会名录', '电销外呼名单']
  },
  {
    key: 'operation',
    label: '运营投流',
    description: '广告、平台推广、内容运营或官网咨询形成的线索',
    defaultSourceType: 6,
    platforms: ['美团', '大众点评', '抖音', '小红书', '快手', '视频号', '高德导航', '百度', '微信广告', '官网', '其他投流'],
    platformSourceTypes: { 美团: 3, 大众点评: 3, 抖音: 4 }
  },
  {
    key: 'referral',
    label: '客户转介绍',
    description: '由现有客户或员工口碑推荐的新客户',
    defaultSourceType: 2,
    platforms: ['客户转介绍', '员工转介绍']
  },
  {
    key: 'channel',
    label: '渠道合作',
    description: '园区、商会、异业伙伴或其他合作渠道提供',
    defaultSourceType: 8,
    platforms: ['渠道伙伴', '园区合作', '商会协会', '异业合作']
  },
  {
    key: 'offline',
    label: '线下来客',
    description: '上门咨询、地推、扫楼、展会等线下触点',
    defaultSourceType: 5,
    platforms: ['上门咨询', '地推', '扫楼', '展会活动']
  },
  {
    key: 'private-domain',
    label: '私域/存量二次开发',
    description: '私域沉淀或存量业务二次开发；已签约客户不能重复进公海',
    defaultSourceType: 9,
    platforms: ['微信私域', '公众号', '社群', '刻章二次开发', '存量客户二开']
  },
  {
    key: 'other',
    label: '其他',
    description: '暂不属于上述类别的真实来源',
    defaultSourceType: 10,
    platforms: ['其他', '未分类']
  }
] as const

export function resolveLeadImportSourceType(scene: LeadImportSourceScene, platform?: string): number {
  if (scene.key === 'operation') {
    const platformName = String(platform || '').trim()
    if (platformName.includes('美团') || platformName.includes('大众点评')) return 3
    if (platformName.includes('抖音')) return 4
  }
  return scene.platformSourceTypes?.[platform || ''] || scene.defaultSourceType
}

/** 与后端导入合同一致：不同一级来源需要补齐可追溯的平台或来源说明。 */
export function getLeadImportSourceRequirement(sourceType?: number): LeadImportSourceRequirement | null {
  if ([1, 3, 4, 6].includes(Number(sourceType))) return 'platform'
  if ([7, 8, 10].includes(Number(sourceType))) return 'detail'
  if ([2, 5, 9].includes(Number(sourceType))) return 'either'
  return null
}

/** 历史表单不支持自由创建，因此中央选项必须持续兼容已录入的平台值。 */
const LEGACY_LEAD_SOURCE_PLATFORMS = ['闲鱼', '豆包', 'deepseek', '千问', '腾讯元宝']

export const LEAD_SOURCE_PLATFORM_OPTIONS = Array.from(
  new Set([...LEAD_SOURCE_OPTIONS.flatMap((item) => item.platforms), ...LEGACY_LEAD_SOURCE_PLATFORMS])
)

export function leadSourceLabel(source?: string | number | null, emptyLabel = '来源待补'): string {
  if (source === undefined || source === null || source === '') return emptyLabel
  const option = LEAD_SOURCE_OPTIONS.find((item) => item.value === Number(source))
  return option?.label || `来源${source}`
}

export function leadSourceTagType(source?: string | number | null): '' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<number, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    1: '',
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: 'info',
    6: 'warning',
    7: 'info',
    8: 'success',
    9: 'warning',
    10: 'info'
  }
  return map[Number(source)] || ''
}
