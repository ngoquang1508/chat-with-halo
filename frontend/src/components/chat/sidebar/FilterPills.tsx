import React from "react";

export type FilterType = "all" | "direct" | "group" | "unread";

interface FilterPillsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const pills: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "direct", label: "Cá nhân" },
    { key: "group", label: "Nhóm" },
    { key: "unread", label: "Chưa đọc" },
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto beautiful-scrollbar">
      {pills.map((pill) => {
        const isActive = currentFilter === pill.key;
        return (
          <button
            key={pill.key}
            type="button"
            onClick={() => onFilterChange(pill.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-[#5865F2] text-white shadow-xs font-semibold shadow-indigo-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
};
