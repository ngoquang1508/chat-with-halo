import React, { useState } from "react";
import type { Conversation, Message } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "@/components/chat/UserAvatar";
import GroupChatAvatar from "@/components/chat/GroupChatAvatar";
import StatusBadge from "@/components/chat/StatusBadge";
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  Info,
  Pin,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface ChatHeaderProps {
  chat: Conversation;
  pinnedMessages?: Message[];
  onUnpin?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  pinnedMessages = [],
  onUnpin,
  onScrollToMessage,
  isInfoOpen,
  onToggleInfo,
}) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const { setActiveConversation } = useChatStore();
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);

  const isGroup = chat.type === "group";
  const otherUser = isGroup
    ? null
    : chat.participants.find((p) => p._id !== user?._id);

  const title = isGroup
    ? chat.group?.name || "Nhóm trò chuyện"
    : otherUser?.displayName || "Người dùng";

  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  const subtitle = isGroup
    ? `${chat.participants.length} thành viên`
    : isOnline
      ? "Đang hoạt động"
      : "Ngoại tuyến";

  const latestPinned = pinnedMessages[pinnedMessages.length - 1];

  const getSenderName = (senderId: string) => {
    const participant = chat.participants.find(
      (p) => p._id.toString() === senderId.toString(),
    );
    return participant?.displayName ?? "Người dùng";
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800">
      {/* Thanh Header chính */}
      <div className="flex items-center justify-between px-3 md:px-5 py-3 gap-2">
        {/* Nút quay lại (Dành cho Mobile) & Thông tin người nhận */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Nút Back trên Mobile */}
          <button
            type="button"
            onClick={() => setActiveConversation(null)}
            className="md:hidden flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 -ml-1 rounded-xl transition-colors"
          >
            <ChevronLeft className="size-5" />
            <span className="text-xs font-semibold hidden sm:inline">
              Trở lại
            </span>
          </button>

          {/* Avatar */}
          <div
            className="relative flex-shrink-0 cursor-pointer"
            onClick={onToggleInfo}
          >
            {isGroup ? (
              <GroupChatAvatar participants={chat.participants} type="chat" />
            ) : (
              <div className="relative">
                <UserAvatar
                  type="chat"
                  name={title}
                  avatarUrl={otherUser?.avatarUrl ?? undefined}
                />
                <StatusBadge status={isOnline ? "online" : "offline"} />
              </div>
            )}
          </div>

          {/* Tên & Trạng thái hoạt động */}
          <div
            className="flex flex-col min-w-0 cursor-pointer"
            onClick={onToggleInfo}
          >
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate">
                {title}
              </h2>
            </div>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Cụm nút công cụ: Search, Call, Video, Info */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
          {/* Nút tìm kiếm trong cuộc trò chuyện */}
          <button
            type="button"
            onClick={() => toast.info("Tìm kiếm tin nhắn đang được phát triển")}
            title="Tìm kiếm trong cuộc trò chuyện"
            className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="size-4.5" />
          </button>

          {/* Nút gọi thoại */}
          <button
            type="button"
            onClick={() => toast.info("Tính năng cuộc gọi thoại sắp ra mắt!")}
            title="Cuộc gọi thoại"
            className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Phone className="size-4.5" />
          </button>

          {/* Nút gọi video */}
          <button
            type="button"
            onClick={() => toast.info("Tính năng cuộc gọi video sắp ra mắt!")}
            title="Cuộc gọi video"
            className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Video className="size-4.5" />
          </button>

          {/* Nút mở Cột thông tin bên phải (Toggle Info Panel) */}
          <button
            type="button"
            onClick={onToggleInfo}
            title="Thông tin hội thoại"
            className={`size-9 rounded-xl flex items-center justify-center transition-all ${
              isInfoOpen
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#5865F2] font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Info className="size-4.5" />
          </button>
        </div>
      </div>

      {/* Khu vực hiển thị tin nhắn ghim (Pinned Messages) */}
      {latestPinned && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-1.5 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between text-xs">
          <div
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
            onClick={() => onScrollToMessage?.(latestPinned._id)}
          >
            <Pin className="size-3.5 text-[#5865F2] flex-shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">
              {getSenderName(latestPinned.senderId)}:
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {latestPinned.content || "[Hình ảnh/Tệp]"}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {pinnedMessages.length > 1 && (
              <button
                type="button"
                onClick={() => setIsPinnedListOpen(!isPinnedListOpen)}
                className="text-[11px] text-[#5865F2] font-medium hover:underline flex items-center gap-0.5"
              >
                <span>+{pinnedMessages.length - 1} khác</span>
                {isPinnedListOpen ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
            )}
            {onUnpin && (
              <button
                type="button"
                onClick={() => onUnpin(latestPinned._id)}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title="Bỏ ghim"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
