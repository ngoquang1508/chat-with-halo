import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: "online" | "offline";
  icon?: ReactNode;
  className?: string;
}

const StatusBadge = ({
  status = "offline",
  icon,
  className,
}: StatusBadgeProps) => {
  return (
    <>
      {!icon ? (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card",
            status === "online" && "status-online",
            status === "offline" && "status-offline",
            className,
          )}
        ></div>
      ) : (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card bg-zinc-600 text-white flex items-center justify-center",
            className,
          )}
        >
          {icon}
        </div>
      )}
    </>
  );
};

export default StatusBadge;
