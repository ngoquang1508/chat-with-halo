import { useThemeStore } from "@/stores/useThemeStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center size-9 shrink-0 rounded-full cursor-pointer"
          title="Chọn emoji"
        >
          <Smile className="size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        avoidCollisions
        sticky="partial"
        className="
          z-[100]
          w-[352px]
          max-w-[calc(100vw-16px)]
          max-h-[min(435px,calc(100dvh-100px))]
          overflow-y-auto
          p-0
          border-none
          bg-transparent
          shadow-none
          rounded-xl
        "
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
          perLine={8}
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
