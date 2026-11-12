import React, { useState, useMemo, useCallback } from "react";

import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";

import { ChatSidebarHeader } from "./ChatSidebarHeader";
import { FriendsStoriesRow } from "./FriendsStoriesRow";
import { FilterPills, type FilterType } from "./FilterPills";
import { SearchSidebar } from "./SearchSidebar";
import { ConversationList } from "./ConversationList";
import { AppBottomNav } from "@/components/navigation/AppBottomNav";
import type { NavMobileTab } from "@/types/navigation";

interface ChatSidebarProps {
  onOpenCreateChat: () => void;
  onOpenFriendRequests: () => void;
}

/**
 * Sidebar hiển thị danh sách cuộc trò chuyện,
 * tìm kiếm và lọc conversation.
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onOpenCreateChat,
  onOpenFriendRequests,
}) => {
  const { user } = useAuthStore();

  const {
    conversations,
    convoLoading,
    activeConversationId,
    setActiveConversation,
    fetchMessages,
    messages,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<NavMobileTab>("conversations");
  const [filter, setFilter] = useState<FilterType>("all");

  // Chuẩn hóa từ khóa tìm kiếm
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Chọn conversation
  const handleSelectConversation = useCallback(
    async (id: string) => {
      setActiveConversation(id);

      // Chỉ fetch khi chưa có messages trong store
      if (!messages[id]) {
        await fetchMessages(id);
      }
    },
    [messages, setActiveConversation, fetchMessages],
  );

  // Lọc conversation
  const filteredConversations = useMemo(() => {
    return conversations.filter((convo: Conversation) => {
      // Filter theo loại conversation
      if (filter === "direct" && convo.type !== "direct") return false;
      if (filter === "group" && convo.type !== "group") return false;

      // Filter conversation chưa đọc
      if (
        filter === "unread" &&
        (!user || (convo.unreadCounts?.[user._id] ?? 0) === 0)
      ) {
        return false;
      }

      // Không có từ khóa tìm kiếm
      if (!normalizedQuery) return true;

      // Tìm kiếm theo tên nhóm
      if (convo.type === "group") {
        return (convo.group?.name ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
      }

      // Tìm kiếm theo tên người trò chuyện
      const other = convo.participants.find(
        (participant) => participant._id !== user?._id,
      );

      return (other?.displayName ?? "").toLowerCase().includes(normalizedQuery);
    });
  }, [conversations, filter, normalizedQuery, user]);

  return (
    <div className="relative flex h-full w-full flex-shrink-0 select-none flex-col overflow-hidden border-r border-slate-200/70 bg-[#f8f9fd] dark:border-slate-800 dark:bg-slate-900/90 md:w-[340px] lg:w-[360px]">
      {/* Header */}
      <ChatSidebarHeader
        onOpenCreateChat={onOpenCreateChat}
        onOpenFriendRequests={onOpenFriendRequests}
      />

      {/* Search */}
      <SearchSidebar searchQuery={searchQuery} onChange={setSearchQuery} />

      {/* Friends */}
      <FriendsStoriesRow />

      {/* Filters */}
      <FilterPills currentFilter={filter} onFilterChange={setFilter} />

      {/* Conversations */}
      <ConversationList
        conversations={filteredConversations}
        activeConversationId={activeConversationId}
        loading={convoLoading}
        onSelectConversation={handleSelectConversation}
      />

      {/* Navigator mobile */}
      <AppBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
