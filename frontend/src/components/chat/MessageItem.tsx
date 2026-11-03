import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import { useState } from "react";
import { TooltipProvider } from "../ui/tooltip";
import UserAvatar from "./UserAvatar";
import ActionButtons from "./ActionButtons";
import MessageBubble from "./MessageBubble";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
  onReply?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onScrollToMessage?: (messageId: string) => void;
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
  onReply,
  onPin,
  onScrollToMessage,
}: MessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { hideMessage, recallMessage, pinnedMessages, unpinMessage, setReplyingTo } =
    useChatStore();

  const isVisible = isHovered || isDropdownOpen;

  const prev = index > 0 ? messages[index - 1] : undefined;

  const isShowTime =
    index === 0 ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000;

  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString(),
  );

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success("Sao chép thành công!");
    } else {
      toast.error("Có lỗi xảy ra khi sao chép. Hãy thử lại!");
    }
  };

  const actionProps = {
    isVisible,
    isOwn: message.isOwn ?? false,
    isRecalled: message.isRecalled ?? false,
    isPinned: pinnedMessages.some((m) => m._id === message._id),
    onReply: () => {
      setReplyingTo(message); 
      onReply?.(message);
    },
    onCopy: handleCopy,
    onPin: () => onPin?.(message),
    onHide: () => hideMessage(message._id, message.conversationId),
    onRecallForMe: () => hideMessage(message._id, message.conversationId),
    onRecallForAll: () => recallMessage(message._id),
    onDropdownOpenChange: setIsDropdownOpen,
    onUnpin: () => unpinMessage(message._id),
  };

  // Tin nhắn hệ thống
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      data-message-item
      data-message-id={message._id}
    >
      {isShowTime && (
        <span className="flex justify-center text-xs text-muted-foreground mt-2.5 mb-1">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-1 message-bounce mt-1 px-2 rounded-lg",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        {!message.isOwn && (
          <>
            <div className="w-8 shrink-0 self-end">
              {isGroupBreak && (
                <UserAvatar
                  type="chat"
                  name={participant?.displayName ?? "Unknown"}
                  avatarUrl={participant?.avatarUrl ?? undefined}
                />
              )}
            </div>

            <MessageBubble
              isPinned={actionProps.isPinned}
              message={message}
              lastMessageId={selectedConvo.lastMessage?._id}
              lastMessageStatus={lastMessageStatus}
              senderName={participant?.displayName}
              showSenderName={isGroupBreak}
              onScrollToMessage={onScrollToMessage}
            />

            <TooltipProvider delayDuration={100}>
              <ActionButtons {...actionProps} />
            </TooltipProvider>
          </>
        )}

        {message.isOwn && (
          <>
            <TooltipProvider delayDuration={100}>
              <ActionButtons {...actionProps} />
            </TooltipProvider>

            <MessageBubble
              isPinned={actionProps.isPinned}
              message={message}
              lastMessageId={selectedConvo.lastMessage?._id}
              lastMessageStatus={lastMessageStatus}
              senderName={participant?.displayName}
              showSenderName={isGroupBreak}
              onScrollToMessage={onScrollToMessage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
