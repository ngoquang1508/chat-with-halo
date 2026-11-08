import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id.toString();

    if (type !== "direct" && type !== "group") {
      return res
        .status(400)
        .json({ message: "Conversation type không hợp lệ" });
    }

    if (
      type === "group" &&
      (!name ||
        !memberIds ||
        !Array.isArray(memberIds) ||
        memberIds.length === 0)
    ) {
      return res.status(400).json({
        message: "Tên nhóm và danh sách thành viên là bắt buộc",
      });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        await conversation.save();
      } else {
        // clear hiddenFor cho user hiện tại khi mở lại convo bị ẩn
        await Conversation.findByIdAndUpdate(conversation._id, {
          $pull: { hiddenFor: userId },
        });

        conversation = await Conversation.findById(conversation._id);
      }
    }

    if (type === "group") {
      const uniqueMemberIds = Array.from(
        new Set(memberIds.map((id) => id.toString())),
      ).filter((id) => id !== userId);

      conversation = new Conversation({
        type: "group",
        participants: [
          { userId },
          ...uniqueMemberIds.map((id) => ({ userId: id })),
        ],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.sender", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    if (type === "group") {
      memberIds.forEach((userId) => {
        io.to(userId).emit("new-group", formatted);
      });
    }

    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi tạo conversation: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      "participants.userId": userId,
      hiddenFor: {
        $ne: userId,
      },
    })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.sender",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      })
      .lean(); // Tối ưu: Dùng lean() để giảm tải bộ nhớ RAM Mongoose Document

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo,
        unreadCounts: convo.unreadCounts || {},
        participants: participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi khi gọi getConversations: ", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({ path: "lastMessage.sender", select: "displayName avatarUrl" })
      .populate({ path: "seenBy", select: "displayName avatarUrl" })
      .lean(); // Tối ưu: Dùng lean() để giải phóng RAM

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    return res
      .status(200)
      .json({ conversation: { ...conversation, participants } });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "conversationId không hợp lệ",
      });
    }

    const query = {
      conversationId,
      deletedFor: { $ne: userId }, // lọc tin bị ẩn
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .select("+isRecalled +recalledAt +deletedFor")
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1)
      .populate({
        path: "replyTo",
        select: "content senderId isRecalled",
      })
      .lean(); // Tối ưu: Dùng lean()

    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt ? new Date(nextMessage.createdAt).toISOString() : null;
      messages.pop();
    }

    messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getMessages: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      {
        "participants.userId": userId,
      },
      { _id: 1 },
    ).lean(); // Tối ưu: Dùng lean()

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation không tồn tại",
      });
    }

    const last = conversation.lastMessage;

    if (!last) {
      return res.status(200).json({
        message: "Không có tin nhắn cuối cùng để đánh dấu là đã đọc.",
      });
    }

    if (last.sender?.toString() === userId) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      { new: true },
    )
      .populate("participants.userId", "displayName avatarUrl")
      .populate("lastMessage.sender", "displayName avatarUrl")
      .populate("seenBy", "displayName avatarUrl");

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage?._id,
        content: updated?.lastMessage?.content,
        createdAt: updated?.lastMessage?.createdAt,
        sender: updated?.lastMessage?.sender,
      },
    });

    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi gọi markAsSeem: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const hideConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    if (
      !conversation.participants.some(
        (p) => p.userId.toString() === userId.toString(),
      )
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { hiddenFor: userId },
    });

    return res.status(200).json({ message: "Conversation đã được ẩn." });
  } catch (error) {
    console.error("Lỗi khi hide conversation: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const leaveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ áp dụng cho group chat" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const isOwner =
      conversation.group.createdBy.toString() === userId.toString(); // kiểm tra có phải người tạo nhóm không
    const memberCount = conversation.participants.length;

    // nếu nhóm chỉ có 1 người -> xóa group
    if (isOwner && memberCount === 1) {
      await Conversation.findByIdAndDelete(conversationId);
      await Message.deleteMany({ conversationId });
      return res.status(200).json({ message: "Đã giải tán nhóm" });
    }

    if (isOwner && memberCount > 1) {
      // chuyển owner cho người join sớm nhất (không phải mình)
      const newOwner = conversation.participants.find(
        (p) => p.userId.toString() !== userId.toString(),
      );
      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { participants: { userId } },
        $set: { "group.createdBy": newOwner.userId },
      });
    } else {
      // member thường -> rời nhóm
      await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { participants: { userId } },
      });
    }

    // tạo system message thông báo rời nhóm
    await Message.create({
      conversationId,
      senderId: userId,
      type: "system",
      content: `${req.user.displayName} đã rời nhóm.`,
    });

    return res.status(200).json({ message: "Đã rời nhóm" });
  } catch (error) {
    console.error("Lỗi khi leaveConversation: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const muteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { mutedUntil } = req.body; // null = vĩnh viễn, Date string = nó thời hạn
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const alreadyMuted = conversation.mutedBy.some(
      (m) => m.userId.toString() === userId.toString(),
    );

    if (alreadyMuted) {
      // unmute
      await Conversation.findByIdAndUpdate(conversation._id, {
        $pull: { mutedBy: { userId } },
      });

      return res
        .status(200)
        .json({ message: "Đã bật thông báo", muted: false });
    }

    // mute
    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: {
        mutedBy: {
          userId,
          mutedUntil: mutedUntil ? new Date(mutedUntil) : null,
        },
      },
    });

    return res.status(200).json({ message: "Đã tắt thông báo", muted: true });
  } catch (error) {
    console.error("Lỗi khi muteConversation: ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getPinnedMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({
      conversationId: id,
      isPinned: true,
    })
      .sort({ pinnedAt: -1 })
      .lean(); // Tối ưu: Dùng lean()

    return res.json(messages);
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn ghim", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
