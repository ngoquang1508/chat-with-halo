import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import type { Conversation } from "@/types/chat";

const DirectMessageList = ({ dataSearch }: { dataSearch?: Conversation[] }) => {
  const { conversations } = useChatStore();

  if (!conversations) return;

  const directConversations =
    dataSearch ?? conversations.filter((convo) => convo.type === "direct");

  if (!directConversations.length) return null;

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
