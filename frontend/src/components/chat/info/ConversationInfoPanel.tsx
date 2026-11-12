import React, { useState } from "react";
import type { Conversation, Participant } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import {
  X,
  Bell,
  BellOff,
  Pin,
  Ban,
  BadgeCheck,
  Palette,
  ShieldCheck,
  ChevronRight,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import MuteDialog from "../MuteDialog";
import { isMuted } from "@/lib/notification";

interface ConversationInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

/**
 * Cột Thông tin hội thoại bên phải (Right Info Panel - Cột thứ 4)
 * Thiết kế chuẩn theo phong cách Playful Pastel trong ảnh mẫu:
 * Profile card lớn, 3 nút thao tác nhanh (Thông báo, Ghim, Chặn),
 * Hình ảnh & tệp đã gửi, cài đặt chủ đề và mã hóa đầu cuối.
 */
export const ConversationInfoPanel: React.FC<ConversationInfoPanelProps> = ({
  conversation,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { pinnedMessages, muteConversation } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const [openMuteDialog, setOpenMuteDialog] = useState(false);

  if (!user) return null;

  const isGroup = conversation.type === "group";
  const otherUser = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== user._id);

  const title = isGroup
    ? conversation.group?.name || "Nhóm trò chuyện"
    : otherUser?.displayName || "Người dùng";

  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
  const isConvoMuted = isMuted(conversation);

  const usernameTag = isGroup
    ? `${conversation.participants.length} thành viên`
    : `@${otherUser?.displayName?.toLowerCase().replace(/\s+/g, "") || "user"}`;

  const bioRole = isGroup
    ? "Nhóm thảo luận & kết nối bạn bè"
    : "Lead Illustrator & Mascot Designer";

  return (
    <aside className="flex flex-col h-full w-full md:w-[320px] lg:w-[340px] bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-slate-800 flex-shrink-0 select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header: Tiêu đề & Nút đóng */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          Thông tin hội thoại
        </h3>
        <button
          type="button"
          onClick={onClose}
          title="Đóng thông tin"
          className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="size-4.5" />
        </button>
      </div>

      {/* Nội dung cuộn mượt */}
      <div className="flex-1 overflow-y-auto beautiful-scrollbar p-5 space-y-6">
        {/* 2. Profile Card bo tròn lớn */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 group">
            <div className="p-1 rounded-3xl bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 shadow-sm">
              <Avatar className="size-24 rounded-2xl border-2 border-white dark:border-slate-800">
                <AvatarImage
                  src={
                    isGroup ? undefined : (otherUser?.avatarUrl ?? undefined)
                  }
                  className="object-cover"
                />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xl rounded-2xl">
                  {title.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Dot online */}
            {isOnline && (
              <span className="absolute bottom-1 right-1 size-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            )}
          </div>

          {/* Tên & Huy hiệu xác minh */}
          <div className="flex items-center gap-1.5 justify-center mb-1">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              {title}
            </h4>
            {!isGroup && (
              <BadgeCheck className="size-4 text-[#5865F2] fill-[#5865F2]/20" />
            )}
          </div>

          {/* Chức danh / Bio */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 max-w-[240px]">
            {bioRole}
          </p>

          {/* Tag Username dạng viên thuốc màu xanh ngọc mint */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            {usernameTag}
          </span>
        </div>

        {/* 3. Cụm 3 nút hành động nhanh vuông bo tròn */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Nút Thông báo */}
          <button
            type="button"
            onClick={() => {
              if (isConvoMuted) {
                muteConversation(conversation._id, null);
              } else {
                setOpenMuteDialog(true);
              }
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
              isConvoMuted
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                : "bg-indigo-50/60 dark:bg-indigo-950/30 text-[#5865F2] hover:bg-indigo-100/70"
            }`}
          >
            {isConvoMuted ? (
              <BellOff className="size-5 mb-1.5" />
            ) : (
              <Bell className="size-5 mb-1.5" />
            )}
            <span className="text-[11px] font-medium">Thông báo</span>
          </button>

          {/* Nút Ghim tin */}
          <button
            type="button"
            onClick={() =>
              toast.info(
                pinnedMessages.length > 0
                  ? `Cuộc trò chuyện có ${pinnedMessages.length} tin nhắn được ghim`
                  : "Chưa có tin nhắn nào được ghim trong cuộc trò chuyện",
              )
            }
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 text-[#5865F2] hover:bg-indigo-100/70 transition-all duration-200"
          >
            <Pin className="size-5 mb-1.5 rotate-45" />
            <span className="text-[11px] font-medium">Ghim tin</span>
          </button>

          {/* Nút Chặn */}
          <button
            type="button"
            onClick={() =>
              toast.info("Tính năng chặn liên hệ đang được hoàn thiện")
            }
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-100/70 transition-all duration-200"
          >
            <Ban className="size-5 mb-1.5" />
            <span className="text-[11px] font-medium">Chặn</span>
          </button>
        </div>

        {/* 4. Danh sách thành viên (Nếu là nhóm) */}
        {isGroup && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-[#5865F2]" />
                <span>
                  Thành viên nhóm ({conversation.participants.length})
                </span>
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto beautiful-scrollbar">
              {conversation.participants.map((p: Participant) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-7">
                      <AvatarImage src={p.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {p.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                      {p.displayName}
                    </span>
                  </div>
                  {p._id === conversation.group?.createdBy && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold">
                      Trưởng nhóm
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Section Hình ảnh & Tệp (Thumbnail Grid) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Hình ảnh & Tệp (18)
            </span>
            <button
              type="button"
              onClick={() => toast.info("Xem toàn bộ thư viện đa phương tiện")}
              className="text-xs font-semibold text-[#5865F2] hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {/* Lưới hình ảnh xem nhanh */}
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-2xl bg-indigo-100/60 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
              <ImageIcon className="size-6 text-indigo-400" />
            </div>
            <div className="aspect-square rounded-2xl bg-teal-100/60 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
              <ImageIcon className="size-6 text-teal-400" />
            </div>
            <div
              onClick={() => toast.info("Xem toàn bộ tệp")}
              className="aspect-square rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-[#5865F2] cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-slate-700"
            >
              +15
            </div>
          </div>
        </div>

        {/* 6. Danh sách Menu cài đặt cuộc trò chuyện */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Đổi chủ đề đoạn chat */}
          <button
            type="button"
            onClick={() => toast.info("Chủ đề hiện tại: Tím Indigo Pastel")}
            className="flex items-center justify-between w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              <Palette className="size-4 text-slate-400" />
              <span>Đổi chủ đề đoạn chat</span>
            </div>
            <ChevronRight className="size-4 text-slate-400" />
          </button>

          {/* Mã hóa đầu cuối */}
          <div className="flex items-center justify-between w-full p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 text-left">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Mã hóa đầu cuối</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Bật</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mute dialog */}
      {openMuteDialog && (
        <MuteDialog
          open={openMuteDialog}
          onOpenChange={setOpenMuteDialog}
          onConfirm={(mutedUntil) => {
            muteConversation(conversation._id, mutedUntil);
            setOpenMuteDialog(false);
          }}
        />
      )}
    </aside>
  );
};
