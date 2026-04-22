import apiClient from '@/api/axiosConfig';

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /api/chat/sessions — requires Authorization header */
export async function getChatSessions(): Promise<ChatSession[]> {
  const { data } = await apiClient.get<any>('/chat/sessions');
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.sessions)
      ? data.sessions
      : [];
}

/** GET /api/chat/sessions/:id/messages — requires Authorization header */
export async function getChatSessionMessages(id: string): Promise<ChatMessage[]> {
  const { data } = await apiClient.get<any>(`/chat/sessions/${id}/messages`);
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.messages)
      ? data.messages
      : [];
}

/** POST /api/chat/sessions — requires Authorization header */
export async function createChatSession(title: string, language: string = 'en'): Promise<ChatSession> {
  const { data } = await apiClient.post<any>('/chat/sessions', { title, language });
  return (data?.session ?? data) as ChatSession;
}

/** DELETE /api/chat/sessions/:id — requires Authorization header */
export async function deleteChatSession(id: string): Promise<void> {
  await apiClient.delete(`/chat/sessions/${id}`);
}

/** POST /api/chat — send message to AI, requires Authorization header */
export async function sendChatMessage(sessionId: string, message: string, language: string = 'en'): Promise<any> {
  const { data } = await apiClient.post<any>('/chat', { sessionId, message, language });
  return data;
}
