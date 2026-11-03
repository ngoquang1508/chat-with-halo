import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Conversation, Participant } from "@/types/chat";
import UserAvatar from "@/components/chat/UserAvatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Crown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConversationInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
}

const ConversationInfoDialog = ({
  open,
  onOpenChange,
  conversation,
}: ConversationInfoDialogProps) => {
  const { user } = useAuthStore();
  const isGroup = conversation.type === "group";
  const [tab, setTab] = useState<"all" | "admin">("all");

  const otherParticipant = !isGroup
    ? conversation.participants.find((p) => p._id !== user?._id)
    : null;

  const displayName = isGroup
    ? conversation.group?.name
    : (otherParticipant?.displayName ?? "");

  const filtered = conversation.participants.filter((p) =>
    tab === "admin" ? p._id === conversation.group?.createdBy : true,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm p-0 overflow-hidden gap-0"
      >
        <DialogHeader className="px-5 py-4 border-b border-border/50">
          <DialogTitle className="text-base text-center">
            {isGroup ? "Thành viên" : displayName}
          </DialogTitle>
        </DialogHeader>

        {isGroup && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border/50">
              {[
                { key: "all", label: "Tất cả" },
                { key: "admin", label: "Quản trị viên" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as "all" | "admin")}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium transition-colors relative",
                    tab === t.key
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Danh sách thành viên */}
            <div className="flex flex-col max-h-96 overflow-y-auto py-2 beautiful-scrollbar">
              {filtered.map((p: Participant) => {
                const isOwner = p._id === conversation.group?.createdBy;
                const isMe = p._id === user?._id;
                return (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    {/* avatar */}
                    <UserAvatar
                      type="chat"
                      name={p.displayName}
                      avatarUrl={p.avatarUrl ?? undefined}
                      className="size-10 shrink-0"
                    />
                    {/* displayName */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {p.displayName}
                        </span>
                        {isMe && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            (Bạn)
                          </span>
                        )}
                      </div>
                      {isOwner && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Crown className="size-3" /> Quản trị viên
                        </span>
                      )}
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => alert("Tinh nang dang duoc phat trien")}
                        className="p-1 hover:bg-background rounded opacity-50 hover:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có quản trị viên nào
                </p>
              )}
            </div>
          </>
        )}

        {/* Direct chat info */}
        {!isGroup && (
          <div className="flex flex-col items-center gap-3 py-8 px-4">
            <div className="ring-4 ring-primary/20 rounded-full">
              <UserAvatar
                type="chat"
                name={displayName}
                avatarUrl={otherParticipant?.avatarUrl ?? undefined}
                className="size-20 text-2xl"
              />
            </div>
            <h2 className="font-semibold text-lg">{displayName}</h2>
            {/* todo: Cập nhật thêm thông tin cá nhân */}
            {/* Nếu user khóa trang cá nhân thì hiên thông tin */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationInfoDialog;
