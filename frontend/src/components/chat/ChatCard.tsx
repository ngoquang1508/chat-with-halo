import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isMuted } from "@/lib/notification";
import { formatOnlineTime, cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";
import {
  Bell,
  BellOff,
  EyeOff,
  LogOut,
  MoreHorizontal,
  UserRound,
  UsersRound,
} from "lucide-react";
import MuteDialog from "@/components/chat/MuteDialog";
import ConversationInfoDialog from "@/components/chat/ConversationInfoDialog";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  const {
    hideConversation,
    leaveConversation,
    conversations,
    muteConversation,
  } = useChatStore();
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const convo = conversations.find((c) => c._id === convoId);
  const isGroupChat = convo?.type === "group";
  const muted = convo ? isMuted(convo) : false;

  return (
    <>
      <Card
        key={convoId}
        className={cn(
          "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
          isActive &&
            "ring-2 ring-primary/50 bg-linear-to-tr from-primary-glow/10 to-primary-foreground",
        )}
        onClick={() => onSelect(convoId)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">{leftSection}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3
                className={cn(
                  "font-semibold text-sm truncate",
                  unreadCount && unreadCount > 0 && "text-foreground",
                )}
              >
                {name}
              </h3>
              <div className="flex gap-2 items-center justify-center">
                {muted && <BellOff className="size-4" />}
                <span className="text-xs text-muted-foreground">
                  {timestamp ? formatOnlineTime(timestamp) : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {subtitle}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <MoreHorizontal
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "size-4 text-muted-foreground transition-smooth cursor-pointer",
                      isActive ? "opacity-100" : "opacity-50 hover:opacity-100",
                    )}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-max min-w-44 p-1"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isGroupChat ? (
                    <button
                      onClick={() => setInfoSheetOpen(true)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:bg-muted"
                    >
                      <UsersRound className="size-3.5" /> Xem thông tin nhóm
                    </button>
                  ) : (
                    <button
                      onClick={() => setInfoSheetOpen(true)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:bg-muted"
                    >
                      <UserRound className="size-3.5" /> Xem thông tin
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (muted) {
                        muteConversation(convoId);
                      } else {
                        setMuteDialogOpen(true);
                      }
                    }}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:bg-muted"
                  >
                    {muted ? (
                      <>
                        <Bell className="size-3.5" /> Bật thông báo
                      </>
                    ) : (
                      <>
                        <BellOff className="size-3.5" /> Tắt thông báo
                      </>
                    )}
                  </button>

                  {isGroupChat ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:bg-muted text-destructive">
                          <LogOut className="size-3.5" /> Rời nhóm
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rời khỏi nhóm?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn sẽ không còn nhận được tin nhắn từ nhóm này nữa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => leaveConversation(convoId)}
                          >
                            Rời nhóm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <button
                      onClick={() => hideConversation(convoId)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:bg-muted text-muted-foreground"
                    >
                      <EyeOff className="size-3.5" /> Ẩn đoạn chat
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>

      {/* Mute dialog */}
      <MuteDialog
        open={muteDialogOpen}
        onOpenChange={setMuteDialogOpen}
        onConfirm={(mutedUntil) => {
          muteConversation(convoId, mutedUntil);
          setMuteDialogOpen(false);
        }}
      />

      {/*  */}
      {convo && (
        <ConversationInfoDialog
          open={infoSheetOpen}
          onOpenChange={setInfoSheetOpen}
          conversation={convo}
        />
      )}
    </>
  );
};

export default ChatCard;
