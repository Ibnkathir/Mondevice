const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { listContents, createContent, updateContent, deleteContent } = require("../controllers/contentController");

const router = express.Router();

router.get("/level/:levelId", authMiddleware, listContents);
router.post("/level/:levelId", authMiddleware, roleMiddleware("ADMIN"), createContent);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateContent);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteContent);

module.exports = router;
