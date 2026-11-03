import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { cn } from "@/lib/utils";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user._id];
  const name = convo.group?.name ?? "";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  const senderId = convo.lastMessage?.sender._id;
  const lastMessage = convo.lastMessage?.content ?? "";
  const isRecalled = convo.lastMessage?.isRecalled ?? false;

  let displayLastMessage;

  if (convo.lastMessage === null) {
    displayLastMessage = "Chưa có tin nhắn nào.";
  } else {
    displayLastMessage = isRecalled
      ? senderId === user._id
        ? "Bạn đã thu hồi tin nhắn"
        : `${convo.lastMessage?.sender?.displayName || "Ẩn danh"} đã thu hồi tin nhắn`
      : senderId === user._id
        ? `Bạn: ${lastMessage}`
        : `${convo.lastMessage?.sender?.displayName || "Ẩn danh"}: ${lastMessage}`;
  }

  return (
    <ChatCard
      convoId={convo._id}
      name={name + ` (${convo.participants.length} thành viên)`}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          <GroupChatAvatar participants={convo.participants} type="chat" />
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground",
          )}
        >
          {displayLastMessage}
        </p>
      }
    />
  );
};

export default GroupChatCard;
