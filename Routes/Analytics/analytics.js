
const express = require("express");
const router = express.Router();
const { getDashboardSummary, topSellingProducts, leastSellingProducts, businessTrends } = require("../../Controllers/AnalyticsController/adminAnalytics");

router.get("/dashboard-summary", getDashboardSummary);
router.get("/bestSoldProducts", topSellingProducts);
router.get("/leastSoldProducts", leastSellingProducts);
router.get("/businessTrends", businessTrends);

module.exports = router;


// const express = require("express");
// const ordersModel = require("../../Model/orderModel");
// const {analyticsPeriod,analyticSpecific, topSellingProducts, leastSellingProducts, bestSellingProduct,totalCustomers,totalOrders, totalProductsSold, orderStatusSummary, cancelledOrdersAnalytics, topCustomer, businessTrends, getDashboardSummary} = require("../../Controllers/AnalyticsController/adminAnalytics");

// const router = express.Router();

// //getting products analytics for admin API
// router.get("/analytics/:period",analyticsPeriod);

// //getting specific month and year
// router.get("/analyticSpecifc",analyticSpecific)

// //getting best sold products per year month and week
// router.get("/bestSoldProducts",topSellingProducts)

// //getting least sold product
// router.get("/leastSoldProducts",leastSellingProducts)

// //top selling products present
// router.get("/topSellingProducts",bestSellingProduct)

// //getting total customers
// router.get("/totalCustomers",totalCustomers)

// //getting total orders
// router.get("/totalOrders",totalOrders)

// //total products sold
// router.get("/totalProductsSold",totalProductsSold)

// //order status summary
// router.get("/orderStatusSummary",orderStatusSummary)

// //cancelled orders
// router.get("/cancelledOrdersAnalytics",cancelledOrdersAnalytics)

// //getting top customer
// router.get("/topCustomer",topCustomer)

// // Business Trends for Line Chart
// router.get("/businessTrends", businessTrends);

// // Consolidated Dashboard Summary Endpoint
// router.get("/dashboard-summary", getDashboardSummary);

// module.exports = router;