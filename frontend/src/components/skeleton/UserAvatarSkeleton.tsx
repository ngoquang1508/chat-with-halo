import React from "react";

const UserAvatarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-1.5 animate-pulse">
      <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800" />

      <div className="h-2.5 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
  );
};

export default UserAvatarSkeleton;
