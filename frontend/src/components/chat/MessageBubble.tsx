import { cn, formatMessageTime } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Pin, Reply } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  lastMessageId?: string;
  lastMessageStatus: "delivered" | "seen";
  isPinned?: boolean;
  senderName?: string;
  showSenderName?: boolean;
  onScrollToMessage?: (messageId: string) => void; // ✅ click vào quote → scroll
}

const MessageBubble = ({
  message,
  lastMessageId,
  lastMessageStatus,
  isPinned = false,
  senderName,
  showSenderName = false,
  onScrollToMessage,
}: MessageBubbleProps) => {
  const isLast = message._id === lastMessageId;

  return (
    <div
      className={cn(
        "max-w-2xs lg:max-w-md flex flex-col gap-0.5",
        message.isOwn ? "items-end" : "items-start",
      )}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {message.isRecalled ? (
              <Card
                className={cn(
                  "relative p-3",
                  message.isOwn
                    ? "chat-bubble-sent border-0"
                    : "chat-bubble-received",
                )}
              >
                {isPinned && (
                  <Pin
                    className={cn(
                      "absolute -top-2.5 w-3.5 h-3.5 text-primary rotate-45",
                      message.isOwn ? "left-2" : "right-2",
                    )}
                  />
                )}
                <p className="text-sm italic text-foreground">
                  {message.isOwn
                    ? "Bạn đã thu hồi tin nhắn"
                    : "Tin nhắn đã bị thu hồi"}
                </p>
              </Card>
            ) : (
              <Card
                className={cn(
                  "relative p-3",
                  message.isOwn
                    ? "chat-bubble-sent border-0"
                    : "chat-bubble-received",
                )}
              >
                {isPinned && (
                  <div
                    className={cn(
                      "absolute -top-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary shadow-md shadow-primary/40 ring-2 ring-background animate-pin-nail",
                      message.isOwn ? "-left-2" : "-right-2",
                    )}
                  >
                    <Pin className="w-2.5 h-2.5 text-primary-foreground rotate-45" />
                  </div>
                )}

                {/* Quoted message */}
                {message.replyTo && (
                  <button
                    onClick={() =>
                      onScrollToMessage?.(message.replyTo!._id)
                    }
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded border-l-4 border-primary bg-black/10 hover:bg-black/15 transition-colors",
                    )}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <Reply className="w-3 h-3 text-white shrink-0" />
                      <span className="text-xs font-semibold text-white">
                        Trả lời
                      </span>
                    </div>
                    <p className="text-xs truncate">
                      {message.replyTo.isRecalled
                        ? "Tin nhắn đã bị thu hồi"
                        : message.replyTo.content}
                    </p>
                  </button>
                )}

                {showSenderName && !message.isOwn && senderName && (
                  <p className="text-xs font-semibold text-primary mb-1 whitespace-nowrap">
                    {senderName}
                  </p>
                )}

                <p className="text-sm leading-relaxed wrap-break-word">
                  {message.content}
                </p>
              </Card>
            )}
          </TooltipTrigger>
          <TooltipContent side={message.isOwn ? "left" : "right"}>
            {formatMessageTime(new Date(message.createdAt))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {message.isOwn && isLast && !message.isRecalled && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0.5 h-4 border-0",
            lastMessageStatus === "seen"
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
        </Badge>
      )}
    </div>
  );
};

export default MessageBubble;