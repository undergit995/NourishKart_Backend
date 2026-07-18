const cartModel = require("../../Model/cartModel");
const couponModel = require("../../Model/couponModel");
const ProductModel = require("../../Model/ProductModel");

async function setCart(req, res) {
    try {
        let body = req.body;

        if (!body) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        let existingItem = await cartModel.findOneAndUpdate(
            { product: body.product, customer: body.customer },
            { $inc: { quantity: body.quantity } },
            { returnDocument: 'after' }
        );

        if (existingItem) {
            return res.status(200).json({
                message: "Item added to existing cart item",
                existingItem
            });
        }

        let product = await ProductModel.findById(body.product);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        let cartItem = (await cartModel.create(body));

        if (!cartItem) {
            return res.status(400).json({
                message: "Something went wrong"
            });
        }

        cartItem.cartTotal = (product.price - (product.price * product.discount) / 100) * cartItem.quantity;
        await cartItem.populate("product");
        await cartItem.save();

        res.status(200).json({
            message: "Added to cart successfully",
            cartItem
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function deleteItem(req, res) {
    try {
        let id = req.params.id;
        let existing = await cartModel.findByIdAndDelete(id);

        if (!existing) {
            return res.status(400).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item deleted successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function setQuantity(req, res) {
    try {
        let cartId = req.params.id;
        let body = req.body;

        if (!body) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (body.quantity == 0) {
            await cartModel.findByIdAndDelete(cartId);
            return res.status(200).json({
                message: "Item deleted successfully"
            });
        }

       

        let cartItem = await cartModel.findByIdAndUpdate(cartId, { quantity: body.quantity }, { new: true }).populate("product");

        let cartTotal = 0;
        const product = cartItem.product;
        if (product) {
            const basePrice = Number(product.price) || 0;
            const discountPercent = Number(product.discount) || 0;
            const priceAfterProductDiscount = discountPercent > 0
                ? basePrice - (basePrice * discountPercent) / 100
                : basePrice;

            cartTotal = priceAfterProductDiscount * cartItem.quantity;
        }

        cartItem.cartTotal = cartTotal;
        await cartItem.save();


        res.status(200).json({
            message: "Quantity updated successfully",
            cartItem
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function getCart(req, res) {
    try {
        let userId = req.userId;
        let cart = await cartModel.find({ customer: userId })
            .populate("product")
            .populate("coupon")
            .populate("unifiedCoupon");

        if (!cart || cart.length === 0) {
            return res.status(400).json({
                message: "No items found"
            });
        }

        if (!cart) { // .find() returns [], so check for null/undefined just in case
            return res.status(200).json({
                message: "Cart is empty",
                cart: [],
                totals: { subtotal: 0, totalDiscount: 0, finalTotal: 0 }
            });
        }

        // Normalize the coupon data so the frontend doesn't have to worry about it.
        // We'll ensure the `coupon` field always has the right data.
        let subtotal = 0;
        let totalProductDiscount = 0;
        let finalTotal = 0;

        const validCartItems = cart.filter(item => item.product);

        const processedCart = validCartItems.map(item => {
            const itemJson = item.toJSON();

            // Normalize coupon data for frontend
            if (itemJson.isUnified && itemJson.unifiedCoupon) {
                itemJson.coupon = itemJson.unifiedCoupon;
            }
            delete itemJson.unifiedCoupon; // Clean up for frontend

            // Calculate totals for each item
            if (item.product) {
                const basePrice = Number(item.product.price) || 0;
                const productDiscountPercent = Number(item.product.discount) || 0;
                const productDiscountAmount = (basePrice * productDiscountPercent / 100) * item.quantity;
                const priceAfterProductDiscount = (basePrice * item.quantity) - productDiscountAmount;

                totalProductDiscount += productDiscountAmount;
                subtotal += priceAfterProductDiscount;
            }

            return itemJson;
        })

        // Calculate coupon discount if a coupon is applied
        let totalCouponDiscount = 0;
        const activeCoupon = processedCart.length > 0 ? processedCart[0].coupon : null;

        if (activeCoupon) {
            const couponDiscountPercent = Number(activeCoupon.discount) || 0;
            let couponDiscount = (subtotal * couponDiscountPercent) / 100;

            if (activeCoupon.max_discount && couponDiscount > activeCoupon.max_discount) {
                couponDiscount = activeCoupon.max_discount;
            }
            totalCouponDiscount = couponDiscount;
        }

        const totalDiscount = totalProductDiscount + totalCouponDiscount;
        finalTotal = subtotal - totalCouponDiscount;

        res.status(200).json({
            message: "Items fetched successfully",
            cart: processedCart,
            totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                totalDiscount: parseFloat(totalDiscount.toFixed(2)),
                finalTotal: parseFloat(finalTotal.toFixed(2))
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function applyCoupon(req, res) {
    try {
        let { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({
                message: "Coupon code is required"
            });
        }

        let coupon = await couponModel.findOne({ code: couponCode });

        if (!coupon) {
            return res.status(404).json({
                message: "Coupon not found"
            });
        }

        const now = new Date();
        if (coupon.status !== "Active" || now < coupon.starts_At || now > coupon.ends_At) {
            return res.status(400).json({
                message: "This coupon is either invalid or has expired."
            });
        }

        let cartItems = await cartModel.find({ customer: req.userId }).populate("product");

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        const couponId = coupon._id;

        // If cart has more than one item, apply a unified coupon across the cart
        if (cartItems.length > 1) {
            // calculate subtotal (considering product-level discounts and quantity)
            let subtotal = 0;
            let totalProductDiscount = 0;
            const entries = [];
            for (const item of cartItems) {
                const product = item.product;
                const basePrice = Number(product.price) || 0;
                const productDiscountPercent = Number(product.discount) || 0;
                const priceAfterProductDiscount = productDiscountPercent > 0
                    ? basePrice - (basePrice * productDiscountPercent) / 100
                    : basePrice;
                
                totalProductDiscount += (basePrice - priceAfterProductDiscount) * item.quantity;
                const lineTotal = priceAfterProductDiscount * (item.quantity || 1);
                subtotal += lineTotal;
                entries.push({ item, priceAfterProductDiscount, lineTotal });
            }

            // validate coupon status and min order value
            const minOrderValue = Number(coupon.min_order_value) || 0;
            if (subtotal < minOrderValue) {
                return res.status(400).json({ message: `Coupon requires minimum order value of ${minOrderValue}` });
            }

            const couponPercent = Number(coupon.discount) || 0;
            let totalCouponDiscount = (subtotal * couponPercent) / 100;
            const maxDiscount = Number(coupon.max_discount);
            if (!Number.isNaN(maxDiscount)) {
                totalCouponDiscount = Math.min(totalCouponDiscount, maxDiscount);
            }

            // apply proportional coupon discount to each cart item and mark unified
            const updatedCartItems = [];
            let finalTotal = 0;
            for (const entry of entries) {
                const share = subtotal > 0 ? (entry.lineTotal / subtotal) : 0;
                const couponDiscountAmount = Number((totalCouponDiscount * share).toFixed(2));
                const finalLineTotal = Math.max(0, entry.lineTotal - couponDiscountAmount);

                const item = entry.item;
                item.coupon = null; // disable per-item coupon
                item.isUnified = true;
                item.unifiedCoupon = couponId;
                item.cartTotal = finalLineTotal;
                await item.save();

                updatedCartItems.push({
                    product: item.product,
                    quantity: item.quantity,
                    priceAfterProductDiscount: entry.priceAfterProductDiscount,
                    couponDiscountAmount,
                    finalLineTotal
                });

                finalTotal += finalLineTotal;
            }

            const totalDiscount = totalProductDiscount + totalCouponDiscount;

            return res.status(200).json({
                message: "Unified coupon applied to cart successfully",
                coupon,
                products: updatedCartItems,
                totals: {
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
                    finalTotal: parseFloat(finalTotal.toFixed(2))
                }
            });
        }

        // single-item cart: apply coupon per-item as before (use bulk update)
        await cartModel.updateMany(
            { customer: req.userId },
            { $set: { coupon: couponId, isUnified: false, unifiedCoupon: null } }
        );

        // Recalculate totals for the response
        const updatedCart = await cartModel.find({ customer: req.userId }).populate("product coupon");
        let subtotal = 0;
        let totalProductDiscount = 0;
        for (const item of updatedCart) {
            if (item.product) {
                const basePrice = Number(item.product.price) || 0;
                const productDiscountPercent = Number(item.product.discount) || 0;
                const priceAfterProductDiscount = (basePrice * (100 - productDiscountPercent) / 100);
                subtotal += priceAfterProductDiscount * item.quantity;
                totalProductDiscount += (basePrice - priceAfterProductDiscount) * item.quantity;
            }
        }

        let totalCouponDiscount = (subtotal * coupon.discount) / 100;
        if (coupon.max_discount && totalCouponDiscount > coupon.max_discount) {
            totalCouponDiscount = coupon.max_discount;
        }

        const totalDiscount = totalProductDiscount + totalCouponDiscount;
        const finalTotal = subtotal - totalCouponDiscount;

        res.status(200).json({
            message: "Coupon applied to cart successfully",
            coupon,
            cart: updatedCart,
            totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                totalDiscount: parseFloat(totalDiscount.toFixed(2)),
                finalTotal: parseFloat(finalTotal.toFixed(2))
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function removeCoupon(req, res) {
    try {
        const userId = req.userId;

        // Find all cart items for the user
        const cartItems = await cartModel.find({ customer: userId }).populate("product");

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty, no coupon to remove." });
        }

        const updatedCartItems = [];

        // Loop through each item to reset coupon and recalculate cartTotal
        for (const item of cartItems) {
            item.coupon = null;
            item.isUnified = false;
            item.unifiedCoupon = null;

            // Recalculate cartTotal without coupon discount
            const product = item.product;
            if (product) {
                const basePrice = Number(product.price) || 0;
                const discountPercent = Number(product.discount) || 0;
                const priceAfterProductDiscount = discountPercent > 0
                    ? basePrice - (basePrice * discountPercent) / 100
                    : basePrice;

                item.cartTotal = priceAfterProductDiscount * item.quantity;
            } else {
                item.cartTotal = 0; // Or handle as an error if product is missing
            }

            await item.save();
            updatedCartItems.push(item);
        }

        res.status(200).json({
            message: "Coupon removed successfully",
            cart: updatedCartItems,
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
}
module.exports = { setCart, deleteItem, setQuantity, getCart, applyCoupon, removeCoupon };