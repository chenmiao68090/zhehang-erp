import { get, post } from './request'

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

/** 聊天历史项 */
export interface AiChatHistoryItem {
  id: string
  title: string
  lastMessage: string
  updateTime: string
}

/** 发送聊天消息 */
export function sendChat(data: AiChatRequest) {
  return post<{ data: AiChatResponse }>('/ai/chat', data)
}

/** 获取聊天历史列表 */
export function getChatHistory() {
  return get<{ data: AiChatHistoryItem[] }>('/ai/chat/history')
}
