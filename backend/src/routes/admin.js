const express = require("express");
const { all, get, run } = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired, requireRole("ADMIN"));

router.post("/courses", async (req, res) => {
  try {
    const { title, description, isPaid, price } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Titre et description requis." });
    }

    const paidFlag = isPaid ? 1 : 0;
    const finalPrice = paidFlag ? Number(price || 0) : 0;

    const result = await run(
      "INSERT INTO courses (title, description, is_paid, price) VALUES (?, ?, ?, ?)",
      [title, description, paidFlag, finalPrice]
    );

    const course = await get("SELECT * FROM courses WHERE id = ?", [result.id]);
    return res.status(201).json({ course });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const { title, description, isPaid, price } = req.body;
    const course = await get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    const paidFlag = typeof isPaid === "boolean" ? (isPaid ? 1 : 0) : course.is_paid;
    const finalPrice = paidFlag ? Number(price ?? course.price) : 0;

    await run(
      "UPDATE courses SET title = ?, description = ?, is_paid = ?, price = ? WHERE id = ?",
      [title || course.title, description || course.description, paidFlag, finalPrice, course.id]
    );

    const updated = await get("SELECT * FROM courses WHERE id = ?", [course.id]);
    return res.json({ course: updated });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const course = await get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    await run("DELETE FROM courses WHERE id = ?", [course.id]);
    return res.json({ message: "Cours supprimé." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/courses/:id/levels", async (req, res) => {
  try {
    const { name, orderIndex } = req.body;
    if (!name || orderIndex === undefined) {
      return res.status(400).json({ message: "Nom et ordre requis." });
    }

    const course = await get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    const result = await run(
      "INSERT INTO levels (course_id, name, order_index) VALUES (?, ?, ?)",
      [course.id, name, orderIndex]
    );

    const level = await get("SELECT * FROM levels WHERE id = ?", [result.id]);
    return res.status(201).json({ level });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/levels/:id/contents", async (req, res) => {
  try {
    const { type, title, url } = req.body;
    if (!type || !title || !url) {
      return res.status(400).json({ message: "Type, titre et URL requis." });
    }

    const level = await get("SELECT * FROM levels WHERE id = ?", [req.params.id]);
    if (!level) {
      return res.status(404).json({ message: "Niveau introuvable." });
    }

    const result = await run(
      "INSERT INTO contents (level_id, type, title, url) VALUES (?, ?, ?, ?)",
      [level.id, type, title, url]
    );

    const content = await get("SELECT * FROM contents WHERE id = ?", [result.id]);
    return res.status(201).json({ content });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/levels/:id/quizzes", async (req, res) => {
  try {
    const { passingScore } = req.body;
    if (passingScore === undefined) {
      return res.status(400).json({ message: "Note minimale requise." });
    }

    const level = await get("SELECT * FROM levels WHERE id = ?", [req.params.id]);
    if (!level) {
      return res.status(404).json({ message: "Niveau introuvable." });
    }

    const result = await run(
      "INSERT INTO quizzes (level_id, passing_score) VALUES (?, ?)",
      [level.id, passingScore]
    );

    const quiz = await get("SELECT * FROM quizzes WHERE id = ?", [result.id]);
    return res.status(201).json({ quiz });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/quizzes/:id/questions", async (req, res) => {
  try {
    const { questionText, options, correctIndex } = req.body;
    if (!questionText || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Question et options requises." });
    }

    const quiz = await get("SELECT * FROM quizzes WHERE id = ?", [req.params.id]);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable." });
    }

    const result = await run(
      "INSERT INTO questions (quiz_id, question_text, options, correct_index) VALUES (?, ?, ?, ?)",
      [quiz.id, questionText, JSON.stringify(options), correctIndex]
    );

    const question = await get("SELECT * FROM questions WHERE id = ?", [result.id]);
    return res.status(201).json({ question });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await all(
      "SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC"
    );
    return res.json({ students });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/students/:id/progress", async (req, res) => {
  try {
    const progress = await all(
      `SELECT progress.*, courses.title AS course_title
       FROM progress
       JOIN courses ON courses.id = progress.course_id
       WHERE progress.user_id = ?`,
      [req.params.id]
    );

    const results = await all(
      `SELECT results.*, quizzes.level_id, levels.name AS level_name, courses.title AS course_title
       FROM results
       JOIN quizzes ON quizzes.id = results.quiz_id
       JOIN levels ON levels.id = quizzes.level_id
       JOIN courses ON courses.id = levels.course_id
       WHERE results.user_id = ?`,
      [req.params.id]
    );

    return res.json({ progress, results });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const payments = await all(
      `SELECT payments.*, users.name AS student_name, courses.title AS course_title
       FROM payments
       JOIN users ON users.id = payments.user_id
       JOIN courses ON courses.id = payments.course_id
       ORDER BY payments.created_at DESC`
    );
    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;
