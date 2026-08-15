import { post } from './request'

/** AI 聊天请求 */
export interface AiChatRequest {
  message: string
  context?: string
  conversationId?: string
}

/** AI 聊天响应 */
export interface AiChatResponse {
  reply: string
  conversationId: string
}

/** 发送聊天消息 */
export function sendChat(data: AiChatRequest) {
  return post<{ data: AiChatResponse }>('/ai/chat', data)
}
