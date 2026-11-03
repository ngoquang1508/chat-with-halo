import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
import type { Conversation } from "@/types/chat";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import { useState } from "react";

const GroupChatList = ({ dataSearch }: { dataSearch?: Conversation[] }) => {
  const { conversations } = useChatStore();
  const [openGroupModal, setOpenGroupModal] = useState(false);

  if (!conversations) return;

  const groupChats =
    dataSearch ?? conversations.filter((convo) => convo.type === "group");

  if (!dataSearch && !groupChats.length) {
    return (
      // Nếu chưa có nhóm nào
      <>
        <div className="flex items-center gap-1 px-2 text-muted-foreground">
          <p className="text-sm">Chưa có nhóm nào</p>
          <button
            onClick={() => setOpenGroupModal(true)}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            Tạo nhóm
          </button>
        </div>
        {/* modal tạo nhóm chat */}
        <NewGroupChatModal
          open={openGroupModal}
          onOpenChange={setOpenGroupModal}
        />
      </>
    );
  }

  if (!groupChats.length) return null;
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupChats.map((convo) => (
        <GroupChatCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default GroupChatList;
