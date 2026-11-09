import { useEffect, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import type { Message } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useChatScroll } from "@/hooks/useChatScroll";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import ChatEmptyState from "./ChatEmptyState";
import MessagesLoadingSkeleton from "@/components/skeleton/MessagesLoadingSkeleton";

interface ChatWindowBodyProps {
  onPin?: (message: Message) => void;
}

const ChatWindowBody = ({ onPin }: ChatWindowBodyProps) => {
  // Lấy dữ liệu từ store với các selector tối ưu
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const conversations = useChatStore((state) => state.conversations);
  const convoData = useChatStore((state) =>
    activeConversationId ? state.messages[activeConversationId] : undefined,
  );
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const messageLoading = useChatStore((state) => state.messageLoading);
  const { user } = useAuthStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");

  const messages = convoData?.items ?? [];
  const hasMore = convoData?.hasMore ?? false;
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );
  const unreadCount = selectedConvo?.unreadCounts?.[user?._id ?? ""] ?? 0;

  // Cập nhật trạng thái đã xem (seen status) của tin nhắn cuối
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) return;
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // Hook quản lý toàn bộ cơ chế cuộn mượt và giữ vị trí cuộn
  const {
    containerRef,
    showScrollBtn,
    scrollToBottom,
    handleScroll,
    handleScrollToMessage,
  } = useChatScroll({
    messagesLength: messages.length,
    activeConversationId,
    unreadCount,
    hasMore,
    messageLoading,
    onLoadMore: () => fetchMessages(activeConversationId ?? undefined),
  });

  if (!selectedConvo) return <ChatWelcomeScreen />;

  if (!messages.length) {
    return selectedConvo.lastMessage && messageLoading ? (
      <MessagesLoadingSkeleton />
    ) : (
      <ChatEmptyState selectedConvo={selectedConvo} />
    );
  }

  return (
    <div className="pl-4 py-4 bg-primary-foreground h-full flex flex-col overflow-hidden relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full pr-2 overflow-y-auto overflow-x-hidden beautiful-scrollbar flex flex-col"
      >
        {/* Loading khi cuộn lên đỉnh để tải thêm tin cũ */}
        {hasMore && messageLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Danh sách tin nhắn */}
        {messages.map((message, index) => (
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            prevMessage={index > 0 ? messages[index - 1] : undefined}
            selectedConvo={selectedConvo}
            lastMessageStatus={lastMessageStatus}
            onPin={onPin}
            onScrollToMessage={handleScrollToMessage}
            data-message-item
          />
        ))}
      </div>

      {/* Nút cuộn nhanh xuống đáy khung chat */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-muted/60 backdrop-blur-sm text-muted-foreground hover:bg-muted/80 transition-all"
          title="Cuộn xuống tin nhắn mới nhất"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatWindowBody;
