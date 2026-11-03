import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId, replyTo } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content) {
      return res.status(400).json({ message: "Thiếu nội dung" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    // Hiện lại conversation với người nhận nếu đã ẩn
    await Conversation.findByIdAndUpdate(conversation._id, {
      $pull: { hiddenFor: recipientId },
    });

    // emit cho người nhận để hiện lại conversation
    io.to(recipientId.toString()).emit("show-conversation", {
      conversationId: conversation._id,
    });

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      replyTo: replyTo || null,
    });

    // populate replyTo trước khi emit
    await message.populate({
      path: "replyTo",
      select: "content senderId isRecalled",
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message, req.user);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, replyTo } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json("Thiếu nội dung");
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
      replyTo: replyTo || null,
    });

    await message.populate({
      path: "replyTo",
      select: "content senderId isRecalled",
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message, req.user);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    message.isPinned = true;
    message.pinnedBy = userId;
    message.pinnedAt = new Date();
    await message.save();

    await Conversation.findByIdAndUpdate(message.conversationId, {
      $addToSet: { pinnedMessages: message._id },
    });

    io.to(message.conversationId.toString()).emit("message:pinned", message);

    return res.json(message);
  } catch (error) {
    console.error("Lỗi khi ghim tin nhắn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    message.isPinned = false;
    message.pinnedBy = null;
    message.pinnedAt = null;
    await message.save();

    await Conversation.findByIdAndUpdate(message.conversationId, {
      $pull: { pinnedMessages: message._id },
    });

    io.to(message.conversationId.toString()).emit("message:unpinned", message);

    return res.json(message);
  } catch (error) {
    console.error("Lỗi khi bỏ ghim tin nhắn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Ẩn phía mình (cả tin của mình lẫn tin người khác)
export const hideMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findByIdAndUpdate(
      id,
      { $addToSet: { deletedFor: userId } },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    return res.json(message);
  } catch (error) {
    console.error("Lỗi khi ẩn tin nhắn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thu hồi với tất cả (chỉ tin của mình)
export const recallMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Không có quyền thu hồi" });
    }

    // Lưu trạng thái isPinned trước khi thay đổi
    const wasPinned = message.isPinned;

    message.isRecalled = true;
    message.recalledAt = new Date();
    message.content = null;
    message.isPinned = false;
    message.pinnedBy = null;
    message.pinnedAt = null;

    await message.save();

    // Cập nhật lastMessage trong conversation
    await Conversation.findOneAndUpdate(
      {
        _id: message.conversationId,
        "lastMessage._id": message._id,
      },
      {
        $set: {
          "lastMessage.content": null,
          "lastMessage.isRecalled": true,
        },
      },
    );

    // Nếu đang ghim thì bỏ ghim
    if (wasPinned) {
      await Conversation.findByIdAndUpdate(message.conversationId, {
        $pull: { pinnedMessages: message._id },
      });

      io.to(message.conversationId.toString()).emit("message:unpinned", {
        _id: message._id,
        conversationId: message.conversationId,
      });
    }

    io.to(message.conversationId.toString()).emit("message:recalled", {
      _id: message._id,
      conversationId: message.conversationId,
    });

    return res.json(message);
  } catch (error) {
    console.error("Lỗi khi thu hồi tin nhắn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
