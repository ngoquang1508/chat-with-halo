import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun, UserPlus, Users } from "lucide-react";
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectMessageList";
import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import { useChatStore } from "@/stores/useChatStore";
import { useMemo, useState } from "react";
import ConversationSearch from "@/components/sidebar/ConversationSearch";
import type { Conversation } from "@/types/chat";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { convoLoading, conversations } = useChatStore();

  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openAddFriendModal, setOpenAddFriendModal] = useState(false);

  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return [];
    return conversations.filter(
      (convo: Conversation) =>
        convo.type === "group" &&
        convo.group?.name?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, conversations]);

  const filteredDirects = useMemo(() => {
    if (!query.trim()) return [];
    return conversations.filter((convo: Conversation) => {
      if (convo.type !== "direct") return false;
      const other = convo.participants.find((u) => u._id !== user?._id);
      return other?.displayName?.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, conversations, user]);

  const hasResult = filteredGroups.length > 0 || filteredDirects.length > 0;

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-primary"
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">HALO</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80" />
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-background/80"
                    />
                    <Moon className="size-4 text-white/80" />
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {/* Search conversations */}
            <ConversationSearch setQuery={setQuery} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
        {hasResult ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase">
                Kết quả tìm kiếm
              </SidebarGroupLabel>
              <SidebarContent>
                <div className="beautiful-scrollbar">
                  <GroupChatList dataSearch={filteredGroups} />
                  <DirectMessageList dataSearch={filteredDirects} />
                </div>
              </SidebarContent>
            </SidebarGroup>
          </>
        ) : query.trim() ? (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Không tìm thấy hội thoại nào.
          </p>
        ) : (
          <>
            {/* Group Chat */}
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase">
                nhóm chat
              </SidebarGroupLabel>
              <SidebarGroupAction
                title="Tạo nhóm"
                className="cursor-pointer"
                onClick={() => setOpenGroupModal(true)}
              >
                <Users className="size-4" />
              </SidebarGroupAction>

              <SidebarGroupContent>
                {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Direct Message */}
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase">
                bạn bè
              </SidebarGroupLabel>
              <SidebarGroupAction
                title="Kết Bạn"
                className="cursor-pointer"
                onClick={() => setOpenAddFriendModal(true)}
              >
                <UserPlus className="size-4" />
              </SidebarGroupAction>

              {/* New Chat */}
              <SidebarGroupContent>
                <CreateNewChat />
              </SidebarGroupContent>

              <SidebarGroupContent>
                {convoLoading ? (
                  <ConversationSkeleton />
                ) : (
                  <DirectMessageList />
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Modals */}
      <NewGroupChatModal
        open={openGroupModal}
        onOpenChange={setOpenGroupModal}
      />
      <AddFriendModal
        open={openAddFriendModal}
        onOpenChange={setOpenAddFriendModal}
      />

      {/* Footer */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
