require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { db } = require("./db");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const paymentRoutes = require("./routes/payments");
const publicRoutes = require("./routes/public");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Bidaya API opérationnelle." });
});

app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payments", paymentRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Erreur serveur.", error: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});

process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});
