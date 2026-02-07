const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { listCourses, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController");

const router = express.Router();

router.get("/", listCourses);
router.post("/", authMiddleware, roleMiddleware("ADMIN"), createCourse);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateCourse);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteCourse);

module.exports = router;
