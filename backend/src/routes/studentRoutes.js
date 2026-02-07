const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { listStudents, studentOverview } = require("../controllers/studentController");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN"), listStudents);
router.get("/:id", authMiddleware, roleMiddleware("ADMIN"), studentOverview);

module.exports = router;
