const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { getQuizForLevel, createQuiz, submitQuiz } = require("../controllers/quizController");

const router = express.Router();

router.get("/level/:levelId", authMiddleware, getQuizForLevel);
router.post("/level/:levelId", authMiddleware, roleMiddleware("ADMIN"), createQuiz);
router.post("/:quizId/submit", authMiddleware, submitQuiz);

module.exports = router;
