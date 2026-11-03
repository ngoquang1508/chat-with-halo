import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useRef } from "react";

interface ConversationSearchProps {
  setQuery: (e: string) => void;
}

const ConversationSearch = ({ setQuery }: ConversationSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setQuery("");
    }
  };

  return (
    <div className="relative my-2">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        className="pl-9 rounded-full border focus:border-gray-50!"
        placeholder="Tìm kiếm"
        onChange={(e) => setQuery(e.target.value)}
      />
      <X
        className={cn("absolute right-3 top-1/2 -translate-y-1/2 size-4", !inputRef.current?.value && "opacity-0")}
        onClick={handleClear}
      />
    </div>
  );
};

export default ConversationSearch;
