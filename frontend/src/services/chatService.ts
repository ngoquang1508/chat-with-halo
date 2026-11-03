import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 10;

export const chatService = {
  async fetchConversationById(convoId: string) {
    const res = await api.get(`/conversations/${convoId}`);
    return res.data.conversation;
  },

  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
    replyTo?: string | null,
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
      replyTo,
    });

    return res.data.message;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
    replyTo?: string | null,
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
      replyTo,
    });
    return res.data.message;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },

  async hideConversation(convoId: string) {
    const res = await api.patch(`/conversations/${convoId}/hide`);
    return res.data.message;
  },

  async leaveConversation(convoId: string) {
    const res = await api.patch(`/conversations/${convoId}/leave`);
    return res.data.message;
  },

  async muteConversation(convoId: string, mutedUntil: Date | null = null) {
    const res = await api.patch(`/conversations/${convoId}/mute`, {
      mutedUntil,
    });
    return res.data; // { message, muted: bool }
  },

  async getPinnedMessages(convoId: string): Promise<Message[]> {
    const res = await api.get(`/conversations/${convoId}/pinned-messages`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async pinMessage(messageId: string) {
    const res = await api.put(`/messages/${messageId}/pin`);
    return res.data;
  },

  async unpinMessage(messageId: string) {
    const res = await api.put(`/messages/${messageId}/unpin`);
    return res.data;
  },

  async hideMessage(messageId: string) {
    const res = await api.put(`/messages/${messageId}/hide`);
    return res.data;
  },

  async recallMessage(messageId: string) {
    const res = await api.put(`/messages/${messageId}/recall`);
    return res.data;
  },
};
