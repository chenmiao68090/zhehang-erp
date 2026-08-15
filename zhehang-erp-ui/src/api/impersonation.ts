import { get, post } from './request'

export interface ImpersonationCandidate {
  userId: number
  displayName: string
  deptId?: number
  deptName?: string
  roleNames: string[]
  roleKeys: string[]
  roleCount: number
  multipleRoles: boolean
}

export interface ImpersonationSessionView {
  active: boolean
  sessionId: string
  actorUserId: number
  targetUserId: number
  targetName: string
  targetDeptName?: string
  roleNames: string[]
  multipleRoles: boolean
  actorName: string
  startTime: string
  expireTime: string
  reason?: string
}

export interface ImpersonationStartResult extends Omit<ImpersonationSessionView, 'active'> {
  active?: boolean
  impersonationToken: string
}

export interface ImpersonationCandidateParams {
  keyword?: string
  deptId?: number
}

export const impersonationApi = {
  candidates: (params?: ImpersonationCandidateParams) =>
    get<{ data: ImpersonationCandidate[] }>('/system/impersonation/candidates', params),
  start: (data: { targetUserId: number; reason: string; tabId: string }) =>
    post<{ data: ImpersonationStartResult }>('/system/impersonation/start', data),
  current: () =>
    get<{ data: ImpersonationSessionView }>('/system/impersonation/current'),
  end: (reason = 'manual') =>
    post('/system/impersonation/end', { reason })
}
