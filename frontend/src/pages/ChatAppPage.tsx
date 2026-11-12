import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { AppNavRail } from "@/components/navigation/AppNavRail";
import { ChatSidebar } from "@/components/chat/sidebar/ChatSidebar";
import { ChatWindow } from "@/components/chat/window/ChatWindow";
import { ConversationInfoPanel } from "@/components/chat/info/ConversationInfoPanel";
import ChatWelcomeScreen from "@/components/chat/ChatWelcomeScreen";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import AddFriendModal from "@/components/chat/AddFriendModal";
import FriendRequestDialog from "@/components/friendRequest/FriendRequestDialog";
import FriendListModal from "@/components/createNewChat/FriendListModal";
import { Dialog } from "@/components/ui/dialog";
import type { NavDesktopTab } from "@/types/navigation";

/**
 * Trang chính Chat App
 * Hỗ trợ Responsive 4 cột trên Desktop và chuyển màn hình linh hoạt trên Mobile
 */
const ChatAppPage = () => {
  const {
    activeConversationId,
    conversations,
    markAsSeen,
    fetchConversations,
    fetchPinnedMessages,
  } = useChatStore();

  const { getFriends } = useFriendStore();

  // Quản lý tab đang chọn trên thanh điều hướng
  const [activeTab, setActiveTab] = useState<NavDesktopTab>("conversations");

  // Quản lý mở các modal
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openAddFriendModal, setOpenAddFriendModal] = useState(false);
  const [openFriendRequestDialog, setOpenFriendRequestDialog] = useState(false);
  const [openCreateChatModal, setOpenCreateChatModal] = useState(false);

  // Quản lý trạng thái mở/đóng Cột thông tin bên phải (Right Info Panel)
  // Mặc định mở trên màn hình lớn (Desktop >= 1280px)
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Tải danh sách hội thoại và bạn bè khi khởi động
  useEffect(() => {
    fetchConversations();
    getFriends();
  }, []);

  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  // Tự động tải tin nhắn ghim khi đổi cuộc trò chuyện
  useEffect(() => {
    if (!selectedConvo) return;
    fetchPinnedMessages(selectedConvo._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvo?._id]);

  // Đánh dấu đã đọc khi mở cuộc trò chuyện
  useEffect(() => {
    if (!selectedConvo) return;
    const markSeen = async () => {
      try {
        await markAsSeen();
      } catch (error) {
        console.error("Lỗi khi markAsSeen:", error);
      }
    };
    markSeen();
  }, [markAsSeen, selectedConvo]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f6fc] dark:bg-slate-950 font-sans select-none antialiased">
      {/* Cột 1: Navigation Rail bên trái cùng (Hiển thị trên Desktop & Tablet) */}
      <AppNavRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewGroup={() => setOpenGroupModal(true)}
        onOpenAddFriend={() => setOpenAddFriendModal(true)}
        onOpenFriendRequests={() => setOpenFriendRequestDialog(true)}
      />

      {/* Cột 2: Danh sách hội thoại (Sidebar) */}
      {/* Trên Mobile: Ẩn khi đang có cuộc trò chuyện được chọn */}
      <div
        className={`h-full ${
          selectedConvo ? "hidden md:flex" : "flex w-full md:w-auto"
        }`}
      >
        <ChatSidebar
          onOpenCreateChat={() => setOpenCreateChatModal(true)}
          // onOpenNewGroup={() => setOpenGroupModal(true)}
          // onOpenAddFriend={() => setOpenAddFriendModal(true)}
          onOpenFriendRequests={() => setOpenFriendRequestDialog(true)}
        />
      </div>

      {/* Cột 3: Khung Chat chính (Main Chat Area) */}
      {/* Trên Mobile: Chỉ hiển thị khi có cuộc trò chuyện được chọn */}
      <main
        className={`flex-1 h-full min-w-0 ${
          selectedConvo ? "flex flex-col" : "hidden md:flex flex-col"
        }`}
      >
        {selectedConvo ? (
          <ChatWindow
            selectedConvo={selectedConvo}
            isInfoOpen={isInfoOpen}
            onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
          />
        ) : (
          <div className="hidden md:flex flex-1 h-full items-center justify-center bg-[#f4f6fc]/50 dark:bg-slate-950/50">
            <ChatWelcomeScreen />
          </div>
        )}
      </main>

      {/* Cột 4: Thông tin hội thoại bên phải (Right Info Panel) */}
      {/* Trên Desktop: Hiển thị dạng cột song song nếu isInfoOpen = true */}
      {selectedConvo && isInfoOpen && (
        <div className="hidden lg:flex h-full">
          <ConversationInfoPanel
            conversation={selectedConvo}
            onClose={() => setIsInfoOpen(false)}
          />
        </div>
      )}

      {/* Trên Mobile / Tablet nhỏ: Drawer / Modal trượt ra khi bấm Info */}
      {selectedConvo && isInfoOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-200">
            <ConversationInfoPanel
              conversation={selectedConvo}
              onClose={() => setIsInfoOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Các Modals nghiệp vụ */}
      <NewGroupChatModal
        open={openGroupModal}
        onOpenChange={setOpenGroupModal}
      />
      <AddFriendModal
        open={openAddFriendModal}
        onOpenChange={setOpenAddFriendModal}
      />
      <FriendRequestDialog
        open={openFriendRequestDialog}
        setOpen={setOpenFriendRequestDialog}
      />

      {/* Modal danh sách bạn bè để bắt đầu cuộc trò chuyện mới */}
      <Dialog open={openCreateChatModal} onOpenChange={setOpenCreateChatModal}>
        <FriendListModal onClose={() => setOpenCreateChatModal(false)} />
      </Dialog>
    </div>
  );
};

export default ChatAppPage;
