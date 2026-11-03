import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import type { FriendRequest } from "@/types/user";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],
  unreadRequestCount: 0,
  isRequestDialogOpen: false, // flag theo dõi dialog có đang mở không

  searchByUsername: async (username) => {
    try {
      set({ loading: true });
      const user = await friendService.searchByUsername(username);
      return user;
    } catch (error) {
      console.error("Lỗi xảy ra khi tìm user bằng username", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addFriend: async (to, message) => {
    try {
      set({ loading: true });
      const resultMessage = await friendService.sendFriendRequest(to, message);
      return { resultMessage, status: "success" as const };
    } catch (error) {
      console.error("Lỗi xảy ra khi gửi lời mời kết bạn", error);
      return {
        resultMessage: "Lỗi xảy ra khi gửi kết bạn",
        status: "error" as const,
      };
    } finally {
      set({ loading: false });
    }
  },

  getAllFriendRequests: async () => {
    try {
      set({ loading: true });
      const result = await friendService.getAllFriendRequest();
      if (!result) return;

      const { received, sent } = result;

      // Nếu dialog đang mở thì badge = 0, ngược lại tính số pending
      const pendingCount = get().isRequestDialogOpen
        ? 0
        : received.filter((r: FriendRequest) => r.status === "pending").length;

      set({
        receivedList: received,
        sentList: sent,
        unreadRequestCount: pendingCount,
      });
    } catch (error) {
      console.error("Lỗi xảy ra khi lấy danh sách lời mời kết bạn", error);
    } finally {
      set({ loading: false });
    }
  },

  acceptRequest: async (requestId) => {
    try {
      set({ loading: true });
      const res = await friendService.acceptRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.map((r) =>
          r._id === requestId ? { ...r, status: "accepted" } : r,
        ),
        friends: [...state.friends, res.newFriend],
      }));
    } catch (error) {
      console.error("Lỗi xảy ra khi chấp nhận lời mời kết bạn", error);
    } finally {
      set({ loading: false });
    }
  },

  declineRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.declineRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.map((r) =>
          r._id === requestId ? { ...r, status: "declined" } : r,
        ),
      }));
    } catch (error) {
      console.error("Lỗi xảy ra khi từ chối lời mời kết bạn", error);
    } finally {
      set({ loading: false });
    }
  },

  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendList();
      set({ friends });
    } catch (error) {
      console.error("Lỗi xảy ra khi lấy danh sách bạn bè", error);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Nhận lời mời kết bạn realtime qua socket
  // Nếu dialog đang mở → thêm vào list nhưng KHÔNG tăng badge
  addReceivedRequest: (request: FriendRequest) => {
    set((state) => {
      const exists = state.receivedList.some((r) => r._id === request._id);
      if (exists) return state;

      return {
        receivedList: [request, ...state.receivedList],
        // Chỉ tăng badge khi dialog đang đóng
        unreadRequestCount: state.isRequestDialogOpen
          ? state.unreadRequestCount
          : state.unreadRequestCount + 1,
      };
    });
  },

  addFriendToList: (friend) => {
    set((state) => {
      const exists = state.friends.some((f) => f._id === friend._id);
      if (exists) return state;
      return {
        friends: [friend, ...state.friends],
      };
    });
  },
}));