const express = require("express");
const { setCart, deleteItem, setQuantity, getCart, applyCoupon, removeCoupon } = require("../../Controllers/CartControllers/cart");
const router = express.Router();

router.post("/setCart", setCart);
router.delete("/deleteItem/:id", deleteItem);
router.put("/setQuantity/:id", setQuantity);
router.get("/getCart", getCart);
router.post("/apply-coupon", applyCoupon);
router.delete("/remove-coupon", removeCoupon);


module.exports = router;