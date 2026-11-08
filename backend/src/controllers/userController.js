import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Cần cung cấp username trong query." });
    }

    const user = await User.findOne({
      username: username,
      _id: {$ne: req.user._id}
     }).select(
      "_id displayName username avatarUrl"
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi xảy ra khi searchUserByUsername", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Lấy thông tin user hiện tại để kiểm tra avatarId cũ
    const currentUser = await User.findById(userId).select("avatarId").lean();
    const oldAvatarId = currentUser?.avatarId;

    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      }
    ).select("avatarUrl");

    // Xoá ảnh avatar cũ trên Cloudinary để tránh lãng phí dung lượng lưu trữ
    if (oldAvatarId) {
      try {
        await cloudinary.uploader.destroy(oldAvatarId);
      } catch (destroyError) {
        console.error("Lỗi khi xoá ảnh avatar cũ trên Cloudinary:", destroyError);
      }
    }

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Avatar trả về null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Lỗi xảy ra khi upload avatar", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};
