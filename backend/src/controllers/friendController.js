import { io } from "../socket/index.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;

    if (from.toString() === to.toString()) {
      return res
        .status(400)
        .json({ message: "Không thể gửi lời mời kết bạn cho chính mình" });
    }

    const userExists = await User.exists({ _id: to });
    if (!userExists) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) [userA, userB] = [userB, userA];

    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
        status: "pending",
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Đã có lời mời kết bạn đang chờ" });
    }

    // Upsert thay vì create — tránh lỗi duplicate key
    const request = await FriendRequest.findOneAndUpdate(
      { from, to },
      { from, to, message, status: "pending" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const fromUser = await User.findById(from)
      .select("_id displayName avatarUrl username")
      .lean();

    io.to(to.toString()).emit("friend-request:received", {
      _id: request._id,
      from: fromUser,
      to,
      message: request.message,
      createdAt: request.createdAt,
    });

    return res
      .status(201)
      .json({ message: "Gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
    }

    await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    // Cập nhật status thay vì xóa — giữ lịch sử
    await FriendRequest.findByIdAndUpdate(requestId, { status: "accepted" });

    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean();

    io.to(request.from.toString()).emit("friend-request:accepted", {
      displayName: req.user.displayName,
      avatarUrl: req.user.avatarUrl,
    });

    return res.status(200).json({
      message: "Chấp nhận lời mời kết bạn thành công",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền từ chối lời mời này" });
    }

    // Cập nhật status thay vì xóa — giữ lịch sử
    await FriendRequest.findByIdAndUpdate(requestId, { status: "declined" });

    return res.status(200).json({ message: "Đã từ chối lời mời kết bạn" });
  } catch (error) {
    console.error("Lỗi khi từ chối lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "_id displayName avatarUrl username")
      .populate("userB", "_id displayName avatarUrl username")
      .lean();

    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }

    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const populateFields = "_id username displayName avatarUrl";

    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", populateFields),
      FriendRequest.find({ to: userId }).populate("from", populateFields),
    ]);

    res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Đếm số lời mời kết bạn đang chờ (pending) — endpoint nhẹ dùng cho badge
 * Không cần populate, chỉ countDocuments nên rất nhanh
 */
export const getPendingRequestCount = async (req, res) => {
  try {
    const count = await FriendRequest.countDocuments({
      to: req.user._id,
      status: "pending",
    });
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Lỗi khi đếm lời mời kết bạn đang chờ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
