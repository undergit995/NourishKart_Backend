const crypto = require("crypto");
const razorpay = require("../../config/razorpayConfig");
const cartModel = require("../../Model/cartModel");
const { getIo } = require("../../socket");
const ordersModel = require("../../Model/orderModel");
const ProductModel = require("../../Model/ProductModel");
const couponModel = require("../../Model/couponModel");
const dealsModel = require("../../Model/dealsModel");
const addressModel = require("../../Model/addressModel");
const TransactionModel = require("../../Model/transactionModel");

const createOrder = async (req, res) => {
    try {
        const frontendAmount = Number(req.body.amount || req.body.final_price || 0);
        const userId = req.userId;

        if (!frontendAmount || frontendAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount provided from frontend.",
            });
        }

        // --- Server-side Cart Total Calculation ---
        const cartItems = await cartModel.find({ customer: userId }).populate("product coupon unifiedCoupon");

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Cannot create an order.",
            });
        }

        let subtotal = 0;
        for (const item of cartItems) {
            if (!item.product) {
                return res.status(400).json({ success: false, message: `Invalid product found in cart.` });
            }
            const basePrice = Number(item.product.price) || 0;
            const productDiscount = Number(item.product.discount) || 0;
            const priceAfterProductDiscount = productDiscount > 0 ? basePrice - (basePrice * productDiscount / 100) : basePrice;
            subtotal += priceAfterProductDiscount * item.quantity;
        }

        let serverCalculatedTotal = subtotal;
        const coupon = cartItems[0].isUnified ? cartItems[0].unifiedCoupon : cartItems[0].coupon;

        if (coupon) {
            if (coupon.status !== 'Active' || new Date() > new Date(coupon.ends_At)) {
                return res.status(400).json({ success: false, message: "The applied coupon is invalid or has expired." });
            }
            if (subtotal < coupon.min_order_value) {
                return res.status(400).json({ success: false, message: `Order total does not meet the coupon's minimum requirement of ₹${coupon.min_order_value}.` });
            }

            let couponDiscount = (subtotal * coupon.discount) / 100;
            if (coupon.max_discount && couponDiscount > coupon.max_discount) {
                couponDiscount = coupon.max_discount;
            }
            serverCalculatedTotal = subtotal - couponDiscount;
        }

        // Compare frontend amount with server-calculated amount (allowing for minor floating point differences)
        if (Math.abs(serverCalculatedTotal - frontendAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `Price mismatch. Frontend amount: ₹${frontendAmount.toFixed(2)}, Server calculated amount: ₹${serverCalculatedTotal.toFixed(2)}. Please refresh your cart.`,
            });
        }

        const options = {
            amount: Math.round(serverCalculatedTotal * 100), // Use server-calculated amount in paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            coupon_id,
            addressId,
        } = req.body;

        const finalPrice = Number(req.body.final_price ?? req.body.amount ?? 0);

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !addressId ||
            !finalPrice
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment details",
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid Signature",
            });
        }

        const cart = await cartModel.find({ customer: req.userId }).populate("product");

        if (!cart || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        // Enforce unified coupon logic for multi-item carts
        let appliedCouponId = null;
        if (cart.length > 1) {
            // For multi-item carts, use unified coupon only
            if (cart[0].isUnified && cart[0].unifiedCoupon) {
                appliedCouponId = cart[0].unifiedCoupon;
            } else if (coupon_id) {
                // Validate that the coupon is part of a deal
                const deal = await dealsModel.findOne({ coupon: coupon_id });
                if (!deal) {
                    return res.status(400).json({
                        success: false,
                        message: "For multiple items in cart, coupon must be part of a deal",
                    });
                }
                appliedCouponId = coupon_id;
            }
        } else {
            // Single-item cart: use provided coupon or cart's coupon
            appliedCouponId = coupon_id || (cart[0].coupon ? cart[0].coupon : null);
        }

        // Validate coupon if provided
        if (appliedCouponId) {
            const coupon = await couponModel.findById(appliedCouponId);
            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon not found",
                });
            }
            if (coupon.status !== "Active") {
                return res.status(400).json({
                    success: false,
                    message: "Coupon is not active",
                });
            }
        }

        const orderDetails = [];

        for (const item of cart) {
            const productData = item.product;

            if (!productData || !productData._id) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product in cart",
                });
            }

            const product = await ProductModel.findById(productData._id);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product in cart",
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            product.stock -= item.quantity;
            await product.save();

            const discountedPrice =
                product.discount > 0
                    ? product.price - (product.price * product.discount) / 100
                    : product.price;

            orderDetails.push({
                product: product._id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                discounted_price: discountedPrice,
                offer: null,
                image: product.image?.[0] || "",
                quantity: item.quantity,
            });
        }

        if (orderDetails.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid products found for checkout",
            });
        }

        const addressDoc = await addressModel.findOne({ _id: addressId, userId: req.userId });
        if (!addressDoc) {
            return res.status(400).json({
                success: false,
                message: "Address not found for this user",
            });
        }

        const orderData = {
            customer: req.userId,
            products: orderDetails,
            total: finalPrice,
            paymentID: razorpay_payment_id,
            coupon: appliedCouponId || null,
            final_price: finalPrice,
            orderStatus: "order placed",
            shippingAddress: {
                label: addressDoc.label,
                street: addressDoc.street,
                city: addressDoc.city,
                state: addressDoc.state,
                pincode: addressDoc.pincode,
                country: addressDoc.country,
            },
        };

        const createdOrder = await ordersModel.create(orderData);
        await cartModel.deleteMany({ customer: req.userId });

        // Create a transaction history record
        await TransactionModel.create({
            customer: req.userId,
            order: createdOrder._id,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            signature: razorpay_signature,
            amount: finalPrice,
            status: 'success'
        });

        return res.json({
            success: true,
            message: "Payment Verified",
            order: createdOrder,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    try {
        // 1. Validate the webhook signature
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (digest !== signature) {
            return res.status(400).json({ status: "Signature is not valid" });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        // 2. Handle the 'refund.processed' event
        if (event === 'refund.processed') {
            const refundEntity = payload.refund.entity;
            const orderIdFromNotes = refundEntity.notes?.order_id;

            if (orderIdFromNotes) {
                const order = await ordersModel.findById(orderIdFromNotes);

                if (order && order.orderStatus !== 'refunded') {
                    // 3. Update order status to 'refunded'
                    order.orderStatus = 'refunded';
                    if (!order.historyStatuses.includes('refunded')) {
                        order.historyStatuses.push('refunded');
                    }
                    await order.save();

                    // 4. Emit a WebSocket event to notify the frontend
                    getIo().emit("orderUpdate", order);
                    console.log(`Order ${orderIdFromNotes} status updated to refunded.`);
                }
            }
        }

        res.json({ status: "ok" });

    } catch (error) {
        console.error("Error handling Razorpay webhook:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

const refundPayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({
                success: false,
                message: "orderId and amount are required.",
            });
        }

        const refundAmount = Number(amount);
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid refund amount.",
            });
        }

        const order = await ordersModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (refundAmount > order.final_price) {
            return res.status(400).json({
                success: false,
                message: `Refund amount cannot be greater than the order total of ${order.final_price}.`,
            });
        }

        if (!order.paymentID) {
            return res.status(400).json({ success: false, message: "Payment ID not found for this order." });
        }

        if (order.orderStatus === "refunded") {
            return res.status(400).json({ success: false, message: "This order has already been refunded." });
        }

        // Initiate refund with Razorpay
        const refund = await razorpay.payments.refund(order.paymentID, {
            amount: refundAmount * 100, // Amount in paise
            speed: "normal", // or "optimum"
        });

        if (!refund) {
            return res.status(500).json({ success: false, message: "Refund initiation failed." });
        }

        // Update order status in your database
        order.orderStatus = "refunded";
        await order.save();

        res.json({ success: true, message: "Refund processed successfully.", refund });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createOrder, verifyPayment, refundPayment, handleWebhook };