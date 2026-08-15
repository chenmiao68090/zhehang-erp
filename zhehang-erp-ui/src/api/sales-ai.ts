import { post } from './request'
import type { SalesConsoleQuery } from './sales-console'

export interface SalesAiCitation {
  type: string
  id?: number | null
  label: string
  occurredAt?: string | null
  route?: string
}

export interface SalesAiDraftRequest {
  leadId: number
  callRecordId?: number
  platformCallId?: string
  connected?: 0 | 1
  result?: string
  userNote?: string
}

export interface SalesAiDraft {
  draftId: string
  available: boolean
  message: string
  provider: string
  promptVersion: string
  generatedAt: string
  dataTime?: string
  transcriptionStatus: 'not_requested' | 'missing' | 'unavailable' | 'failed' | 'ready'
  transcriptionExcerpt?: string
  summary?: string
  demand?: string
  budget?: string
  decisionMaker?: string
  objections: string[]
  commitments: string[]
  intentLevel?: string
  intentReason?: string
  confidence: number
  nextActionType?: string
  nextActionTime?: string
  nextActionContent?: string
  recommendedMaterials: string[]
  callbackScript?: string
  riskSignals: string[]
  citations: SalesAiCitation[]
}

export interface SalesAiManagementInsight {
  insightId: string
  available: boolean
  message: string
  provider: string
  promptVersion: string
  generatedAt: string
  scopeLabel: string
  dataRange: string
  summary?: string
  highlights: string[]
  risks: string[]
  coaching: string[]
  commonObjections: string[]
  sourceQuality?: string
  confidence: number
  citations: SalesAiCitation[]
}

export function generateSalesFollowDraft(data: SalesAiDraftRequest) {
  return post<{ data: SalesAiDraft }>('/crm/sales-ai/follow-draft', data, { silentError: true })
}

export function generateSalesManagementInsight(query: SalesConsoleQuery) {
  return post<{ data: SalesAiManagementInsight }>('/crm/sales-ai/management-insight', { query }, { silentError: true })
}

export function submitSalesAiFeedback(data: {
  draftId: string
  useful?: boolean
  adopted?: boolean
  reasonCode?: '' | 'FACT_ERROR' | 'NOT_RELEVANT' | 'TOO_GENERIC' | 'MISSING_CONTEXT' | 'OTHER'
}) {
  return post('/crm/sales-ai/feedback', data, { silentError: true })
}
