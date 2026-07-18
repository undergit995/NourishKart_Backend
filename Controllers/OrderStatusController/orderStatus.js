const ordersModel = require("../../Model/orderModel");
const { getIo } = require("../../socket"); // We will create this helper
const razorpay = require("../../config/razorpayConfig");
const RefundModel = require("../../Model/refundModel");
const transporter = require("../../config/emailConfig");

async function updateOrderStatus(req, res) {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Validation Error: Request body cannot be empty."
            });
        }

        let { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Validation Error: 'status' field is required inside the payload."
            });
        }

        // normalize input (VERY IMPORTANT)
        status = status.trim().toLowerCase();

        const allowedStatuses = [
            "order placed",
            "preparing order",
            "order shipped",
            "order delivered"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`
            });
        }

        // 1. Update only status (no validation issues)
        await ordersModel.updateOne(
            { _id: orderId },
            { 
                $set: { orderStatus: status },
                $addToSet: { historyStatuses: status } // Add to history, avoids duplicates
            }
        );

        // 2. Fetch fresh updated order
        const updatedOrder = await ordersModel.findById(orderId).populate("customer").populate("products.product");

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        let subject = "";
        let html = "";
        let productsHtml = "";

        updatedOrder.products.forEach(item => {
            productsHtml += `
            <div style="
            display:flex;
            align-items:center;
            border:1px solid #ddd;
            padding:10px;
            margin-bottom:10px;
            border-radius:8px;
        ">
            <img
                src="${item.image}"
                alt="${item.product?.name || 'Product'}"
                style="
                    width:80px;
                    height:80px;
                    object-fit:cover;
                    border-radius:8px;
                    margin-right:15px;
                "
            />

            <div>
                <h4 style="margin:0;">
                    ${item.product?.name || "Product"}
                </h4>

                <p style="margin:5px 0;">
                    Quantity: ${item.quantity}
                </p>

                <p style="margin:5px 0;">
                    Price: ₹${item.price}
                </p>

                ${item.discounted_price
                    ? `<p style="margin:5px 0;">
                        Discounted Price: ₹${item.discounted_price}
                       </p>`
                    : ""
                }
            </div>
        </div>
            `
        })

        switch (status) {
            case "order placed":
                subject = "Order Placed Successfully 🎉";
                html = `
                    <div style="font-family:Arial;padding:20px">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIZmP2iJmKKDGP2QGEaW4Ylfqv4ZiKrRWSrw&s"
                     alt="Order placed" 
                     style="width:100%;max-width:600px;border-radius:10px"
                      />
                        <h2>Hello ${updatedOrder.customer?.name || "Customer"}</h2>
                        <p>Your order has been placed successfully.</p>
                        <p><b>Order ID:</b> ${updatedOrder._id}</p>
                        <hr>
                        <h3>products you orders</h3>
                        ${productsHtml}
                        <hr/>
                        <a
                         href="http://localhost:5173/orders/${updatedOrder._id}"
                          style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#28a745;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Track Your Order
        </a>

        &nbsp;

        <a
            href="http://localhost:5173"
            style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#007bff;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Visit Website
        </a>

    </div>
                `;
                break;

            case "preparing order":
                subject = "Your Order is Being Prepared 👨‍🍳";
                html = `
                    <div style="font-family:Arial;padding:20px">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIZmP2iJmKKDGP2QGEaW4Ylfqv4ZiKrRWSrw&s" 
                    alt="order is getting prepared" 
                    style="width:100%;max-width:600px;border-radius:10px" />
                        <h2>Hello ${updatedOrder.customer?.name || "Customer"}</h2>
                        <p>Your order is currently being prepared.</p>
                        <p><b>Order ID:</b> ${updatedOrder._id}</p>
                         <h3>products you orders</h3>
                        ${productsHtml}
                        <hr/>
                        <a
                         href="http://localhost:5173/orders/${updatedOrder._id}"
                          style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#28a745;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Track Your Order
        </a>

        &nbsp;

        <a
            href="http://localhost:5173"
            style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#007bff;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Visit Website
        </a>

    </div>
                `;
                break;

            case "order shipped":
                subject = "Your Order Has Been Shipped 🚚";
                html = `
                    <div style="font-family:Arial;padding:20px">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIZmP2iJmKKDGP2QGEaW4Ylfqv4ZiKrRWSrw&s"
                     alt="Order shipped" 
                     style="width:100%;max-width:600px;border-radius:10px"
                      />
                        <h2>Hello ${updatedOrder.customer?.name || "Customer"}</h2>
                        <p>Your order has been shipped and is on the way.</p>
                        <p><b>Order ID:</b> ${updatedOrder._id}</p>
                        <h3>products you orders</h3>
                        ${productsHtml}
                        <hr/>
                        <a
                         href="http://localhost:5173/orders/${updatedOrder._id}"
                          style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#28a745;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Track Your Order
        </a>

        &nbsp;

        <a
            href="http://localhost:5173"
            style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#007bff;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Visit Website
        </a>

    </div>
                `;
                break;

            case "order delivered":
                subject = "Order Delivered ✅";
                html = `
                    <div style="font-family:Arial;padding:20px">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIZmP2iJmKKDGP2QGEaW4Ylfqv4ZiKrRWSrw&s"
                     alt="Order deliverd"
                      style="width:100%;max-width:600px;border-radius:10px" 
                      />
                        <h2>Hello ${updatedOrder.customer?.name || "Customer"}</h2>
                        <p>Your order has been delivered successfully.</p>
                        <p><b>Order ID:</b> ${updatedOrder._id}</p>
                         <h3>products you orders</h3>
                        ${productsHtml}
                        <hr/>
                        <a
                         href="http://localhost:5173/orders/${updatedOrder._id}"
                          style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#28a745;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Track Your Order
        </a>

        &nbsp;

        <a
            href="http://localhost:5173"
            style="
                display:inline-block;
                padding:12px 20px;
                margin-top:10px;
                background:#007bff;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            "
        >
            Visit Website
        </a>

    </div>
                `;
                break;


            default:
                return res.status(400).json({
                    message: "Invalid status"
                });
        }

        // 4. Send email safely
        if (updatedOrder?.customer?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: updatedOrder.customer.email,
                subject,
                html
            });
        }

        return res.status(200).json({
            message: "Order status updated and email sent successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

//customer cancelling the order
async function customerCancellingOrder(req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.userId;

        const order = await ordersModel.findById(orderId)
            .populate("customer")
            .populate("products.product");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ensure only owner can cancel
        if (order.customer._id.toString() !== userId) {
            return res.status(403).json({
                message: "You can only cancel your own order"
            });
        }

        // prevent cancelling an already cancelled order
        if (order.orderStatus === "order cancelled") {
            return res.status(400).json({
                message: "Order is already cancelled"
            });
        }
        const originalStatus = order.orderStatus;

        // prevent cancellation after shipping
        const hasBeenShipped = order.historyStatuses?.some(s => ["order shipped", "order delivered"].includes(s.toLowerCase()));

        if (hasBeenShipped) {
            return res.status(400).json({
                message: "Order cannot be cancelled as it has already been processed for shipping."
            });
        }

        const reason = req.body.reason || "Cancelled by customer";

        // --- Refund Logic ---
        let refundAmount = order.final_price;
        let cancellationFee = 0;

        // Deduct 1/3 if cancelled after preparation has started
        if (originalStatus === "preparing order") {
            cancellationFee = Math.round(order.final_price / 3);
            refundAmount = order.final_price - cancellationFee;
        }

        // Security check: ensure refund amount never exceeds the paid amount
        if (refundAmount > order.final_price) {
            return res.status(400).json({
                message: "Invalid refund amount calculated. Cannot refund more than the paid amount."
            });
        }

        let refund = null;
        if (refundAmount > 0 && order.paymentID) { // Check for paymentID before attempting refund
            try {
                refund = await razorpay.payments.refund(order.paymentID, {
                    amount: Math.round(refundAmount * 100), // Amount in paise (must be an integer)
                    speed: "normal",
                    notes: {
                        reason: `Customer cancellation: ${reason}`,
                        order_id: orderId,
                        cancellation_fee: cancellationFee
                    }
                });
            } catch (refundError) {
                console.error("Razorpay refund failed:", refundError);
                return res.status(500).json({ message: "Refund processing failed. Please contact support.", error: refundError.message });
            }

            // Create a new record in the Refund collection
            await RefundModel.create({
                order: orderId,
                paymentId: order.paymentID,
                refundId: refund.id,
                amount: refundAmount,
                cancellationFee: cancellationFee,
                notes: refund.notes
            });
        }
        // --- End Refund Logic ---

        await ordersModel.updateOne(
            { _id: orderId },
            {
                $set: { // The $set operator updates the main fields
                    orderStatus: "refund pending",
                    cancelledBy: "customer",
                    cancelReason: reason,
                    cancelledAt: new Date(),
                    refundId: refund ? refund.id : null,
                    refundAmount: refundAmount,
                    cancellationFee: cancellationFee,
                },
                $addToSet: { historyStatuses: "order cancelled" } // $addToSet is a separate top-level operator
            }
        );

        const updatedOrder = await ordersModel.findById(orderId);

        let productsHtml = "";

        order.products.forEach(p => {
            productsHtml += `
                <div 
                style=
                "display:flex;
                align-items:center;
                margin-bottom:10px;
                border:1px solid #eee;
                padding:10px;
                border-radius:8px;">
                    <img src="${p.image}" 
                    style=
                    "width:70px;
                    height:70px;
                    object-fit:cover;
                    border-radius:8px;
                    margin-right:10px;" />
                    <div>
                        <h4 style="margin:0;">${p.product?.name}</h4>
                        <p style="margin:2px 0;">Qty: ${p.quantity}</p>
                        <p style="margin:2px 0;">Price: ₹${p.price}</p>
                    </div>
                </div>
            `;
        });

        const html = `
        <div
        style="font-family:Arial;
        max-width:700px;
        margin:auto;
        border:1px solid #ffcccc;
        border-radius:10px;
        overflow:hidden">

            <div 
            style="background:#dc3545;
            color:white;
            padding:20px;
            text-align:center">
             <h1>❌ Order Cancelled</h1>
            </div>

            <div style="padding:20px">

                <h2 style="color:#dc3545;">
                    Hello ${order.customer.name}
                </h2>

                <p>Your order has been cancelled successfully.</p>

                <p><b>Order ID:</b> ${order._id}</p>

                <div style=
                "background:#fff5f5;
                border-left:5px solid #dc3545;
                padding:10px;
                margin:15px 0;">
                    <b style="color:#dc3545;">Cancellation Reason:</b><br/>
                    ${reason}
                </div>

                <div style="background:#fffbe6; border-left:5px solid #f59e0b; padding:10px; margin:15px 0;">
                    <p style="margin:0;"><b>Original Amount:</b> ₹${order.final_price.toLocaleString()}</p>
                    ${cancellationFee > 0 ? `<p style="margin:5px 0; color: #b45309;"><b>Cancellation Fee:</b> - ₹${cancellationFee.toLocaleString()}</p>` : ''}
                    <p style="margin:5px 0 0 0; font-weight:bold;">
                        Refunded Amount: ₹${refundAmount.toLocaleString()}
                    </p>
                </div>



                <h3>Products</h3>
                ${productsHtml}

                <hr/>

                <p><b>Total:</b> ₹${order.total}</p>
                <p><b>Final Price:</b> ₹${order.final_price}</p>

                <a href="http://localhost:5173/orders/${order._id}"
                    style="display:inline-block;
                    background:#dc3545;
                    color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:5px;
                    margin-top:10px;">
                    View Order
                </a>

                <a href="http://localhost:5173"
                    style="display:inline-block;
                    background:#6c757d;color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:5px;
                    margin-top:10px;
                    margin-left:10px;">
                    Visit Website
                </a>

            </div>
        </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: order.customer.email,
            subject: "Order Cancelled ❌",
            html
        });

        // Emit a socket event for real-time update
        getIo().emit("orderUpdate", updatedOrder);

        res.json({
            message: "Order cancelled successfully. A refund has been initiated.",
            order: updatedOrder,
            refundDetails: {
                paidAmount: order.final_price,
                cancellationFee: cancellationFee,
                refundedAmount: refundAmount
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

//admin cancelling the order
async function cancelOrderByAdmin(req, res) {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const order = await ordersModel.findById(orderId)
            .populate("customer")
            .populate("products.product")
            .populate("shippingAddress");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.orderStatus === "order cancelled") {
            return res.status(400).json({
                message: "Order is already cancelled"
            });
        }

        const reason = req.body.reason || "Cancelled by admin";

        // --- Full Refund Logic for Admin Cancellation ---
        let refundAmount = order.final_price;
        let refund = null;

        // Security check: ensure refund amount never exceeds the paid amount
        if (refundAmount > order.final_price) {
            return res.status(400).json({
                message: "Invalid refund amount calculated. Cannot refund more than the paid amount."
            });
        }

        if (refundAmount > 0 && order.paymentID) {
            try {
                refund = await razorpay.payments.refund(order.paymentID, {
                    amount: Math.round(refundAmount * 100), // Amount in paise (must be an integer)
                    speed: "normal",
                    notes: {
                        reason: `Admin cancellation: ${reason}`,
                        order_id: orderId
                    }
                });
            } catch (refundError) {
                console.error("Razorpay refund failed (Admin):", refundError);
                return res.status(500).json({ message: "Refund processing failed. Please contact support.", error: refundError.message });
            }

            // Create a new record in the Refund collection for admin cancellation
            await RefundModel.create({
                order: orderId,
                paymentId: order.paymentID,
                refundId: refund.id,
                amount: refundAmount,
                cancellationFee: 0,
                notes: refund.notes
            });
        }
        // --- End Refund Logic ---

        await ordersModel.updateOne(
            { _id: orderId },
            {
                orderStatus: "refund pending",
                cancelledBy: "admin",
                cancelReason: reason,
                cancelledAt: new Date(),
                refundId: refund ? refund.id : null,
                refundAmount: refundAmount,
                cancellationFee: 0, // No fee for admin cancellation
                $addToSet: { historyStatuses: "order cancelled" }
            }
        );

        // Fetch the fully updated order to return in the response
        const updatedOrder = await ordersModel.findById(orderId);

        let productsHtml = "";

        order.products.forEach(p => {
            productsHtml += `
                <div style="
                    display:flex;
                    align-items:center;
                    margin-bottom:10px;
                    border:1px solid #eee;
                    padding:10px;
                    border-radius:8px;
                ">
                    <img src="${p.image}"
                        style="
                            width:70px;
                            height:70px;
                            object-fit:cover;
                            border-radius:8px;
                            margin-right:10px;
                        "
                    />

                    <div>
                        <h4 style="margin:0;">
                            ${p.product?.name || "Product"}
                        </h4>
                        <p style="margin:2px 0;">Qty: ${p.quantity}</p>
                        <p style="margin:2px 0;">Price: ₹${p.price}</p>
                    </div>
                </div>
            `;
        });

        const html = `
        <div style="
            font-family:Arial;
            max-width:700px;
            margin:auto;
            border:1px solid #ffe0e0;
            border-radius:10px;
            overflow:hidden;
        ">

            <!-- HEADER -->
            <div style="
                background:#b02a37;
                color:white;
                padding:20px;
                text-align:center;
            ">
                <h1>🚫 Order Cancelled by Admin</h1>
            </div>

            <!-- BODY -->
            <div style="padding:20px">

                <h2 style="color:#b02a37;">
                    Hello ${order.customer?.name || "Customer"}
                </h2>

                <p>
                    Your order has been cancelled by our team.
                </p>

                <p><b>Order ID:</b> ${order._id}</p>

                <!-- REASON -->
                <div style="
                    background:#fff0f0;
                    border-left:5px solid #b02a37;
                    padding:10px;
                    margin:15px 0;
                ">
                    <b style="color:#b02a37;">Cancellation Reason:</b><br/>
                    ${reason}
                </div>

                <!-- REFUND DETAILS -->
                <div style="background:#e6f7ff; border-left:5px solid #007bff; padding:10px; margin:15px 0;">
                    <p style="margin:0; font-weight:bold;">A full refund of ₹${refundAmount.toLocaleString()} has been processed.</p>
                    ${refund ? `<p style="margin:5px 0 0 0; font-size:12px; color:#555;">Refund ID: ${refund.id}</p>` : ''}
                </div>

                <!-- PRODUCTS -->
                <h3>Products</h3>
                ${productsHtml}

                <hr/>

                <p><b>Total:</b> ₹${order.total}</p>
                <p><b>Final Price:</b> ₹${order.final_price}</p>

                <!-- BUTTONS -->
                <a href="http://localhost:5173/orders/${order._id}"
                    style="
                        display:inline-block;
                        background:#b02a37;
                        color:white;
                        padding:12px 20px;
                        text-decoration:none;
                        border-radius:5px;
                        margin-top:10px;
                    ">
                    View Order
                </a>

                <a href="http://localhost:5173"
                    style="
                        display:inline-block;
                        background:#6c757d;
                        color:white;
                        padding:12px 20px;
                        text-decoration:none;
                        border-radius:5px;
                        margin-top:10px;
                        margin-left:10px;
                    ">
                    Visit Website
                </a>

            </div>

        </div>
        `;


        if (order.customer?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: order.customer.email,
                subject: "Order Cancelled by Admin 🚫",
                html
            });
        }

        // Emit a socket event for real-time update
        getIo().emit("orderUpdate", updatedOrder);

        return res.status(200).json({
            message: "Order cancelled by admin and email sent successfully",
            order: updatedOrder,
            refundDetails: {
                paidAmount: order.final_price,
                cancellationFee: 0,
                refundedAmount: refundAmount
            }
        });

    } catch (error) {
        console.error("Admin cancel error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}




module.exports = { updateOrderStatus, customerCancellingOrder, cancelOrderByAdmin };