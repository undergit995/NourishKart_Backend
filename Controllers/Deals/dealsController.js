const Product = require("../../Model/ProductModel");
const offerModel = require("../../Model/offerModel");
const couponModel = require("../../Model/couponModel");
const dealsModel = require("../../Model/dealsModel");

async function setDeal(req, res) {
    try {
        const products = req.body.products || req.body.product;
        const { offer, coupon } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required' });
        }

        const existingOffer = await offerModel.findById(offer);
        if (!existingOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        const existingCoupon = await couponModel.findById(coupon);
        if (!existingCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const validatedProductIds = [];
        for (const productId of products) {
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ message: `Product not found: ${productId}` });
            }
            validatedProductIds.push(existingProduct._id);
        }

        const deal = await dealsModel.create({
            products: validatedProductIds,
            offer: existingOffer._id,
            coupon: existingCoupon._id
        });

        res.status(200).json({ message: 'Deal set successfully', deal });
    } catch (error) {
        console.error('Error setting deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function updateDeal(req, res) {
    try {
        const { productId } = req.params;
        const { offer, coupon } = req.body;

        const deal = await dealsModel.findOne({ products: productId });
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found for this product' });
        }

        if (offer) {
            const existingOffer = await offerModel.findById(offer);
            if (!existingOffer) {
                return res.status(404).json({ message: 'Offer not found' });
            }
            deal.offer = existingOffer._id;
        }

        if (coupon) {
            const existingCoupon = await couponModel.findById(coupon);
            if (!existingCoupon) {
                return res.status(404).json({ message: 'Coupon not found' });
            }
            deal.coupon = existingCoupon._id;
        }

        await deal.save();

        res.status(200).json({ message: 'Deal updated successfully', deal });
    } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



async function removeDeal(req, res) {
    try {
        const { productId } = req.params;

        const deal = await dealsModel.findOne({ products: productId });
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found for this product' });
        }

        if (deal.products.length > 1) {
            deal.products = deal.products.filter(id => String(id) !== String(productId));
            await deal.save();
            return res.status(200).json({ message: 'Product removed from deal', deal });
        }

        await dealsModel.findByIdAndDelete(deal._id);
        res.status(200).json({ message: 'Deal removed successfully' });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

async function applydeal(req, res) {    
    try {
        const { productsList, offerId, couponId } = req.body;

        if (!Array.isArray(productsList) || productsList.length === 0) {
            return res.status(400).json({
                message: "productsList is required and must contain at least one product"
            });
        }

        const updatedProducts = [];
        let orderPrice = 0;
        let subtotal = 0;

        let coupon = null;
        if (couponId) {
            coupon = await couponModel.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ message: "Coupon not found" });
            }
        }

        const productEntries = [];
        for (const productId of productsList) {
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${productId}`
                });
            }

            const dealQuery = { products: productId };
            if (offerId) dealQuery.offer = offerId;
            if (couponId) dealQuery.coupon = couponId;
            const matchingDeal = await dealsModel.findOne(dealQuery);

            if ((offerId || couponId) && !matchingDeal) {
                return res.status(400).json({
                    message: `Deal does not exist for product: ${productId}`
                });
            }

            const basePrice = Number(product.price) || 0;
            const productDiscountPercent = Number(product.discount) || 0;
            const productDiscountAmount = (basePrice * productDiscountPercent) / 100;
            const priceAfterProductDiscount = basePrice - productDiscountAmount;

            subtotal += priceAfterProductDiscount;
            productEntries.push({
                product,
                basePrice,
                productDiscountAmount,
                priceAfterProductDiscount,
            });
        }

        let totalCouponDiscount = 0;
        if (coupon) {
            if (coupon.status !== "Active") {
                return res.status(400).json({
                    message: "Coupon is not active"
                });
            }

            const minOrderValue = Number(coupon.min_order_value) || 0;
            if (subtotal < minOrderValue) {
                return res.status(400).json({
                    message: `Coupon requires minimum order value of ${minOrderValue}`
                });
            }

            const couponPercent = Number(coupon.discount) || 0;
            totalCouponDiscount = (subtotal * couponPercent) / 100;
            const maxDiscount = Number(coupon.max_discount);
            if (!Number.isNaN(maxDiscount)) {
                totalCouponDiscount = Math.min(totalCouponDiscount, maxDiscount);
            }
        }

        for (const entry of productEntries) {
            const couponDiscountAmount = coupon
                ? Number(((totalCouponDiscount * entry.priceAfterProductDiscount) / subtotal).toFixed(2))
                : 0;
            const finalPrice = Math.max(0, entry.priceAfterProductDiscount - couponDiscountAmount);

            updatedProducts.push({
                productId: entry.product._id,
                name: entry.product.name,
                originalPrice: entry.basePrice,
                productDiscountAmount: entry.productDiscountAmount,
                priceAfterProductDiscount: entry.priceAfterProductDiscount,
                couponDiscountAmount,
                finalPrice,
            });

            orderPrice += finalPrice;
        }

        res.status(200).json({
            message: "Deal applied successfully",
            products: updatedProducts,
            orderPrice
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


module.exports = {
    setDeal,
    updateDeal,
    removeDeal,
    applydeal
};