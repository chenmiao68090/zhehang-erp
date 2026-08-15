import { get, post, put } from './request'

export type ConversationType = 'direct' | 'group' | 'department' | 'business' | 'announcement' | 'system'
export type MessageType = 'text' | 'image' | 'file' | 'forward' | 'system' | 'business' | 'task' | 'announcement'

export interface ImContact {
  userId: number
  name: string
  avatar?: string
  empCode?: string
  deptId?: number
  deptName?: string
  lastActiveAt?: string
  online: boolean
  memberRole?: 'owner' | 'admin' | 'member'
}

export interface ImConversation {
  id: number
  type: ConversationType
  name: string
  avatarUrl?: string
  ownerId?: number
  businessType?: string
  businessId?: number
  lastSeq: number
  lastReadSeq: number
  manualUnreadSeq: number
  lastMessageId?: number
  lastMessageAt?: string
  lastMessageText?: string
  lastMessageType?: string
  lastSenderName?: string
  unreadCount: number
  mentionCount: number
  importantCount: number
  memberCount: number
  pinned: boolean
  muted: boolean
  hidden: boolean
  notificationLevel: string
  draft?: string
  memberRole: string
  peerUserId?: number
  peerLastActiveAt?: string
  peerOnline: boolean
  canMentionAll: boolean
  canLeave: boolean
}

export interface ImAttachment {
  id: number
  messageId?: number
  originalName: string
  mimeType?: string
  fileSize: number
  image: boolean
  previewUrl?: string
  downloadUrl: string
  thumbnailUrl?: string
  createdAt: string
  progress?: number
  localUrl?: string
  failed?: boolean
}

export interface ImMention {
  userId: number
  name: string
  type: 'user' | 'all'
  read: boolean
}

export interface ImReactionGroup {
  code: string
  count: number
  reactedByMe: boolean
  userNames: string[]
}

export type ImTaskState = 'pending_accept' | 'in_progress' | 'pending_review' | 'completed' | 'rejected' | 'cancelled' | 'overdue'
export type ImTaskPriority = 'urgent' | 'important' | 'normal'

export interface ImTaskParticipant {
  taskId: number
  userId: number
  name: string
  avatar?: string
  deptId?: number
  deptName?: string
  role: 'responsible' | 'collaborator'
  status: 'assigned' | 'accepted' | 'completed'
}

export interface ImTaskTimeline {
  id: number
  operatorId: number
  operatorName: string
  actionType: string
  fromState?: string
  toState?: string
  comment?: string
  createdAt: string
}

export interface ImWorkTask {
  taskId: number
  conversationId: number
  sourceMessageId: number
  cardMessageId?: number
  title: string
  workflowState: Exclude<ImTaskState, 'overdue'>
  status: ImTaskState
  overdue: boolean
  priority: ImTaskPriority
  deptId?: number
  deptName?: string
  deadlineAt: string
  acceptanceStandard: string
  reminderRules: string[]
  customerId?: number
  businessType?: string
  businessId?: number
  creatorId: number
  creatorName: string
  reviewerId: number
  reviewerName: string
  resultText?: string
  rejectReason?: string
  acceptedAt?: string
  submittedAt?: string
  completedAt?: string
  cancelledAt?: string
  overdueAt?: string
  createdAt: string
  updatedAt: string
  participants: ImTaskParticipant[]
  resultAttachments: ImAttachment[]
  timeline: ImTaskTimeline[]
  canAccept: boolean
  canSubmit: boolean
  canReview: boolean
  canCancel: boolean
}

export interface ImTaskStats {
  pendingAccept: number
  inProgress: number
  pendingReview: number
  completed: number
  rejected: number
  overdue: number
}

export interface ImCreateTaskRequest {
  title: string
  responsibleIds: number[]
  collaboratorIds: number[]
  deptId?: number
  priority: ImTaskPriority
  deadlineAt: string
  reminderRules: string[]
  customerId?: number
  businessType?: string
  businessId?: number
  acceptanceStandard: string
}

export interface ImBusinessCard {
  eventId?: string
  eventType?: string
  title?: string
  businessType?: string
  businessId?: number
  currentStatus?: string
  responsibleId?: number
  responsibleName?: string
  operatorId?: number
  operatorName?: string
  occurredAt?: string
  requirement?: string
  actionLabel?: string
  actionUrl?: string
}

export interface ImMessage {
  id: number
  conversationId: number
  clientMessageId: string
  seq: number
  senderId: number
  senderName: string
  senderAvatar?: string
  messageType: MessageType
  text: string
  status: 'sending' | 'sent' | 'recalled' | 'failed'
  important: boolean
  edited: boolean
  recalled: boolean
  createdAt: string
  mine: boolean
  favorite: boolean
  replyTo?: { id: number; senderId: number; senderName: string; text: string; status: string }
  forwardedFrom?: { messageId: number; conversationId: number; senderId: number; senderName: string; conversationName: string }
  attachments: ImAttachment[]
  mentions: ImMention[]
  reactions: ImReactionGroup[]
  readCount: number
  deliveredCount: number
  unreadCount: number
  task?: ImWorkTask
  business?: ImBusinessCard
  error?: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor?: string
  hasMore: boolean
}

