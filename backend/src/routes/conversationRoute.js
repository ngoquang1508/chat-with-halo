import express from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  getMessages,
  markAsSeen,
  hideConversation,
  leaveConversation,
  muteConversation,
  getPinnedMessages,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId", getConversationById);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);
router.patch("/:conversationId/hide", hideConversation);
router.patch("/:conversationId/leave", leaveConversation);
router.patch("/:conversationId/mute", muteConversation);
router.get("/:id/pinned-messages", getPinnedMessages)

export default router;
