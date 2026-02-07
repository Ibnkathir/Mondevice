const { v4: uuidv4 } = require("uuid");

const createPaymentUrl = async ({ amount, currency, reference, customerEmail }) => {
  const baseUrl = process.env.LENGOPAY_BASE_URL || "https://sandbox.lengopay.io/pay";
  const token = uuidv4();
  return `${baseUrl}?amount=${amount}&currency=${currency}&reference=${reference}&customer=${customerEmail}&token=${token}`;
};

const verifyPayment = async (reference) => {
  return {
    status: "PAID",
    providerReference: `LP-${reference}`
  };
};

module.exports = { createPaymentUrl, verifyPayment };
