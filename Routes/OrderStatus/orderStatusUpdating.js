const express = require("express");
const ordersModel = require("../../Model/orderModel");
const {updateOrderStatus,customerCancellingOrder, cancelOrderByAdmin} = require("../../Controllers/OrderStatusController/orderStatus");
const isCustomer = require("../../MiddleWare/customerAuth");

const router = express.Router();

//sending the order status to customer through email
router.post("/updateStatus/:id",updateOrderStatus)

router.post("/customerCancelling/:id",isCustomer,customerCancellingOrder);

router.post("/adminCancelling/:id",cancelOrderByAdmin)

module.exports = router;