import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";
import type { Conversation, Message } from "@/types/chat";
import { toast } from "sonner";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},

      activeConversationId: null,
      convoLoading: false, // convo loading
      messageLoading: false,
      pinnedMessages: [],
      loading: false,
      replyingTo: null,

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversationById: async (convoId: string) => {
        try {
          const conversation = await chatService.fetchConversationById(convoId);
          set((state) => {
            const exists = state.conversations.some(
              (c) => c._id === conversation._id,
            );
            return {
              conversations: exists
                ? state.conversations
                : [conversation, ...state.conversations],
            };
          });
        } catch (error) {
          console.error("Lỗi khi fetchConversationById:", error);
        }
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations:", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;
        if (!convoId) return;

        const current = messages?.[convoId];

        // Chỉ chặn khi đã có tin VÀ không còn trang nào nữa
        if (current && current.nextCursor === null) return;

        const nextCursor = current?.nextCursor ?? "";

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged = [...processed, ...prev].filter(
              (msg, index, self) =>
                index === self.findIndex((m) => m._id === msg._id),
            );

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl, replyTo) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            replyTo,
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
            replyingTo: null,
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl, replyTo) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl, replyTo);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
            replyingTo: null,
          }));
        } catch (error) {
          console.error("Lỗi xảy ra gửi group message", error);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy khi ra add message:", error);
        }
      },
      updateConversation: (conversation: Conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );

          if (!convo) {
            return;
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }

          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi markAsSeen trong store", error);
        }
      },
      addConvo: (convo) => {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString(),
          );

          return {
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );

          const existing = get().conversations.find(
            (c) => c._id === conversation._id,
          );

          if (existing) {
            get().fetchConversationById(conversation._id);
          } else {
            get().addConvo(conversation);
          }

          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "Lỗi xảy ra khi gọi createConversation trong store",
            error,
          );
        } finally {
          set({ loading: false });
        }
      },
      hideConversation: async (convoId) => {
        try {
          set({ loading: true });

          await chatService.hideConversation(convoId);

          set((state) => ({
            conversations: state.conversations.filter((c) => c._id !== convoId),
            activeConversationId:
              state.activeConversationId === convoId
                ? null
                : state.activeConversationId,
          }));

          toast.info("Đã ẩn đoạn chat");
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi hideConversation: ", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
          set({ loading: false });
        }
      },
      leaveConversation: async (convoId) => {
        try {
          set({ loading: true });

          await chatService.leaveConversation(convoId);

          set((state) => ({
            conversations: state.conversations.filter((c) => c._id !== convoId),
            activeConversationId:
              state.activeConversationId === convoId
                ? null
                : state.activeConversationId,
          }));

          toast.info("Đã rời nhóm");
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi leaveConversation: ", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
          set({ loading: false });
        }
      },
      muteConversation: async (convoId, mutedUntil = null) => {
        try {
          set({ loading: true });
          const { muted } = await chatService.muteConversation(
            convoId,
            mutedUntil,
          );

          set((state) => ({
            conversations: state.conversations.map((c) => {
              if (c._id !== convoId) return c;
              const { user } = useAuthStore.getState();
              if (!user) return c;
              return {
                ...c,
                mutedBy: muted
                  ? [
                      ...(c.mutedBy ?? []),
                      {
                        userId: user._id,
                        mutedUntil: mutedUntil?.toISOString() ?? null,
                      },
                    ]
                  : (c.mutedBy ?? []).filter((m) => m.userId !== user._id),
              };
            }),
          }));

          toast.success(muted ? "Đã tắt thông báo" : "Đã bật thông báo");
        } catch (error) {
          console.error("Lỗi khi muteConversation:", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
          set({ loading: false });
        }
      },
      fetchPinnedMessages: async (convoId: string) => {
        try {
          const messages = await chatService.getPinnedMessages(convoId);
          set({ pinnedMessages: messages });
        } catch (error) {
          console.error("Lỗi khi fetch tin nhắn ghim", error);
          set({ pinnedMessages: [] });
        }
      },
      pinMessage: async (message: Message) => {
        try {
          // Kiểm tra đã ghim chưa
          const alreadyPinned = get().pinnedMessages.some(
            (m) => m._id === message._id,
          );
          if (alreadyPinned) {
            toast.info("Tin nhắn này đã được ghim rồi.");
            return;
          }

          await chatService.pinMessage(message._id);
          toast.success("Ghim tin nhắn thành công!");
        } catch (error) {
          console.error("Lỗi khi ghim tin nhắn", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      },
      unpinMessage: async (messageId: string) => {
        try {
          await chatService.unpinMessage(messageId);
          toast.success("Bỏ ghim tin nhắn thành công!");
        } catch (error) {
          console.error("Lỗi khi bỏ ghim tin nhắn", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      },
      hideMessage: async (messageId: string, conversationId: string) => {
        try {
          await chatService.hideMessage(messageId);
          // Xóa khỏi local state
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: {
                ...state.messages[conversationId],
                items: state.messages[conversationId].items.filter(
                  (m) => m._id !== messageId,
                ),
              },
            },
          }));
        } catch (error) {
          console.error("Lỗi khi ẩn tin nhắn", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      },
      recallMessage: async (messageId: string) => {
        try {
          await chatService.recallMessage(messageId);

          set((state) => {
            const updated = { ...state.messages };
            let updatedConversations = [...state.conversations];

            for (const convoId in updated) {
              const items = updated[convoId].items;
              const exists = items.some((m) => m._id === messageId);

              if (exists) {
                updated[convoId] = {
                  ...updated[convoId],
                  items: items.map((m) =>
                    m._id === messageId
                      ? { ...m, isRecalled: true, content: null }
                      : m,
                  ),
                };

                // Cập nhật lastMessage nếu tin bị thu hồi là tin cuối
                updatedConversations = updatedConversations.map((c) => {
                  if (c._id !== convoId) return c;
                  if (c.lastMessage?._id !== messageId) return c;
                  return {
                    ...c,
                    lastMessage: {
                      ...c.lastMessage,
                      content: null,
                      isRecalled: true,
                    },
                  };
                });

                break;
              }
            }

            return {
              messages: updated,
              conversations: updatedConversations,
            };
          });
        } catch (error) {
          console.error("Lỗi khi thu hồi tin nhắn", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      },
      setReplyingTo: (message) => set({ replyingTo: message }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
