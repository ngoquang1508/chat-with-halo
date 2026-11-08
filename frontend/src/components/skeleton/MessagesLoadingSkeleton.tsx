import { Skeleton } from "@/components/ui/skeleton";

const MessagesLoadingSkeleton = () => {
  return (
    <div className="h-full w-full px-4 py-8 flex flex-col gap-2">
      {/* left msg */}
      <div className="flex items-end gap-1 max-w-[80%] sm:max-w-[60%]">
        <Skeleton className="size-8 rounded-full shrink-0 dark:bg-gray-800 bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-10 w-48 sm:w-64 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>

      {/* right msg */}
      <div className="flex items-end justify-end gap-1 max-w-[80%] sm:max-w-[60%] self-end">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-10 w-48 sm:w-64 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>

      <div className="flex items-end justify-end gap-1 max-w-[80%] sm:max-w-[60%] self-end">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-10 w-32 sm:w-48 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>

      {/* left msg */}
      <div className="flex items-end gap-1 max-w-[80%] sm:max-w-[60%]">
        <Skeleton className="size-8 rounded-full shrink-0 dark:bg-gray-800 bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-10 w-24 sm:w-48 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>

      <div className="flex items-end gap-1 max-w-[80%] sm:max-w-[60%]">
        <Skeleton className="size-8 rounded-full shrink-0 invisible" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-14 w-48 sm:w-64 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>

      {/* right msg */}
      <div className="flex items-end justify-end gap-1 max-w-[80%] sm:max-w-[60%] self-end">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-10 w-48 sm:w-64 rounded-xl dark:bg-gray-800 bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default MessagesLoadingSkeleton;
