import type { Conversation } from "@/types/chat";
import { ConversationCard } from "./ConversationCard";
import ConversationSkeleton from "@/components/skeleton/ConversationSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  loading,
  onSelectConversation,
}: ConversationListProps) => {
  if (loading)
    return (
      <div className="px-4 space-y-2">
        <ConversationSkeleton />
      </div>
    );

  if (conversations.length === 0) {
    return (
      <div className="pb-16 md:pb-0 flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="font-semibold">Không tìm thấy kết quả</p>
        <p className="font-semibold text-xs text-zinc-500">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc nhé.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="pb-16 md:pb-0">
        {conversations.map((convo) => (
          <ConversationCard
            key={convo._id}
            convo={convo}
            isActive={activeConversationId === convo._id}
            onSelect={() => onSelectConversation(convo._id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
