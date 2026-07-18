const express = require("express");
const { getOrders, getAllOrders, updateOrderStatus, deleteOrder } = require("../../Controllers/OrdersController/orders");
const isCustomer = require("../../MiddleWare/customerAuth");
const isAdmin = require("../../MiddleWare/adminAuth");
const router = express.Router();

router.get("/getOrders", isCustomer, getOrders);

router.get("/admin/getAllOrders", isAdmin, getAllOrders);

router.put("/admin/updateOrder/:id", isAdmin, updateOrderStatus);

router.delete("/deleteOrder/:id", isAdmin, deleteOrder);


module.exports = router;   