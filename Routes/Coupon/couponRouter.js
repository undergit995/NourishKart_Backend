const express = require('express');
const { setCoupon, deleteCoupon, updateCoupon, couponStatus, getCoupons } = require('../../Controllers/CouponController/couponController');
const router = express.Router();

router.post("/setCoupon",setCoupon)
router.delete("/deleteCoupon/:id",deleteCoupon)
router.put("/updateCoupon/:id",updateCoupon)
router.put("/couponStatus/:id",couponStatus)
router.get("/getCoupons",getCoupons)




module.exports= router