import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { Paperclip, Mic, SendHorizontal, X, Reply } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface FloatingMessageInputProps {
  selectedConvo: Conversation;
  onSendCustom?: (text: string) => void;
  externalText?: string;
  onClearExternalText?: () => void;
}

export const FloatingMessageInput: React.FC<FloatingMessageInputProps> = ({
  selectedConvo,
  externalText,
  onClearExternalText,
}) => {
  const { user } = useAuthStore();

  const { sendDirectMessage, sendGroupMessage, replyingTo, setReplyingTo } =
    useChatStore();

  const [text, setText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động điều chỉnh chiều cao Textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const minHeight = 24;
    const maxHeight = 120;

    textarea.style.height = "auto";

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [text]);

  // Nhận nội dung phản hồi nhanh từ bên ngoài
  useEffect(() => {
    if (externalText) {
      setText(externalText);
      onClearExternalText?.();
    }
  }, [externalText, onClearExternalText]);

  if (!user) return null;

  // Gửi tin nhắn
  const handleSend = async (contentToSend?: string) => {
    const message = (contentToSend ?? text).trim();

    if (!message) return;

    setText("");

    try {
      if (selectedConvo.type === "direct") {
        const otherUser = selectedConvo.participants.find(
          (p) => p._id !== user._id,
        );

        if (!otherUser) return;

        await sendDirectMessage(
          otherUser._id,
          message,
          undefined,
          replyingTo?._id ?? null,
        );
      } else {
        await sendGroupMessage(
          selectedConvo._id,
          message,
          undefined,
          replyingTo?._id ?? null,
        );
      }

      setReplyingTo(null);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại!");
      setText(message);
    }
  };

  // Enter để gửi, Shift + Enter để xuống dòng
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Xử lý file đính kèm
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    toast.info(`Đang tải tệp: ${file.name}`);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pb-2 pt-1 select-none bg-transparent">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="size-3.5 text-[#5865F2] shrink-0" />

            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Đang trả lời:
            </span>

            <span className="text-slate-500 dark:text-slate-400 truncate">
              {replyingTo.isRecalled
                ? "Tin nhắn đã thu hồi"
                : replyingTo.content}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* Attachment */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm tệp tin / hình ảnh"
          className="flex items-center justify-center size-9 shrink-0 rounded-full text-slate-400 hover:text-[#5865F2] hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          <Paperclip className="size-4.5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Micro */}
        <button
          type="button"
          onClick={() => toast.info("Tính năng tin nhắn thoại sắp ra mắt!")}
          title="Ghi âm tin nhắn thoại"
          className="flex items-center justify-center size-9 shrink-0 rounded-full text-slate-400 hover:text-[#5865F2] hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          <Mic className="size-4.5" />
        </button>

        {/* Textarea */}
        <div className="relative flex-1 min-w-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#5865F2] focus-within:ring-2 focus-within:ring-[#5865F2]/20 transition-all">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Nhập tin nhắn của bạn..."
            className="w-full h-9 min-h-9 max-h-[120px] resize-none overflow-y-hidden border-0 bg-transparent rounded-2xl text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-3 py-2 leading-5 beautiful-scrollbar"
          />

          {/* Emoji */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center size-9 shrink-0 rounded-full text-slate-400 hover:text-[#5865F2] transition-colors cursor-pointer">
            <EmojiPicker
              onChange={(emoji: string) => setText((prev) => prev + emoji)}
            />
          </div>
        </div>

        {/* Send */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!text.trim()}
          title="Gửi tin nhắn"
          className={`flex items-center justify-center size-9 shrink-0 rounded-full transition-all duration-200 ${
            text.trim()
              ? "bg-[#5865F2] hover:bg-[#4a56e2] text-white hover:scale-105 active:scale-95 shadow-md shadow-indigo-500/30"
              : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          <SendHorizontal className="size-4.5" />
        </button>
      </div>
    </div>
  );
};
