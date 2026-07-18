const express = require('express');
const { regController,verifyOtp, verifyEmail } = require('../../Controllers/AuthControllers/regController');
const router = express.Router();

router.post("/register",regController)
router.post("/verifyOtp",verifyOtp)
router.post("/verifyEmail",verifyEmail)



module.exports = router;