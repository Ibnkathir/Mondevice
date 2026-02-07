const express = require("express");
const { all } = require("../db");

const router = express.Router();

router.get("/courses", async (req, res) => {
  try {
    const courses = await all("SELECT * FROM courses ORDER BY created_at DESC");
    return res.json({ courses });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;
