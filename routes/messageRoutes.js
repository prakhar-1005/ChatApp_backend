const express = require("express");
const {allMessages,sendMessage} = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(requireAuth, allMessages);
router.route("/").post(requireAuth, sendMessage);

module.exports = router;