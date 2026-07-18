const express = require("express");
const { verifyPayment, createOrder, refundPayment, handleWebhook } = require("../../Controllers/RazorPay/razorpayController");
const isCustomer = require("../../MiddleWare/customerAuth");
const isAdmin = require("../../MiddleWare/adminAuth"); // Assuming you have this middleware

const router = express.Router();

router.post("/create-order", isCustomer,createOrder);

router.post("/verify-payment",isCustomer, verifyPayment);

// Route for processing refunds, accessible only by admins
router.post("/refund", isAdmin, refundPayment);

// Route for Razorpay to send webhook events
router.post("/webhook", handleWebhook);

module.exports = router