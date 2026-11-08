import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { isMuted, showNotification } from "@/lib/notification";
import { useFriendStore } from "@/stores/useFriendStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Nhận lời mời kết bạn realtime
    socket.on("friend-request:received", (request) => {
      useFriendStore.getState().addReceivedRequest(request);
      showNotification(
        "Lời mời kết bạn",
        `${request.from.displayName} muốn kết bạn với bạn`,
      );
    });

    // Được chấp nhận kết bạn
    socket.on("friend-request:accepted", ({ displayName }) => {
      showNotification(
        "Kết bạn thành công",
        `${displayName} đã chấp nhận lời mời kết bạn`,
      );
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      const chatStore = useChatStore.getState();

      chatStore.addMessage(message);

      const updatedConversation = {
        ...conversation,
        unreadCounts,
      };

      if (chatStore.activeConversationId === message.conversationId) {
        chatStore.markAsSeen();
      }

      // Hiện lại conversation nếu đang bị ẩn
      const exists = chatStore.conversations.some(
        (c) => c._id === message.conversationId,
      );
      if (!exists) {
        chatStore.fetchConversationById(message.conversationId);
      } else {
        chatStore.updateConversation(updatedConversation);
      }

      // notification
      const fullConvo = chatStore.conversations.find(
        (c) => c._id === message.conversationId,
      );
      if (fullConvo && !isMuted(fullConvo)) {
        const senderName =
          conversation.lastMessage.sender.displayName ?? "Tin nhắn mới";
        const body = message.content || "Đã gửi một ảnh";
        showNotification(senderName, body);
      }
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // show conversation
    socket.on("show-conversation", ({ conversationId }) => {
      const chatStore = useChatStore.getState();
      const exists = chatStore.conversations.some(
        (c) => c._id === conversationId,
      );
      if (!exists) {
        chatStore.fetchConversationById(conversationId);
      }
    });

    socket.on(
      "message:recalled",
      ({ _id, conversationId }: { _id: string; conversationId: string }) => {
        useChatStore.setState((s) => {
          const currentConvo = s.messages[conversationId];
          const updatedMessages = currentConvo
            ? {
                ...s.messages,
                [conversationId]: {
                  ...currentConvo,
                  items: currentConvo.items.map((m) =>
                    m._id === _id
                      ? { ...m, isRecalled: true, content: null }
                      : m,
                  ),
                },
              }
            : s.messages;

          // Cập nhật lastMessage nếu tin bị thu hồi là tin cuối
          const updatedConversations = s.conversations.map((c) => {
            if (c._id !== conversationId) return c;
            if (c.lastMessage?._id !== _id) return c;
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                content: null,
                isRecalled: true,
              },
            };
          });

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          };
        });
      },
    );

    socket.on("message:pinned", (message) => {
      const { activeConversationId } = useChatStore.getState();
      if (message.conversationId !== activeConversationId) return;

      useChatStore.setState((state) => {
        const exists = state.pinnedMessages.some((m) => m._id === message._id);
        if (exists) return state;
        return {
          pinnedMessages: [...state.pinnedMessages, message],
        };
      });
    });

    socket.on("message:unpinned", ({ _id }: { _id: string }) => {
      useChatStore.setState((state) => ({
        pinnedMessages: state.pinnedMessages.filter((m) => m._id !== _id),
      }));
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
