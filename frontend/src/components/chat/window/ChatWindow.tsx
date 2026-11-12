import React, { useState } from "react";
import type { Conversation } from "@/types/chat";
import { useChatStore } from "@/stores/useChatStore";
import { ChatHeader } from "./ChatHeader";
import ChatWindowBody from "../ChatWindowBody";
import { FloatingMessageInput } from "./FloatingMessageInput";

interface ChatWindowProps {
  selectedConvo: Conversation;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedConvo,
  isInfoOpen,
  onToggleInfo,
}) => {
  const { pinnedMessages, unpinMessage, pinMessage } = useChatStore();
  const [quickReplyText, setQuickReplyText] = useState<string>("");

  return (
    <div className="flex flex-col h-full flex-1 min-w-0 bg-[#f4f6fc]/50 dark:bg-slate-950/60 overflow-hidden relative">
      {/* Header cuộc trò chuyện */}
      <ChatHeader
        chat={selectedConvo}
        pinnedMessages={pinnedMessages}
        onUnpin={unpinMessage}
        onScrollToMessage={(id) => {
          document
            .querySelector(`[data-message-id="${id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        isInfoOpen={isInfoOpen}
        onToggleInfo={onToggleInfo}
      />

      {/* Thân tin nhắn (Chat Body cuộn mượt) */}
      <div className="flex-1 overflow-y-auto relative">
        <ChatWindowBody onPin={pinMessage} />
      </div>

      {/* Thanh nhập tin nhắn nổi (Floating Input Bar) */}
      <FloatingMessageInput
        selectedConvo={selectedConvo}
        externalText={quickReplyText}
        onClearExternalText={() => setQuickReplyText("")}
      />
    </div>
  );
};
