import React from "react";
import { Bell, SquarePen } from "lucide-react";
import { useFriendStore } from "@/stores/useFriendStore";

interface ChatSidebarHeaderProps {
  onOpenCreateChat: () => void;
  onOpenFriendRequests: () => void;
}

export const ChatSidebarHeader: React.FC<ChatSidebarHeaderProps> = ({
  onOpenCreateChat,
  onOpenFriendRequests,
}) => {
  const { unreadRequestCount } = useFriendStore();

  return (
    <div className="flex flex-col gap-2 p-4 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tin nhắn
          </h2>
        </div>

        {/* Cụm nút công cụ*/}
        <div className="flex items-center gap-1.5">
          {/* Nút tạo tin nhắn mới */}
          <button
            type="button"
            onClick={onOpenCreateChat}
            title="Tạo tin nhắn mới"
            className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SquarePen className="size-4.5" />
          </button>

          {/* Nút thông báo lời mời kết bạn */}
          <button
            type="button"
            onClick={onOpenFriendRequests}
            title="Lời mời kết bạn"
            className="relative size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="size-4.5" />
            {unreadRequestCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
