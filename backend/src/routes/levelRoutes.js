const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { listLevels, createLevel, updateLevel, deleteLevel } = require("../controllers/levelController");

const router = express.Router();

router.get("/course/:courseId", listLevels);
router.post("/course/:courseId", authMiddleware, roleMiddleware("ADMIN"), createLevel);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateLevel);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteLevel);

module.exports = router;
