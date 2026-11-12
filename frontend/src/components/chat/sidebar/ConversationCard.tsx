import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { formatOnlineTime } from "@/lib/utils";
import UserAvatar from "@/components/common/UserAvatar";
import GroupChatAvatar from "@/components/common/GroupChatAvatar";
import StatusBadge from "@/components/common/StatusBadge";
import { BellOff } from "lucide-react";
import { isMuted } from "@/lib/notification";

interface ConversationCardProps {
  convo: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onOpenInfo?: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  convo,
  isActive,
  onSelect,
}) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();

  if (!user) return null;

  const isGroup = convo.type === "group";
  const otherUser = isGroup
    ? null
    : convo.participants.find((p) => p._id !== user._id);

  const title = isGroup
    ? convo.group?.name || "Nhóm trò chuyện"
    : otherUser?.displayName || "Người dùng";

  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  const unreadCount = convo.unreadCounts?.[user._id] || 0;
  const isConvoMuted = isMuted(convo);

  // Xử lý nội dung tin nhắn cuối cùng
  const lastMsg = convo.lastMessage;
  let lastMessageText = "Chưa có tin nhắn nào.";
  if (lastMsg) {
    if (lastMsg.isRecalled) {
      lastMessageText =
        lastMsg.sender?._id === user._id
          ? "Bạn đã thu hồi tin nhắn"
          : "Tin nhắn đã bị thu hồi";
    } else if (lastMsg.sender?._id === user._id) {
      lastMessageText = `Bạn: ${lastMsg.content || "[Hình ảnh/Tệp]"}`;
    } else {
      lastMessageText = `${isGroup && lastMsg.sender?.displayName ? `${lastMsg.sender.displayName}: ` : ""}${lastMsg.content || "[Hình ảnh/Tệp]"}`;
    }
  }

  const timestamp = lastMsg?.createdAt
    ? new Date(lastMsg.createdAt)
    : undefined;

  return (
    <>
      <div
        onClick={() => onSelect(convo._id)}
        className={`group relative flex items-center justify-between p-3 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
          isActive
            ? "bg-white dark:bg-slate-800 shadow-sm border-1 border-indigo-200/80 dark:border-indigo-800/80"
            : "hover:bg-white/80 dark:hover:bg-slate-800/60 border border-transparent"
        }`}
      >
        {/* Phần bên trái: Avatar kèm dot online */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            {isGroup ? (
              <GroupChatAvatar
                participants={convo.participants}
                type="sidebar"
              />
            ) : (
              <div className="relative">
                <UserAvatar
                  type="sidebar"
                  name={title}
                  avatarUrl={otherUser?.avatarUrl ?? undefined}
                />
                <StatusBadge status={isOnline ? "online" : "offline"} />
              </div>
            )}
          </div>

          {/* Phần giữa: Tên & Tin nhắn cuối */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span
                className={`font-semibold text-sm truncate ${
                  isActive
                    ? "text-[#5865F2] dark:text-indigo-400"
                    : "text-slate-800 dark:text-slate-100"
                }`}
              >
                {title}
              </span>
              {/* Hiển thị số tin nhắn chưa đọc hoặc icon tắt chuông */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isConvoMuted && (
                  <BellOff className="size-3.5 text-slate-400" />
                )}
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-xs truncate max-w-[190px] ${
                  unreadCount > 0
                    ? "font-bold text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {lastMessageText}
              </p>

              {/* Thời gian tin nhắn cuối */}
              {timestamp && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex-shrink-0">
                  {formatOnlineTime(timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
