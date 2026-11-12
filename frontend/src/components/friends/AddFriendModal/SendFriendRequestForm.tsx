import type { UseFormRegister } from "react-hook-form";
import type { IFormValues } from "./AddFriendModal";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface SendRequestProps {
  register: UseFormRegister<IFormValues>;
  loading: boolean;
  searchedUsername: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const SendFriendRequestForm = ({
  register,
  loading,
  searchedUsername,
  onSubmit,
  onBack,
}: SendRequestProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <span className="success-message">
          Tìm thấy <span className="font-semibold underline">@{searchedUsername}</span> !
        </span>

        <div className="space-y-4">
          <Textarea
            id="message"
            rows={3}
            placeholder="Gửi lời chào kết bạn..."
            className="mt-4 glass border-border/50 focus:border-primary/50 transition-smooth resize-none"
            {...register("message")}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="flex-1 glass hover:text-destructive"
            onClick={onBack}
          >
            Quay lại
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-chat text-white hover:opactity-90 transition-smooth"
          >
            {loading ? (
              <span>Đang gửi...</span>
            ) : (
              <>
                <UserPlus className="size-4 mr-2" /> Kết Bạn
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
};

export default SendFriendRequestForm;
