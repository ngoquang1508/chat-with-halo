import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";

const SentRequests = () => {
  const { sentList } = useFriendStore();

  if (!sentList || sentList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa gửi lời mời kết bạn nào.
      </p>
    );
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "accepted":
        return (
          <p className="text-sm text-green-500 font-medium">Đã chấp nhận</p>
        );
      case "declined":
        return <p className="text-sm text-destructive">Đã từ chối</p>;
      default:
        return (
          <p className="text-sm text-muted-foreground">Đang chờ trả lời...</p>
        );
    }
  };
  return (
    <div className="space-y-3 mt-4">
      <>
        {sentList.map((req) => (
          <FriendRequestItem
            key={req._id}
            requestInfo={req}
            type="sent"
            actions={getStatusText(req.status)}
          />
        ))}
      </>
    </div>
  );
};

export default SentRequests;
