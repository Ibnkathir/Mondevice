const express = require("express");
const crypto = require("crypto");
const { all, get, run } = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

const providerBaseUrl = process.env.PAYMENT_PROVIDER_URL || "https://pay.local";

router.post("/initiate", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { courseId, currency } = req.body;
    if (!courseId || !currency) {
      return res.status(400).json({ message: "Cours et devise requis." });
    }

    const course = await get("SELECT * FROM courses WHERE id = ?", [courseId]);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    if (!course.is_paid) {
      return res.status(400).json({ message: "Ce cours est gratuit." });
    }

    const existing = await get(
      "SELECT id FROM payments WHERE user_id = ? AND course_id = ? AND status = 'PAID'",
      [req.user.id, courseId]
    );
    if (existing) {
      return res.status(400).json({ message: "Cours déjà payé." });
    }

    const providerRef = crypto.randomUUID();
    const result = await run(
      "INSERT INTO payments (user_id, course_id, amount, currency, status, provider_ref) VALUES (?, ?, ?, ?, 'PENDING', ?)",
      [req.user.id, courseId, course.price, currency, providerRef]
    );

    const paymentUrl = `${providerBaseUrl}/checkout?ref=${providerRef}&amount=${course.price}&currency=${currency}`;

    return res.status(201).json({ paymentId: result.id, paymentUrl });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.post("/callback", async (req, res) => {
  try {
    const { providerRef, status } = req.body;
    if (!providerRef || !status) {
      return res.status(400).json({ message: "Données callback invalides." });
    }

    const payment = await get("SELECT * FROM payments WHERE provider_ref = ?", [providerRef]);
    if (!payment) {
      return res.status(404).json({ message: "Paiement introuvable." });
    }

    const normalized = status === "PAID" ? "PAID" : "FAILED";
    await run("UPDATE payments SET status = ? WHERE id = ?", [normalized, payment.id]);

    return res.json({ message: "Paiement mis à jour.", status: normalized });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

router.get("/history", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const payments = await all(
      `SELECT payments.*, courses.title AS course_title
       FROM payments
       JOIN courses ON courses.id = payments.course_id
       WHERE payments.user_id = ?
       ORDER BY payments.created_at DESC`,
      [req.user.id]
    );
    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;
