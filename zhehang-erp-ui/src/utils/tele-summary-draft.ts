export type TeleSummaryDraftValidity = 'active' | 'stale' | 'unknown'

export interface TeleSummaryDraftLeadSnapshot {
  id?: number | string | null
  ownerId?: number | string | null
  ownership?: string | null
  status?: number | string | null
}

/**
 * A saved call summary may only block the next call while its lead is still an
 * active private lead owned by the current salesperson. Unknown identity is
 * kept instead of discarded so a transient login/bootstrap issue cannot lose
 * an unfinished summary.
 */
export function evaluateTeleSummaryDraftLead(
  lead: TeleSummaryDraftLeadSnapshot | null | undefined,
  draftLeadId: number,
  currentUserId: number | null | undefined
): TeleSummaryDraftValidity {
  if (!Number.isFinite(draftLeadId) || draftLeadId <= 0) return 'active'
  if (!lead) return 'stale'

  const userId = Number(currentUserId)
  if (!Number.isFinite(userId) || userId <= 0) return 'unknown'

  const leadId = Number(lead.id)
  const ownerId = Number(lead.ownerId)
  const ownership = String(lead.ownership || '').toLowerCase()
  const status = Number(lead.status)

  if (leadId !== draftLeadId) return 'stale'
  if (ownership !== 'private') return 'stale'
  if (ownerId !== userId) return 'stale'
  if (![1, 2].includes(status)) return 'stale'
  return 'active'
}

export function isTeleSummaryDraftStaleError(error: unknown): boolean {
  const message = String((error as { message?: string } | null)?.message || '')
  return /无权限|不存在|已删除|已回收|已转交/.test(message)
}
