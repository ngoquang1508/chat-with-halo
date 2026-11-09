import { useState, useEffect } from "react";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";

interface ChatEmptyStateProps {
  selectedConvo: Conversation;
}

// Component hiển thị thông tin người nhận và mục gửi lời chào nhanh khi chưa có tin nhắn
const ChatEmptyState = ({ selectedConvo }: ChatEmptyStateProps) => {
  const { user } = useAuthStore();
  const sendDirectMessage = useChatStore((state) => state.sendDirectMessage);
  const sendGroupMessage = useChatStore((state) => state.sendGroupMessage);

  const [showQuickGreetings, setShowQuickGreetings] = useState(true);
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);

  // Tự động mở lại mục gợi ý lời chào khi đổi sang cuộc trò chuyện khác
  useEffect(() => {
    setShowQuickGreetings(true);
  }, [selectedConvo._id]);

  // Lấy thông tin người nhận (1-1) hoặc thông tin nhóm chat
  const otherUser =
    selectedConvo.type === "direct"
      ? selectedConvo.participants.find((p) => p._id !== user?._id)
      : null;

  const receiverName =
    selectedConvo.type === "direct"
      ? (otherUser?.displayName ?? "Người dùng")
      : (selectedConvo.group?.name ?? "Nhóm trò chuyện");

  // Gửi tin nhắn nhanh khi nhấn vào các nút gợi ý chào hỏi
  const handleSendQuickGreeting = async (text: string) => {
    if (!user || isSendingQuickMessage) return;

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

  return (
    <div className="flex flex-col h-full w-full justify-between items-center py-4 overflow-hidden">
      <div className="flex-1" />

      {/* Thông tin người nhận hiển thị ở giữa khung chat */}
      <div className="flex flex-col items-center justify-center gap-3 my-auto text-center">
        <div className="relative">
          {selectedConvo.type === "direct" ? (
            <UserAvatar
              type="profile"
              name={receiverName}
              avatarUrl={otherUser?.avatarUrl ?? undefined}
            />
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
};

export default ChatEmptyState;