export interface ImUnreadSummary {
  badgeCount: number
  totalUnread: number
  mentionUnread: number
  unreadConversations: number
}

export interface ImPreference {
  browserNotification: boolean
  soundEnabled: boolean
  desktopEnabled: boolean
}

export const imApi = {
  summary: () => get<{ code: number; data: ImUnreadSummary }>('/im/summary'),
  contacts: (params?: { keyword?: string; limit?: number }) => get<{ code: number; data: ImContact[] }>('/im/contacts', params),
  conversations: (params?: { filter?: string; keyword?: string; cursor?: string; pageSize?: number }) =>
    get<{ code: number; data: CursorPage<ImConversation> }>('/im/conversations', params),
  conversation: (id: number) => get<{ code: number; data: ImConversation }>(`/im/conversations/${id}`),
  createDirect: (userId: number) => post<{ code: number; data: ImConversation }>('/im/conversations/direct', { userId }),
  createGroup: (data: { name: string; memberIds: number[] }) =>
    post<{ code: number; data: ImConversation }>('/im/conversations/group', data),
  members: (id: number) => get<{ code: number; data: ImContact[] }>(`/im/conversations/${id}/members`),
  addMembers: (id: number, userIds: number[]) => post(`/im/conversations/${id}/members`, { userIds }),
  leave: (id: number) => post(`/im/conversations/${id}/leave`),
  settings: (id: number, data: Record<string, unknown>) => put(`/im/conversations/${id}/settings`, data),
  messages: (id: number, params?: { beforeSeq?: number; afterSeq?: number; pageSize?: number }) =>
    get<{ code: number; data: CursorPage<ImMessage> }>(`/im/conversations/${id}/messages`, params),
  searchMessages: (id: number, params: { keyword: string; beforeSeq?: number; pageSize?: number }) =>
    get<{ code: number; data: CursorPage<ImMessage> }>(`/im/conversations/${id}/messages/search`, params),
  send: (id: number, data: Record<string, unknown>) =>
    post<{ code: number; data: ImMessage }>(`/im/conversations/${id}/messages`, data),
  message: (id: number) => get<{ code: number; data: ImMessage }>(`/im/messages/${id}`),
  read: (id: number, seq: number) => put(`/im/conversations/${id}/read`, { seq }),
  delivered: (id: number, seq: number) => put(`/im/conversations/${id}/delivered`, { seq }),
  edit: (id: number, text: string) => put<{ code: number; data: ImMessage }>(`/im/messages/${id}`, { text }),
  recall: (id: number) => post(`/im/messages/${id}/recall`),
  reaction: (id: number, reactionCode: string) => post(`/im/messages/${id}/reaction`, { reactionCode }),
  favorite: (id: number) => post(`/im/messages/${id}/favorite`),
  important: (id: number) => post(`/im/messages/${id}/important`),
  receipt: (id: number) => get(`/im/messages/${id}/receipt`),
  createTask: (messageId: number, data: ImCreateTaskRequest) =>
    post<{ code: number; data: ImWorkTask }>(`/im/messages/${messageId}/tasks`, data),
  tasks: (params?: { scope?: string; state?: string; cursor?: string; pageSize?: number }) =>
    get<{ code: number; data: CursorPage<ImWorkTask> }>('/im/tasks', params),
  taskStats: (scope = 'all_mine') => get<{ code: number; data: ImTaskStats }>('/im/tasks/stats', { scope }),
  taskDetail: (id: number) => get<{ code: number; data: ImWorkTask }>(`/im/tasks/${id}`),
  acceptTask: (id: number) => post<{ code: number; data: ImWorkTask }>(`/im/tasks/${id}/accept`),
  submitTask: (id: number, data: { result: string; attachmentIds?: number[] }) =>
    post<{ code: number; data: ImWorkTask }>(`/im/tasks/${id}/submit`, data),
  uploadTaskAttachment: (id: number, file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return post<{ code: number; data: ImAttachment }>(`/im/tasks/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
  },
  reviewTask: (id: number, data: { pass: boolean; comment?: string }) =>
    post<{ code: number; data: ImWorkTask }>(`/im/tasks/${id}/review`, data),
  cancelTask: (id: number, reason: string) =>
    post<{ code: number; data: ImWorkTask }>(`/im/tasks/${id}/cancel`, { reason }),
  preference: () => get<{ code: number; data: ImPreference }>('/im/preferences'),
  updatePreference: (data: Partial<ImPreference>) => put<{ code: number; data: ImPreference }>('/im/preferences', data),
  realtimeTicket: () => post<{ code: number; data: { ticket: string; expiresIn: number; webSocketPath: string } }>('/im/realtime/ticket'),
  uploadAttachment: (conversationId: number, file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData()
    form.append('conversationId', String(conversationId))
    form.append('file', file)
    return post<{ code: number; data: ImAttachment }>('/im/attachments/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
  },
  attachmentBlob: (id: number, thumbnail = false) =>
    get<Blob>(`/im/attachments/${id}/${thumbnail ? 'thumbnail' : 'inline'}`, undefined, { responseType: 'blob' }),
  downloadAttachment: (id: number) =>
    get<Blob>(`/im/attachments/${id}/download`, undefined, { responseType: 'blob' })
}
