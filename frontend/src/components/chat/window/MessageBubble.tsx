import React from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { Pin, Reply, CheckCheck, FileText, Download } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  lastMessageId?: string;
  lastMessageStatus: "delivered" | "seen";
  isPinned?: boolean;
  senderName?: string;
  showSenderName?: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  lastMessageId,
  lastMessageStatus,
  isPinned = false,
  senderName,
  showSenderName = false,
  onScrollToMessage,
}) => {
  const isOwn = message.isOwn;
  const isLast = message._id === lastMessageId;

  return (
    <div
      className={cn(
        "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col gap-1",
        isOwn ? "items-end" : "items-start",
      )}
    >
      {/* Thẻ tin nhắn chính */}
      <div
        className={cn(
          "relative p-3.5 transition-all shadow-xs",
          isOwn
            ? "bg-[#5865F2] text-white rounded-3xl rounded-br-xs shadow-indigo-500/10"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl rounded-bl-xs border border-slate-100 dark:border-slate-700/60 shadow-slate-200/50 dark:shadow-none",
          message.isRecalled && "italic opacity-80",
        )}
      >
        {/* Ghim tin nhắn */}
        {isPinned && (
          <div
            className={cn(
              "absolute -top-2 flex items-center justify-center size-5 rounded-full bg-amber-400 text-white shadow-sm ring-2 ring-white dark:ring-slate-900",
              isOwn ? "-left-2" : "-right-2",
            )}
          >
            <Pin className="size-2.5 rotate-45" />
          </div>
        )}

        {/* Khung trích dẫn tin nhắn đang trả lời */}
        {message.replyTo && (
          <button
            type="button"
            onClick={() => onScrollToMessage?.(message.replyTo!._id)}
            className={cn(
              "w-full text-left px-3 py-1.5 mb-2 rounded-2xl border-l-4 transition-colors text-xs",
              isOwn
                ? "bg-white/15 border-white text-white/90 hover:bg-white/20"
                : "bg-indigo-50 dark:bg-slate-700/50 border-[#5865F2] text-slate-700 dark:text-slate-300 hover:bg-indigo-100/50",
            )}
          >
            <div className="flex items-center gap-1 font-semibold mb-0.5">
              <Reply className="size-3 shrink-0" />
              <span>Trả lời tin nhắn</span>
            </div>
            <p className="truncate">
              {message.replyTo.isRecalled
                ? "Tin nhắn đã bị thu hồi"
                : message.replyTo.content}
            </p>
          </button>
        )}

        {/* Tên người gửi nếu là tin nhắn nhóm và không phải của mình */}
        {showSenderName && !isOwn && senderName && (
          <p className="text-xs font-bold text-[#5865F2] dark:text-indigo-400 mb-1">
            {senderName}
          </p>
        )}

        {/* Nội dung tin nhắn văn bản */}
        {message.isRecalled ? (
          <p className="text-xs md:text-sm">
            {isOwn ? "Bạn đã thu hồi tin nhắn" : "Tin nhắn đã bị thu hồi"}
          </p>
        ) : (
          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Hiển thị hình ảnh đính kèm nếu có imgUrl */}
        {message.imgUrl && !message.isRecalled && (
          <div className="mt-2.5 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
            <img
              src={message.imgUrl}
              alt="Ảnh đính kèm"
              className="max-h-60 w-auto object-cover rounded-xl"
            />
            <div
              className={cn(
                "flex items-center justify-between p-2 text-xs",
                isOwn
                  ? "bg-black/10 text-white"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileText className="size-3.5 flex-shrink-0" />
                <span className="truncate">Hình ảnh đính kèm</span>
              </div>
              <a
                href={message.imgUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1 hover:opacity-80 transition-opacity"
              >
                <Download className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Trạng thái Đã xem / Đã gửi của tin nhắn cuối */}
      {isOwn && isLast && !message.isRecalled && (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mr-1.5">
          {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
          {lastMessageStatus === "seen" && <CheckCheck className="size-3.5" />}
        </span>
      )}
    </div>
  );
};

export default MessageBubble;
