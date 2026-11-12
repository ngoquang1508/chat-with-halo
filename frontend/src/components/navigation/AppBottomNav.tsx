import React from "react";
import { MessagesSquare, ContactRound, UsersRound } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { NavMobileTab } from "@/types/navigation";
import UserAvatar from "../chat/UserAvatar";

interface AppBottomNavProps {
  activeTab: NavMobileTab;
  onTabChange: (tab: NavMobileTab) => void;
}

/**
 * Thanh điều hướng đáy màn hình dành riêng cho thiết bị Di Động (Mobile)
 * Responsive hiển thị cố định ở chân trang khi dùng trên điện thoại
 */
export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user } = useAuthStore();
  const { conversations } = useChatStore();
  const { unreadRequestCount } = useFriendStore();

  const totalUnreadMessages = conversations.reduce(
    (total, c) => total + (user ? c.unreadCounts?.[user._id] || 0 : 0),
    0,
  );

  // Xác định vị trí tab đang active
  const tabs = ["conversations", "friends", "groups", "profile"] as const;
  const activeIndex = tabs.indexOf(activeTab);

  const getTabClass = (tab: AppBottomNavProps["activeTab"]) =>
    `relative flex flex-col items-center justify-center flex-1 h-[94%] gap-1 rounded-full transition-colors duration-300 ${
      activeTab === tab
        ? "text-indigo-600 dark:text-indigo-300 font-semibold"
        : "text-slate-500 dark:text-slate-400"
    }`;

  return (
    <div className=" md:hidden fixed bottom-2 left-4 right-4 h-14 mx-0">
      <nav className="relative overflow-hidden rounded-full md:hidden h-full px-0.5 flex items-center justify-evenly bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/20">
        <div
          className="
            absolute top-1 bottom-1 left-1
            w-[calc((100%-0.5rem)/4)]
            rounded-full
            bg-indigo-500/10 dark:bg-indigo-400/15
            ring-1 ring-indigo-500/10 dark:ring-indigo-300/10
            shadow-sm
            pointer-events-none
            transition-transform duration-300 ease-in-out
          "
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {/* Tab conversations */}
        <button
          type="button"
          onClick={() => onTabChange("conversations")}
          className={getTabClass("conversations")}
        >
          <div className="relative">
            <MessagesSquare className="size-6" />
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
              </span>
            )}
          </div>
        </button>

        {/* Tab bạn bè */}
        <button
          type="button"
          onClick={() => onTabChange("friends")}
          className={getTabClass("friends")}
        >
          <ContactRound className="size-6" />
        </button>

        {/* Tab nhóm */}
        <button
          type="button"
          onClick={() => onTabChange("groups")}
          className={getTabClass("groups")}
        >
          <div className="relative">
            <UsersRound className="size-6" />
            {unreadRequestCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-amber-500 rounded-full flex items-center justify-center">
                {unreadRequestCount}
              </span>
            )}
          </div>
        </button>

        {/* Tab profile + setting */}
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={getTabClass("profile")}
        >
          <UserAvatar
            name={user?.username || "Bạn"}
            type="sidebar"
            avatarUrl={user?.avatarUrl || undefined}
            className="!size-7 border-2 border-zinc-500 dark:border-zinc-100"
          />
        </button>
      </nav>
    </div>
  );
};
