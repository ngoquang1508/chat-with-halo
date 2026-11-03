import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X, Reply } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage, replyingTo, setReplyingTo } =
    useChatStore();
  const [value, setValue] = useState("");

  if (!user) return;

  const sendMessage = async (content?: string) => {
    const messageToSend = content ?? value;
    if (!messageToSend.trim()) return;

    setValue("");

    try {
      if (selectedConvo.type === "direct") {
        const otherUser = selectedConvo.participants.find(
          (p) => p._id !== user._id,
        );
        if (!otherUser) return;
        await sendDirectMessage(
          otherUser._id,
          messageToSend,
          undefined,
          replyingTo?._id ?? null,
        );
      } else {
        await sendGroupMessage(
          selectedConvo._id,
          messageToSend,
          undefined,
          replyingTo?._id ?? null,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-background">
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/30">
          <Reply className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="max-w-2xl text-xs text-muted-foreground truncate">
              {replyingTo.isRecalled ? (
                <span className="italic">Tin nhắn đã bị thu hồi</span>
              ) : (
                replyingTo.content
              )}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 p-3 min-h-14">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-smooth"
        >
          <ImagePlus className="size-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            onKeyDown={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Soạn tin nhắn..."
            className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-primary/10 transition-smooth"
            >
              <div>
                <EmojiPicker
                  onChange={(emoji: string) => setValue(`${value}${emoji}`)}
                />
              </div>
            </Button>
          </div>
        </div>

        {!value.trim() ? (
          <Button onClick={() => sendMessage("👍")}>👍</Button>
        ) : (
          <Button
            onClick={() => sendMessage()}
            className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
            disabled={!value.trim()}
          >
            <Send className="size-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
