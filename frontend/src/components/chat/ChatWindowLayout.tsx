import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { useEffect } from "react";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    markAsSeen,
    pinnedMessages,
    fetchPinnedMessages,
    pinMessage,
    unpinMessage,
  } = useChatStore();

  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  // Fetch tin nhắn ghim khi đổi conversation
  useEffect(() => {
    if (!selectedConvo) return;
    fetchPinnedMessages(selectedConvo._id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvo?._id]);

  // Mark seen
  useEffect(() => {
    if (!selectedConvo) return;

    const markSeen = async () => {
      try {
        await markAsSeen();
      } catch (error) {
        console.error("Lỗi khi markSeen", error);
      }
    };

    markSeen();
  }, [markAsSeen, selectedConvo]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* Header */}
      <ChatWindowHeader
        pinnedMessages={pinnedMessages}
        onUnpin={unpinMessage}
        onScrollToMessage={(id) => {
          document
            .querySelector(`[data-message-id="${id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody onPin={pinMessage} />
      </div>

      {/* Footer */}
      <MessageInput selectedConvo={selectedConvo} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;