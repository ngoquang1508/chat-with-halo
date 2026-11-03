import express from "express";

import {
  sendDirectMessage,
  sendGroupMessage,
  pinMessage,
  unpinMessage,
  hideMessage,
  recallMessage,
} from "../controllers/messageController.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.put("/:id/pin", pinMessage);
router.put("/:id/unpin", unpinMessage);
router.put("/:id/hide", hideMessage);
router.put("/:id/recall", recallMessage);

export default router;
