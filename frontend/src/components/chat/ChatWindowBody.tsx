import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Message } from "@/types/chat";
import { toast } from "sonner";
import MessagesLoadingSkeleton from "@/components/skeleton/MessagesLoadingSkeleton";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";

interface ChatWindowBodyProps {
  onPin?: (message: Message) => void;
}

const ChatWindowBody = ({ onPin }: ChatWindowBodyProps) => {
  // Tối ưu selector Zustand: Chỉ lắng nghe dữ liệu cần thiết thay vì toàn bộ store
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const conversations = useChatStore((state) => state.conversations);
  const convoData = useChatStore((state) =>
    activeConversationId ? state.messages[activeConversationId] : undefined,
  );
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const messageLoading = useChatStore((state) => state.messageLoading);
  const sendDirectMessage = useChatStore((state) => state.sendDirectMessage);
  const sendGroupMessage = useChatStore((state) => state.sendGroupMessage);
  const { user } = useAuthStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showQuickGreetings, setShowQuickGreetings] = useState(true);
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);

  const messages = convoData?.items ?? [];
  const hasMore = convoData?.hasMore ?? false;
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );
  const unreadCount = selectedConvo?.unreadCounts?.[user?._id ?? ""] ?? 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const hasScrolledInitialRef = useRef<string | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  // seen status
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) return;
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // Reset khi đổi conversation
  useLayoutEffect(() => {
    hasScrolledInitialRef.current = null;
    isAtBottomRef.current = true;
    prevMessageCountRef.current = 0;
    prevScrollHeightRef.current = 0;
    setShowScrollBtn(false);
    setShowQuickGreetings(true);
  }, [activeConversationId]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !activeConversationId) return;

    const prevCount = prevMessageCountRef.current;
    const newCount = messages.length;

    if (newCount === 0) return;

    if (hasScrolledInitialRef.current !== activeConversationId) {
      requestAnimationFrame(() => {
        if (unreadCount > 0 && unreadCount < newCount) {
          const unreadIndex = newCount - unreadCount;
          const messageElements = container.querySelectorAll(
            "[data-message-item]",
          );
          const targetEl = messageElements[unreadIndex] as HTMLElement;

          if (targetEl) {
            targetEl.scrollIntoView({ block: "start" });
          } else {
            scrollToBottom("instant");
          }
        } else {
          scrollToBottom("instant");
        }

        hasScrolledInitialRef.current = activeConversationId;
      });

      prevMessageCountRef.current = newCount;
      prevScrollHeightRef.current = container.scrollHeight;
      return;
    }

    if (newCount > prevCount && prevCount > 0) {
      const addedCount = newCount - prevCount;

      if (addedCount === 1) {
        if (isAtBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      } else {
        const prevScrollHeight = prevScrollHeightRef.current;
        const newScrollHeight = container.scrollHeight;
        container.scrollTop =
          newScrollHeight - prevScrollHeight + container.scrollTop;
      }
    }

    prevMessageCountRef.current = newCount;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages.length, activeConversationId, unreadCount]);

  const fetchMoreMessages = async () => {
    const container = containerRef.current;
    if (!activeConversationId || !container || messageLoading) return;
    prevScrollHeightRef.current = container.scrollHeight;

    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xảy ra khi fetch thêm tin", error);
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isAtBottomRef.current = distanceFromBottom <= 50;

    // Hiện nút khi cách đáy hơn 200px
    setShowScrollBtn(distanceFromBottom > 200);

    if (container.scrollTop === 0 && hasMore && !messageLoading) {
      fetchMoreMessages();
    }
  };

  const handleScrollToMessage = (messageId: string) => {
    const container = containerRef.current;
    if (!container) return;

    // Tìm element dựa trên attribute data-message-id
    const targetEl = container.querySelector(
      `[data-message-id="${messageId}"]`,
    ) as HTMLElement;

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      // Hiệu ứng lóe sáng (Highlight) để người dùng dễ nhận biết
      targetEl.classList.add("highlight-message");
      setTimeout(() => {
        targetEl.classList.remove("highlight-message");
      }, 2000);
    } else {
      // Nếu không tìm thấy (có thể tin nhắn cũ quá chưa load)
      toast.info("Tin nhắn đã quá cũ hoặc không còn tồn tại");
    }
  };

  // Lấy thông tin người nhận (nếu chat 1-1) hoặc thông tin nhóm (nếu chat nhóm)
  const otherUser =
    selectedConvo?.type === "direct"
      ? selectedConvo.participants.find((p) => p._id !== user?._id)
      : null;
  const receiverName =
    selectedConvo?.type === "direct"
      ? (otherUser?.displayName ?? "Người dùng")
      : (selectedConvo?.group?.name ?? "Nhóm trò chuyện");

  // Gửi tin nhắn nhanh khi click vào các nút gợi ý chào hỏi
  const handleSendQuickGreeting = async (text: string) => {
    if (!selectedConvo || !user || isSendingQuickMessage) return;

    try {
      setIsSendingQuickMessage(true);
      if (selectedConvo.type === "direct") {
        if (!otherUser) return;
        await sendDirectMessage(otherUser._id, text);
      } else {
        await sendGroupMessage(selectedConvo._id, text);
      }
    } catch (error) {
      console.error("Lỗi khi gửi lời chào nhanh:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setIsSendingQuickMessage(false);
    }
  };

  if (!selectedConvo) return <ChatWelcomeScreen />;

  if (!messages?.length) {
    if (messageLoading) {
      return <MessagesLoadingSkeleton />;
    }

    return (
      <div className="flex flex-col h-full w-full justify-between items-center py-4 overflow-hidden">
        <div className="flex-1" />

        {/* Thông tin người nhận hiển thị ở giữa khung chat */}
        <div className="flex flex-col items-center justify-center gap-3 my-auto text-center">
          <div className="relative">
            {selectedConvo.type === "direct" ? (
              <>
                <UserAvatar
                  type="profile"
                  name={receiverName}
                  avatarUrl={otherUser?.avatarUrl ?? undefined}
                />
              </>
            ) : (
              <GroupChatAvatar
                participants={selectedConvo.participants}
                type="chat"
              />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-lg sm:text-xl text-foreground">
              {receiverName}
            </h3>
          </div>
        </div>

        {/* Khu vực gợi ý gửi lời chào nhanh */}
        <div className="flex-1 flex flex-col justify-end w-full">
          {showQuickGreetings && (
            <div className="w-full flex flex-col items-center gap-1">
              <Separator className="w-full opacity-60" />

              <div className="w-full flex justify-between items-center px-4">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Gửi lời chào
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQuickGreetings(false)}
                  className="size-7 rounded-full text-muted-foreground hover:!bg-transparent hover:text-foreground transition-colors"
                  title="Ẩn gợi ý"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap justify-start w-full px-4">
                {["Ê 👋", "Chào bạn!", "Xin chào!"].map((text) => (
                  <Button
                    key={text}
                    type="button"
                    variant="outline"
                    disabled={isSendingQuickMessage}
                    onClick={() => handleSendQuickGreeting(text)}
                    className="h-auto py-1.5 px-3.5 sm:px-4 text-xs sm:text-sm rounded-full border-border/80 bg-transparent text-foreground hover:bg-gray-800 hover:text-foreground active:scale-95 transition-all duration-200"
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pl-4 py-4 bg-primary-foreground h-full flex flex-col overflow-hidden relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full pr-2 overflow-y-auto overflow-x-hidden beautiful-scrollbar flex flex-col"
      >
        {hasMore && messageLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
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

      {/* Nút scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-muted/60 backdrop-blur-sm text-muted-foreground hover:bg-muted/80 transition-all"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatWindowBody;
