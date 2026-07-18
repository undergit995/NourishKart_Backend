const express = require("express");
const { removeListener } = require("../../Model/orderModel");
const userModel = require("../../Model/userModel");
const ProductModel = require("../../Model/ProductModel");
const ordersModel = require("../../Model/orderModel");
const getTotalDashboard = require("../../Controllers/DashbordgetTotal/DashboardgetTotal");

const router = express.Router();

//getting total products customers and order according to their status to admin dashboard
router.get("/getTotalDashboard", getTotalDashboard);

module.exports = router;
