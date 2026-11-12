import React from "react";
import { Users, ArrowRight } from "lucide-react";

interface CreateGroupBannerProps {
  onClick: () => void;
}

/**
 * Banner mời tạo nhóm chat mới phong cách Playful
 * Bo tròn rounded-2xl với màu pastel tươi sáng và nút mũi tên chuyển động
 */
export const CreateGroupBanner: React.FC<CreateGroupBannerProps> = ({
  onClick,
}) => {
  return (
    <div className="px-4 py-2">
      <div
        onClick={onClick}
        className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100/80 dark:border-emerald-900/40 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {/* Icon nhóm trong vòng tròn màu xanh ngọc mint */}
          <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Users className="size-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Tạo nhóm trò chuyện mới
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Lên kế hoạch & kết nối bạn bè
            </span>
          </div>
        </div>

        {/* Nút mũi tên bo tròn */}
        <div className="size-8 rounded-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:translate-x-1 group-hover:bg-emerald-500 group-hover:text-white transition-all">
          <ArrowRight className="size-4" />
        </div>
      </div>
    </div>
  );
};

