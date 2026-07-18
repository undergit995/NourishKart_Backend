const ordersModel = require("../../Model/orderModel");

async function getOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { customer: req.userId };

        const totalOrders = await ordersModel.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        let orders = await ordersModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("coupon")
            .populate({
                path: "products.product",
                select: "name price"
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "No orders found"
            });
        }

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: page,
                limit
            }
        })

    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })

    }
}

async function getAllOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalOrders = await ordersModel.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        let orders = await ordersModel.find()
            .sort({ createdAt: -1 }) // Show most recent orders first
            .skip(skip)
            .limit(limit)
            .populate("customer", "name email") // Populate customer details
            .populate("coupon") // Populate the main coupon applied to the order
            .populate({
                path: "products.product",
                select: "name price",
                model: "Product"
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "No orders found"
            })
        }

        res.status(200).json({
            message: "All orders fetched successfully",
            orders,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


async function updateOrderStatus(req, res) {
    try {
        let orderId = req.params.id;
        let { status } = req.body;

        let updatedOrder = await ordersModel.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated", updatedOrder });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function deleteOrder(req, res) {
    try {
        let orderId = req.params.id

        let deletedOrder = await ordersModel.findByIdAndDelete(orderId)
        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found"
            })

        }

        res.status(200).json({
            message: "Order deleted successfully",
            deletedOrder
        })


    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message

        })
    }
}

module.exports = { getOrders, getAllOrders, updateOrderStatus, deleteOrder };