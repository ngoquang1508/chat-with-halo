import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  MessagesSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  ContactRound,
  UsersRound,
} from "lucide-react";

import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useChatStore } from "@/stores/useChatStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Logo } from "../common/Logo";
import ProfileDialog from "../profile/ProfileDialog";

import type { NavDesktopTab } from "@/types/navigation";
import UserAvatar from "../chat/UserAvatar";
import StatusBadge from "../chat/StatusBadge";

interface AppNavRailProps {
  activeTab: NavDesktopTab;
  onTabChange: (tab: NavDesktopTab) => void;
}

/**
 * Thanh điều hướng bên trái (Desktop & Tablet)
 */
export const AppNavRail: React.FC<AppNavRailProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const { isDark, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();
  const { unreadRequestCount } = useFriendStore();
  const { conversations } = useChatStore();

  // Tổng số tin nhắn chưa đọc
  const totalUnreadMessages = conversations.reduce(
    (total, conversation) =>
      total + (user ? conversation.unreadCounts?.[user._id] || 0 : 0),
    0,
  );

  // Class dùng chung cho các nút điều hướng
  const getNavButtonClass = (tab: NavDesktopTab) =>
    `relative size-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
      activeTab === tab
        ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#5865F2] dark:text-indigo-400 font-semibold shadow-xs"
        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-[72px] h-full py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/70 dark:border-slate-800 flex-shrink-0 z-20">
      {/* Phần trên: Logo và navigation */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo App */}
        <button
          type="button"
          aria-label="Về trang tin nhắn"
          onClick={() => onTabChange("conversations")}
          className="relative group cursor-pointer"
        >
          <div className="size-12 flex items-center justify-center text-white">
            <Logo
              className="text-primary animate-message-bounce"
              stroke={isDark ? "white" : "black"}
            />
          </div>
        </button>

        {/* Danh sách điều hướng */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {/* Chat */}
          <button
            type="button"
            title="Đoạn chat"
            aria-label="Đoạn chat"
            aria-current={activeTab === "conversations" ? "page" : undefined}
            onClick={() => onTabChange("conversations")}
            className={getNavButtonClass("conversations")}
          >
            <MessagesSquare className="size-5" />

            {totalUnreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
              </span>
            )}
          </button>

          {/* Bạn bè */}
          <button
            type="button"
            title="Bạn bè"
            aria-label="Bạn bè"
            aria-current={activeTab === "friends" ? "page" : undefined}
            onClick={() => {
              onTabChange("friends");
            }}
            className={getNavButtonClass("friends")}
          >
            <ContactRound className="size-5" />
          </button>

          {/* Nhóm */}
          <button
            type="button"
            title="Nhóm"
            aria-label="Nhóm"
            aria-current={activeTab === "groups" ? "page" : undefined}
            onClick={() => {
              onTabChange("groups");
            }}
            className={getNavButtonClass("groups")}
          >
            <UsersRound className="size-5" />

            {unreadRequestCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-amber-500 rounded-full flex items-center justify-center">
                {unreadRequestCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Phần dưới: Theme và tài khoản */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Chuyển đổi Dark / Light mode */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
          aria-label={
            isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
          }
          className="size-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        {/* Avatar và menu tài khoản */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu tài khoản"
              className="relative rounded-full outline-none cursor-pointer"
            >
              <UserAvatar
                name={user?.displayName || "Bạn"}
                type="sidebar"
                avatarUrl={
                  user?.avatarUrl || user?.displayName?.charAt(0).toUpperCase()
                }
              />
              <StatusBadge status={"online"} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={8}
            className="z-[100] w-56 p-1.5 rounded-2xl"
          >
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                  {user?.displayName}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-none truncate">
                  @{user?.username || user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Cài đặt tài khoản */}
            <DropdownMenuItem
              onSelect={() => setProfileOpen(true)}
              className="rounded-xl cursor-pointer"
            >
              <Settings className="size-4 mr-2 text-slate-500" />
              <span>Cài đặt tài khoản</span>
            </DropdownMenuItem>

            {/* Đăng xuất */}
            <DropdownMenuItem
              onSelect={handleLogout}
              className="rounded-xl text-rose-600 dark:text-rose-400 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <LogOut className="size-4 mr-2" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hộp thoại thông tin cá nhân */}
        <ProfileDialog open={profileOpen} setOpen={setProfileOpen} />
      </div>
    </aside>
  );
};
