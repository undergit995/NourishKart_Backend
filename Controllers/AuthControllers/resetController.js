const userModel = require("../../Model/userModel");
const transporter = require("../../config/emailConfig");
const otpModel = require("../../Model/otpModel");
const emailSender = require("../../Utils/emailSender");
const resetModel = require("../../Model/ResetModel");
const { regController } = require("./regController");
const { regToken } = require("../../Utils/TokenGenerator");
const bcrypt = require("bcrypt");
const decodeToken = require("../../Utils/decodeToken");

async function forgotPassword(req,res) {
     try {
        let body = req.body;

        if (!body.email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
       

        let user = await userModel.findOne({ email: body.email })

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        let existingOtp = await otpModel.findOne({ email: user.email })

        if (existingOtp) {
            return res.status(400).json({
                message:"otp is already sent"
            })
        }
        
        //creating OTP
        let info = await emailSender(user);

        if (!info) {
            return res.status(400).json({
                message: "Failed to send OTP",
            });
        }

        
        let setOtp = await otpModel.create({
            otp: info.otp,
            email: user.email
        })
    
        if (!setOtp) {
            return res.status(400).json({
                message: "Failed to generate OTP",

            });

        }


        let token = regToken( user.email );

        if (!token) {
            return res.status(400).json({
                message: "Something went wrong"
            })
        }


     

        res.status(200).json({
            message: "OTP sent Please check your email",
            token: token,
            

        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });

    }

}

async function VerifyOtp(req,res) {
    try {
        let head = req.headers.authorization;
        let token = head.split(" ")[1];
        let body = req.body;

        let decoded = decodeToken(token, res);
        if (res.headersSent) return;

        let result = await otpModel.findOne({ otp: body.otp, email: decoded.email })
        
        if (!result) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        const deletedOtp = await otpModel.findOneAndDelete({ otp: body.otp, email: decoded.email });

        if (!deletedOtp) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                
            });
        }

        res.status(200).json({
            message: "Otp verified successfully",
            
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function resetPassword(req,res){
     try {
        let head = req.headers.authorization;
        let token = head.split(" ")[1];


        let decoded = decodeToken(token, res);
        if (res.headersSent) return;

        
        let body = req.body;

        if (!body.password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        let user = await userModel.findOne({email:decoded.email});
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        user.password = hashedPassword;

        await user.save(); 

        let clearReset =await resetModel.deleteOne({user:user._id})
        if(!clearReset){
              return res.status(400).json({
                message:"Something went wrong"
            })
        }

        res.status(200).json({
            message: "Password reset successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }

}
    

module.exports = { forgotPassword, VerifyOtp, resetPassword };