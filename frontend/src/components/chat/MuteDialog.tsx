import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

const MUTE_OPTIONS = [
  { label: "15 phút", value: () => new Date(Date.now() + 15 * 60 * 1000) },
  { label: "1 giờ", value: () => new Date(Date.now() + 60 * 60 * 1000) },
  { label: "8 giờ", value: () => new Date(Date.now() + 8 * 60 * 60 * 1000) },
  { label: "24 giờ", value: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  { label: "Cho đến khi tôi bật lại", value: (): null => null },
];

interface MuteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mutedUntil: Date | null) => void;
}

const MuteDialog = ({ open, onOpenChange, onConfirm }: MuteDialogProps) => {
  const [selected, setSelected] = useState(MUTE_OPTIONS[0]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader className="relative">
          <AlertDialogTitle className="text-center pr-6">
            Tắt thông báo về cuộc trò chuyện
          </AlertDialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            size={"icon"}
            variant={"destructiveOutline"}
            className="absolute -top-1 -right-1"
          >
            <X className="size-4" />
          </Button>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1 py-1">
          {MUTE_OPTIONS.map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-muted cursor-pointer"
            >
              <input
                type="radio"
                name="mute-option"
                checked={selected.label === option.label}
                onChange={() => setSelected(option)}
                className="accent-primary size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>

        <AlertDialogDescription className="text-xs hidden">
          Cửa sổ chat vẫn đóng và bạn sẽ không nhận được thông báo đẩy trên thiết bị.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel variant={"secondary"} className="flex-1">Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="flex-1"
            onClick={() => onConfirm(selected.value())}
          >
            Tắt thông báo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MuteDialog;