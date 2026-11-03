import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Reply, MoreHorizontal, Copy, Pin, PinOff, Undo2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ActionButtonsProps {
  isVisible: boolean;
  isOwn: boolean;
  isRecalled: boolean;
  isPinned: boolean;
  onReply: () => void;
  onCopy: () => void;
  onRecallForMe: () => void;
  onRecallForAll: () => void;
  onHide: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onDropdownOpenChange: (open: boolean) => void;
}

const ActionButtons = ({
  isVisible,
  isOwn,
  isRecalled,
  isPinned,
  onReply,
  onCopy,
  onRecallForMe,
  onRecallForAll,
  onHide,
  onPin,
  onUnpin,
  onDropdownOpenChange,
}: ActionButtonsProps) => {
  const [recallOpen, setRecallOpen] = useState(false);

  const handleRecallForMe = () => {
    setRecallOpen(false);
    onRecallForMe();
  };

  const handleRecallForAll = () => {
    setRecallOpen(false);
    onRecallForAll();
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-0.5 transition-all duration-150",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Trả lời — ẩn nếu đã thu hồi */}
        {!isRecalled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onReply}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Trả lời</TooltipContent>
          </Tooltip>
        )}

        {/* Sao chép — ẩn nếu đã thu hồi */}
        {!isRecalled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCopy}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Sao chép</TooltipContent>
          </Tooltip>
        )}

        {/* More — luôn hiện */}
        <DropdownMenu onOpenChange={onDropdownOpenChange}>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-44">
            {/* Ghim / Bỏ ghim — ẩn nếu đã thu hồi */}
            {!isRecalled && (
              <DropdownMenuItem onClick={isPinned ? onUnpin : onPin}>
                {isPinned ? (
                  <>
                    <PinOff className="w-4 h-4 mr-2" />
                    Bỏ ghim
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Ghim tin nhắn
                  </>
                )}
              </DropdownMenuItem>
            )}

            {/* Thu hồi — chỉ tin của mình và chưa thu hồi */}
            {isOwn && !isRecalled && (
              <DropdownMenuItem onSelect={() => setRecallOpen(true)}>
                <Undo2 className="w-4 h-4 mr-2" />
                Thu hồi
              </DropdownMenuItem>
            )}

            {/* Ẩn — tin người khác HOẶC tin của mình đã thu hồi */}
            {(!isOwn || isRecalled) && (
              <DropdownMenuItem onClick={onHide}>
                <EyeOff className="w-4 h-4 mr-2" />
                Ẩn tin nhắn
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal thu hồi */}
      <Dialog open={recallOpen} onOpenChange={setRecallOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thu hồi tin nhắn</DialogTitle>
            <DialogDescription>
              Chọn cách bạn muốn thu hồi tin nhắn này.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleRecallForAll}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary">
                <Undo2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Thu hồi với tất cả</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Xóa tin nhắn ở cả hai phía, người nhận sẽ không thấy nội dung.
                </p>
              </div>
            </button>

            <button
              onClick={handleRecallForMe}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 p-1.5 rounded-full bg-muted text-muted-foreground">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Ẩn phía tôi</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chỉ ẩn trên thiết bị của bạn, người nhận vẫn thấy tin nhắn.
                </p>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRecallOpen(false)}
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;