import React from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useSocketStore } from "@/stores/useSocketStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

import UserAvatar from "@/components/common/UserAvatar";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatarSkeleton from "@/components/skeleton/UserAvatarSkeleton";

interface FriendsStoriesRowProps {}

const MAX_ONLINE_DISPLAY = 8;
const MAX_OFFLINE_DISPLAY = 8;

export const FriendsStoriesRow: React.FC<FriendsStoriesRowProps> = () => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const { friends, loading } = useFriendStore();

  const {
    conversations,
    createConversation,
    setActiveConversation,
    fetchMessages,
  } = useChatStore();

  const onlineUserSet = new Set(onlineUsers);

  const onlineFriends = friends.filter((friend) =>
    onlineUserSet.has(friend._id),
  );

  const offlineFriends = friends.filter(
    (friend) => !onlineUserSet.has(friend._id),
  );

  const displayFriends = [
    ...onlineFriends.slice(0, MAX_ONLINE_DISPLAY),
    ...offlineFriends.slice(0, MAX_OFFLINE_DISPLAY),
  ];

  // Mở conversation có sẵn hoặc tạo mới
  const handleOpenDirectConversation = async (friendId: string) => {
    const existing = conversations.find(
      (convo) =>
        convo.type === "direct" &&
        convo.participants.some((p) => p._id === friendId) &&
        convo.participants.some((p) => p._id === user?._id),
    );

    if (existing) {
      setActiveConversation(existing._id);
      await fetchMessages(existing._id);
      return;
    }

    await createConversation("direct", "", [friendId]);
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Bạn bè
        </span>

        {onlineFriends.length > 0 && (
          <span className="font-medium text-emerald-500">
            {onlineFriends.length} đang online
          </span>
        )}
      </div>

      {/* Friends list */}
      <div className="flex items-center gap-4 py-1">
        {/* Current user */}
        <button
          type="button"
          onClick={() => toast.info("Tính năng story sẽ sớm ra mắt!")}
          className="flex flex-shrink-0 flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="relative">
            <UserAvatar
              name={user?.username ?? "Bạn"}
              type="sidebar"
              avatarUrl={user?.avatarUrl ?? undefined}
            />

            <StatusBadge icon={<PlusIcon className="size-2.5" />} />
          </div>

          <span className="max-w-[54px] truncate text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Bạn
          </span>
        </button>

        {/* Friends */}
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <UserAvatarSkeleton key={index} />
            ))
          : displayFriends.map((friend) => {
              const isOnline = onlineUserSet.has(friend._id);

              return (
                <button
                  key={friend._id}
                  type="button"
                  onClick={() => handleOpenDirectConversation(friend._id)}
                  className="group flex flex-shrink-0 flex-col items-center gap-1 focus:outline-none"
                >
                  <div className="relative">
                    <UserAvatar
                      name={friend.displayName || ""}
                      type="sidebar"
                      avatarUrl={friend.avatarUrl ?? undefined}
                    />

                    <StatusBadge status={isOnline ? "online" : "offline"} />
                  </div>

                  <span className="max-w-[54px] truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {friend.displayName}
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
};
