import { useChatStore } from "@/stores/useChatStore";
import type { Conversation, Message } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, MessageCircle, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ChatWindowHeaderProps {
  chat?: Conversation;
  pinnedMessages?: Message[];
  onUnpin?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

const ChatWindowHeader = ({
  chat,
  pinnedMessages = [],
  onUnpin,
  onScrollToMessage,
}: ChatWindowHeaderProps) => {
  const { conversations, activeConversationId, setActiveConversation } =
    useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    setIsListOpen(false);
  }, [pinnedMessages.length, activeConversationId]);

  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
    if (!user || !otherUser) return;
  }

  const handleCloseChat = () => setActiveConversation(null);
  const latestPinned = pinnedMessages[pinnedMessages.length - 1];

  const getSenderName = (senderId: string) => {
    const participant = chat?.participants.find(
      (p) => p._id.toString() === senderId.toString(),
    );
    return participant?.displayName ?? "Người dùng";
  };

  return (
    <>
      {/* Overlay đóng list khi click ra ngoài */}
      {isListOpen && (
        <div
          className="fixed inset-0 z-9"
          onClick={() => setIsListOpen(false)}
        />
      )}

      <div className="sticky top-0 z-10 bg-background flex flex-col">
        {/* Header chính */}
        <header className="px-4 py-2 flex items-center">
          <div className="flex items-center gap-2 w-full min-w-0">
            <SidebarTrigger className="-ml-1 text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="p-2 w-full flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {chat.type === "direct" ? (
                  <>
                    <UserAvatar
                      type="chat"
                      name={otherUser?.displayName || "halo"}
                      avatarUrl={otherUser?.avatarUrl || undefined}
                    />
                    <StatusBadge
                      status={
                        onlineUsers.includes(otherUser?._id ?? "")
                          ? "online"
                          : "offline"
                      }
                    />
                  </>
                ) : (
                  <GroupChatAvatar
                    participants={chat.participants}
                    type="chat"
                  />
                )}
              </div>
              <h2 className="font-semibold text-foreground truncate">
                {chat.type === "direct"
                  ? otherUser?.displayName
                  : chat.group?.name}
              </h2>
            </div>
          </div>
          <Button
            variant="destructiveOutline"
            size="icon"
            className="shrink-0"
            onClick={handleCloseChat}
          >
            <X className="size-4" />
          </Button>
        </header>

        {/* Khu vực ghim */}
        {latestPinned && (
          <div className="border-t border-border relative z-10">
            {/* Banner */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isListOpen
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2">
                  <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                  <button
                    onClick={() => onScrollToMessage?.(latestPinned._id)}
                    className="flex-1 min-w-0 text-left overflow-hidden"
                  >
                    <p className="max-w-xl text-xs text-foreground font-bold truncate">
                      [Nội dung]: {latestPinned.content}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Tin nhắn của{" "}
                      {getSenderName(latestPinned.senderId as string)}.
                    </p>
                  </button>
                  <div className="flex items-center gap-1">
                    {pinnedMessages.length !== 1 && (
                      <button
                        onClick={() => setIsListOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 border border-border text-xs text-foreground font-bold hover:bg-muted transition-colors shrink-0"
                      >
                        +{pinnedMessages.length - 1} ghim
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onUnpin?.(latestPinned._id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách mở rộng */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isListOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-sm font-medium text-foreground">
                    Danh sách ghim ({pinnedMessages.length})
                  </p>
                  <button
                    onClick={() => setIsListOpen(false)}
                    className="flex items-center gap-1 px-2 py-1 border border-border text-xs text-foreground font-bold hover:bg-muted transition-colors shrink-0"
                  >
                    Thu gọn
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto beautiful-scrollbar">
                  {[...pinnedMessages].reverse().map((msg) => (
                    <div
                      key={msg._id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors group border-t border-border/50"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      <button
                        onClick={() => {
                          onScrollToMessage?.(msg._id);
                          setIsListOpen(false);
                        }}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="max-w-xl text-xs text-foreground font-bold truncate">
                          [Nội dung]: {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Tin nhắn của {getSenderName(msg.senderId as string)}.
                        </p>
                      </button>
                      <button
                        onClick={() => onUnpin?.(msg._id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWindowHeader;
