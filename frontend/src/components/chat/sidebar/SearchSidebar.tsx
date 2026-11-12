import { Search } from "lucide-react";

interface SearchSidebar {
  searchQuery: string;
  onChange: (value: string) => void;
}

export const SearchSidebar: React.FC<SearchSidebar> = ({
  searchQuery,
  onChange,
}) => {
  return (
    <div className="px-4 py-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="w-full pl-9 pr-9 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5865F2]/40 transition-all shadow-xs"
        />
      </div>
    </div>
  );
};
