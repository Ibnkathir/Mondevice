const express = require("express");
const { all, get, run } = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired, requireRole("STUDENT"));

const hasPaidCourse = async (userId, courseId) => {
  const payment = await get(
    "SELECT id FROM payments WHERE user_id = ? AND course_id = ? AND status = 'PAID'",
    [userId, courseId]
  );
  return Boolean(payment);
};

const getLevelsWithAccess = async (userId, courseId) => {
  const levels = await all(
    "SELECT * FROM levels WHERE course_id = ? ORDER BY order_index ASC",
    [courseId]
  );
  if (levels.length === 0) {
    return [];
  }

  const levelIds = levels.map((level) => level.id);
  const quizzes = await all(
    `SELECT * FROM quizzes WHERE level_id IN (${levelIds.map(() => "?").join(",")})`,
    levelIds
  );
  const quizByLevel = new Map(quizzes.map((quiz) => [quiz.level_id, quiz]));

  const quizIds = quizzes.map((quiz) => quiz.id);
  const results = quizIds.length
    ? await all(
        `SELECT * FROM results WHERE user_id = ? AND quiz_id IN (${quizIds
          .map(() => "?")
          .join(",")})`,
        [userId, ...quizIds]
      )
    : [];
  const resultByQuiz = new Map(results.map((result) => [result.quiz_id, result]));

  return levels.map((level, index) => {
    if (index === 0) {
      return { ...level, unlocked: true };
    }

    const previousLevel = levels[index - 1];
    const previousQuiz = quizByLevel.get(previousLevel.id);
    if (!previousQuiz) {
      return { ...level, unlocked: true };
    }

    const previousResult = resultByQuiz.get(previousQuiz.id);
    const unlocked = Boolean(previousResult && previousResult.passed);
    return {
      ...level,
      unlocked,
      blockedReason: unlocked ? null : "Quiz du niveau précédent non validé."
    };
  });
};

router.get("/courses", async (req, res) => {
  try {
    const courses = await all("SELECT * FROM courses ORDER BY created_at DESC");
    const enhanced = await Promise.all(
      courses.map(async (course) => {
        const access = !course.is_paid || (await hasPaidCourse(req.user.id, course.id));
        return { ...course, access };
      })
    );
    return res.json({ courses: enhanced });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/courses/:id/levels", async (req, res) => {
  try {
    const course = await get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    const access = !course.is_paid || (await hasPaidCourse(req.user.id, course.id));
    if (!access) {
      return res.status(403).json({ message: "Paiement requis pour accéder au cours." });
    }

    const levels = await getLevelsWithAccess(req.user.id, course.id);
    return res.json({ course, levels });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/levels/:id/contents", async (req, res) => {
  try {
    const level = await get("SELECT * FROM levels WHERE id = ?", [req.params.id]);
    if (!level) {
      return res.status(404).json({ message: "Niveau introuvable." });
    }

    const course = await get("SELECT * FROM courses WHERE id = ?", [level.course_id]);
    const access = !course.is_paid || (await hasPaidCourse(req.user.id, course.id));
    if (!access) {
      return res.status(403).json({ message: "Paiement requis pour accéder au cours." });
    }

    const levelsWithAccess = await getLevelsWithAccess(req.user.id, course.id);
    const currentLevel = levelsWithAccess.find((item) => item.id === level.id);
    if (currentLevel && !currentLevel.unlocked) {
      return res.status(403).json({ message: currentLevel.blockedReason || "Niveau verrouillé." });
    }

    const contents = await all(
      "SELECT * FROM contents WHERE level_id = ? ORDER BY created_at ASC",
      [level.id]
    );
    const quiz = await get("SELECT * FROM quizzes WHERE level_id = ?", [level.id]);
    return res.json({ level, contents, quiz });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await get("SELECT * FROM quizzes WHERE id = ?", [req.params.id]);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable." });
    }

    const level = await get("SELECT * FROM levels WHERE id = ?", [quiz.level_id]);
    const course = await get("SELECT * FROM courses WHERE id = ?", [level.course_id]);
    const access = !course.is_paid || (await hasPaidCourse(req.user.id, course.id));
    if (!access) {
      return res.status(403).json({ message: "Paiement requis pour accéder au cours." });
    }

    const questions = await all(
      "SELECT id, question_text, options FROM questions WHERE quiz_id = ?",
      [quiz.id]
    );

    return res.json({ quiz, questions: questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options)
    })) });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/quizzes/:id/submit", async (req, res) => {
  try {
    const quiz = await get("SELECT * FROM quizzes WHERE id = ?", [req.params.id]);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable." });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Réponses invalides." });
    }

    const questions = await all("SELECT * FROM questions WHERE quiz_id = ?", [quiz.id]);
    const correctCount = questions.reduce((acc, question) => {
      const answer = answers.find((item) => item.questionId === question.id);
      if (answer && answer.selectedIndex === question.correct_index) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score ? 1 : 0;

    await run(
      "INSERT INTO results (user_id, quiz_id, score, passed) VALUES (?, ?, ?, ?)",
      [req.user.id, quiz.id, score, passed]
    );

    if (passed) {
      const level = await get("SELECT * FROM levels WHERE id = ?", [quiz.level_id]);
      const levels = await all(
        "SELECT * FROM levels WHERE course_id = ? ORDER BY order_index ASC",
        [level.course_id]
      );
      const position = levels.findIndex((item) => item.id === level.id);
      const percentage =
        levels.length > 0 ? Math.round(((position + 1) / levels.length) * 100) : 0;

      const existing = await get(
        "SELECT * FROM progress WHERE user_id = ? AND course_id = ?",
        [req.user.id, level.course_id]
      );

      if (existing) {
        await run(
          "UPDATE progress SET level_id = ?, percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [level.id, percentage, existing.id]
        );
      } else {
        await run(
          "INSERT INTO progress (user_id, course_id, level_id, percentage) VALUES (?, ?, ?, ?)",
          [req.user.id, level.course_id, level.id, percentage]
        );
      }
    }

    return res.json({ score, passed: Boolean(passed), passingScore: quiz.passing_score });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/progress", async (req, res) => {
  try {
    const progress = await all(
      `SELECT progress.*, courses.title AS course_title
       FROM progress
       JOIN courses ON courses.id = progress.course_id
       WHERE progress.user_id = ?`,
      [req.user.id]
    );
    const results = await all(
      `SELECT results.*, quizzes.level_id, levels.name AS level_name, courses.title AS course_title
       FROM results
       JOIN quizzes ON quizzes.id = results.quiz_id
       JOIN levels ON levels.id = quizzes.level_id
       JOIN courses ON courses.id = levels.course_id
       WHERE results.user_id = ?`,
      [req.user.id]
    );
    return res.json({ progress, results });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const { courseId, levelId, percentage, lastContentId } = req.body;
    if (!courseId || percentage === undefined) {
      return res.status(400).json({ message: "Cours et progression requis." });
    }

    const existing = await get(
      "SELECT * FROM progress WHERE user_id = ? AND course_id = ?",
      [req.user.id, courseId]
    );

    if (existing) {
      await run(
        "UPDATE progress SET level_id = ?, percentage = ?, last_content_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [levelId || existing.level_id, percentage, lastContentId || existing.last_content_id, existing.id]
      );
    } else {
      await run(
        "INSERT INTO progress (user_id, course_id, level_id, percentage, last_content_id) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, courseId, levelId || null, percentage, lastContentId || null]
      );
    }

    const updated = await get(
      "SELECT * FROM progress WHERE user_id = ? AND course_id = ?",
      [req.user.id, courseId]
    );
    return res.json({ progress: updated });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;
