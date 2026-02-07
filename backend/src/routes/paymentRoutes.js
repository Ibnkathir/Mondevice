const express = require("express");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { initiatePayment, confirmPayment, listPayments } = require("../controllers/paymentController");

const router = express.Router();

router.post("/course/:courseId", authMiddleware, initiatePayment);
router.post("/confirm", authMiddleware, confirmPayment);
router.get("/", authMiddleware, roleMiddleware("ADMIN"), listPayments);

module.exports = router;
