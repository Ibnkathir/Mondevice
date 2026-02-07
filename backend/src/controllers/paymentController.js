const { Payment, Course } = require("../models");
const { createPaymentUrl, verifyPayment } = require("../services/lengoPayService");

const initiatePayment = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }
    const payment = await Payment.create({
      userId: req.user.id,
      courseId: course.id,
      amount: course.price,
      currency: course.currency
    });

    const paymentUrl = await createPaymentUrl({
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.id,
      customerEmail: req.user.email
    });

    return res.json({ paymentId: payment.id, paymentUrl });
  } catch (error) {
    return next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    const payment = await Payment.findByPk(reference);
    if (!payment) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }
    const verification = await verifyPayment(reference);
    await payment.update({
      status: verification.status,
      lengoPayReference: verification.providerReference
    });
    return res.json({ status: payment.status });
  } catch (error) {
    return next(error);
  }
};

const listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll();
    return res.json(payments);
  } catch (error) {
    return next(error);
  }
};

module.exports = { initiatePayment, confirmPayment, listPayments };
