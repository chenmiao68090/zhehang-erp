import { get, post } from './request'

/** 平台运营指标 */
export interface OpChannelMetric {
  id?: number
  platform: string
  /** 数据类别:overview概览/live直播/video短视频/message私信留资/note笔记 等;不传=overview(兼容旧数据) */
  category?: string
  statDate: string
  views?: number
  visits?: number
  inquiries?: number
  adCost?: number
  source?: string
  /** 该类别下的灵活指标 KV 的 JSON 字符串,如 '{"场次":12,"时长":320}' */
  metrics?: string
  remark?: string
}

/** recent 可选过滤:平台 / 类别(都不传=拉全表,兼容旧 channel-data) */
export interface OpMetricQuery {
  days?: number
  platform?: string
  category?: string
}

export const opMetricApi = {
  /** 最近 N 天各平台指标;可按 platform / category 过滤 */
  recent: (arg: number | OpMetricQuery = 30) => {
    const params = typeof arg === 'number' ? { days: arg } : { days: 30, ...arg }
    return get('/op/channel-metric/recent', params)
  },
  /** 录入/更新某平台某天某类别指标 */
  save: (data: OpChannelMetric) => post('/op/channel-metric/save', data),
  /** 触发某平台接口同步(未配置凭证时返回"待接入") */
  sync: (platform: string) => post(`/op/channel-metric/sync/${platform}`, {}, { silentError: true })
}
