import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseChatScrollOptions {
  messagesLength: number;
  activeConversationId: string | null;
  unreadCount: number;
  hasMore: boolean;
  messageLoading: boolean;
  onLoadMore: () => Promise<void>;
}

// Hook quản lý toàn bộ logic cuộn trang tin nhắn:
// - Tự động cuộn xuống khi có tin nhắn mới
// - Khôi phục vị trí cuộn khi tải thêm tin nhắn cũ
// - Cuộn tới tin nhắn chưa đọc hoặc tin nhắn được ghim
// - Điều khiển hiển thị nút cuộn xuống đáy
export const useChatScroll = ({
  messagesLength,
  activeConversationId,
  unreadCount,
  hasMore,
  messageLoading,
  onLoadMore,
}: UseChatScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const hasScrolledInitialRef = useRef<string | null>(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Cuộn xuống đáy khung chat
  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  // Reset trạng thái cuộn khi người dùng chuyển sang cuộc trò chuyện khác
  useLayoutEffect(() => {
    hasScrolledInitialRef.current = null;
    isAtBottomRef.current = true;
    prevMessageCountRef.current = 0;
    prevScrollHeightRef.current = 0;
    setShowScrollBtn(false);
  }, [activeConversationId]);

  // Xử lý tự động cuộn và khôi phục vị trí cuộn khi danh sách tin nhắn thay đổi
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !activeConversationId) return;

    const prevCount = prevMessageCountRef.current;
    const newCount = messagesLength;

    if (newCount === 0) return;

    // Lần đầu tải tin nhắn của cuộc trò chuyện
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

    // Khi có thêm tin nhắn mới vào danh sách
    if (newCount > prevCount && prevCount > 0) {
      const addedCount = newCount - prevCount;

      if (addedCount === 1) {
        // Chỉ thêm 1 tin nhắn mới (vừa gửi/nhận) -> cuộn mượt xuống đáy nếu đang ở gần đáy
        if (isAtBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      } else {
        // Tải thêm trang tin nhắn cũ phía trên -> giữ nguyên vị trí cuộn hiện tại của người dùng
        const prevScrollHeight = prevScrollHeightRef.current;
        const newScrollHeight = container.scrollHeight;
        container.scrollTop =
          newScrollHeight - prevScrollHeight + container.scrollTop;
      }
    }

    prevMessageCountRef.current = newCount;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messagesLength, activeConversationId, unreadCount]);

  // Xử lý sự kiện người dùng cuộn khung chat
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isAtBottomRef.current = distanceFromBottom <= 50;

    // Hiển thị nút cuộn xuống khi người dùng cuộn cách đáy hơn 200px
    setShowScrollBtn(distanceFromBottom > 200);

    // Cuộn lên đỉnh -> tải thêm lịch sử tin nhắn cũ
    if (container.scrollTop === 0 && hasMore && !messageLoading) {
      prevScrollHeightRef.current = container.scrollHeight;
      onLoadMore();
    }
  };

  // Cuộn đến một tin nhắn cụ thể và tạo hiệu ứng nhấp nháy highlight
  const handleScrollToMessage = (messageId: string) => {
    const container = containerRef.current;
    if (!container) return;

    const targetEl = container.querySelector(
      `[data-message-id="${messageId}"]`,
    ) as HTMLElement;

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      targetEl.classList.add("highlight-message");
      setTimeout(() => {
        targetEl.classList.remove("highlight-message");
      }, 2000);
    } else {
      toast.info("Tin nhắn đã quá cũ hoặc không còn tồn tại");
    }
  };

  return {
    containerRef,
    showScrollBtn,
    scrollToBottom,
    handleScroll,
    handleScrollToMessage,
  };
};

