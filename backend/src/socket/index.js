import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// Quản lý danh sách người dùng online: { userIdString: Set<socketId> }
// Dùng String làm key để tránh rò rỉ bộ nhớ (memory leak) do tham chiếu ObjectId
// và dùng Set để hỗ trợ 1 tài khoản mở nhiều tab / thiết bị
const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  // Thêm socket ID vào Set của người dùng
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Phát danh sách user online (dạng chuỗi ID)
  io.emit("online-users", Array.from(onlineUsers.keys()));

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.join(userId);

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      // Chỉ khi tất cả các tab / kết nối của user đã đóng mới xoá khỏi danh sách online
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

export { io, app, server };
