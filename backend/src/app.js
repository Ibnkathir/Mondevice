const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/database");
require("./models");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const levelRoutes = require("./routes/levelRoutes");
const contentRoutes = require("./routes/contentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Erreur interne", details: err.message });
});

const startDatabase = async () => {
  await sequelize.sync();
};

module.exports = { app, startDatabase };
