const express = require("express");
const userModel = require("../../Model/userModel");
const ProductModel = require("../../Model/ProductModel");
const ordersModel = require("../../Model/orderModel");

async function getTotalDashboard(req,res) {
    try {
    const totalCustomers = await userModel.countDocuments({role: "customer" 
    });
    const totalProducts = await ProductModel.countDocuments();
    const totalOrders = await ordersModel.countDocuments();
    const orderStatusCounts = await ordersModel.aggregate([
        {
            $group: {
                _id: "$orderStatus",
                count: { $sum: 1 }
            }
        }
    ]);
    
    let orderStatusCountMap = {
        "order placed": 0,
        "preparing order": 0,
        "order shipped": 0,
        "order delivered": 0,
        "order cancelled": 0
    };
    orderStatusCounts.forEach((item) => {
        orderStatusCountMap[item._id] = item.count;
    });
    res.status(200).json({
        totalCustomers,
        totalProducts,
        totalOrders,
        orderStatusCountMap
    });

} catch (error) {
    res.status(500).json({
        message: "Internal Server Error",
        error: error.message
    });
}
};
module.exports = getTotalDashboard;