import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Index hỗ trợ tìm lời mời theo người nhận
friendRequestSchema.index({ to: 1 });

// Index kép hỗ trợ tối ưu đếm và lọc lời mời đang chờ (pending)
friendRequestSchema.index({ to: 1, status: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;
