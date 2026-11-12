import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Friend } from "@/types/user";
import InviteSuggestionList from "./InviteSuggestionList";
import SelectedUsersList from "./SelectedUsersList";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewGroupChatModal = ({ open, onOpenChange }: Props) => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const { friends, getFriends } = useFriendStore();
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const { loading, createConversation } = useChatStore();

  const loadFriends = async () => {
    await getFriends();
  };
  useEffect(() => {
  if (open && friends.length === 0) {
    loadFriends();
  }
}, [open]);

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  };

  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất 1 thành viên vào nhóm");
        return;
      }

      await createConversation(
        "group",
        groupName,
        invitedUsers.map((u) => u._id),
      );

      setSearch("");
      setInvitedUsers([]);
      setGroupName("");
      onOpenChange(false);
    } catch (error) {
      console.error(
        "Lỗi xảy ra khi handleSubmit trong NewGroupChatModal:",
        error,
      );
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !invitedUsers.some((u) => u._id === friend._id),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-106.25 border-none"
      >
        <DialogHeader>
          <DialogTitle className="capitalize">tạo nhóm chat mới</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              Tên nhóm
            </Label>
            <Input
              id="groupName"
              placeholder="Gõ tên nhóm vào đây..."
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite" className="text-sm font-semibold">
              Mời thành viên
            </Label>

            <Input
              id="invite"
              placeholder="Tìm theo tên hiển thị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            {search && filteredFriends.length > 0 && (
              <InviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {loading ? (
                <span>Đang tạo...</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
