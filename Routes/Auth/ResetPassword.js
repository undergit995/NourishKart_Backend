const express = require("express");
const router = express.Router();
const { forgotPassword, VerifyOtp, resetPassword } = require("../../Controllers/AuthControllers/resetController");

//forgot Password
router.post("/forgotpassword",forgotPassword );

//verifying otp
router.post("/VerifyOtp",VerifyOtp);

//reset password

router.post("/resetpassword", resetPassword)






module.exports = router;