const userModel = require("../../Model/userModel");
const otpModel = require("../../Model/otpModel");
const transporter = require("../../config/emailConfig");
const emailSender = require("../../Utils/emailSender");
const { regToken } = require("../../Utils/TokenGenerator");
const decodeToken = require("../../Utils/decodeToken");
const bcrypt = require("bcrypt");


async function verifyEmail(req, res) {
    try {
        let body = req.body;
        if(!body.email){
            return res.status(400).json({
                message:"Email is required"
            })
        }
        let user = await userModel.findOne({email:body.email})
        if(user){
            return res.status(403).json({
                message:"User already exists"
            })

        }
         let existingOtp = await otpModel.findOne({ email: body.email })

        if (existingOtp) {
            return res.status(404).json({
                message: "otp is already sent"

            })
        }
        let info = await emailSender( body)


        if (!info) {
            return res.status(400).json({
                message: "Something went wrong"
            })
        }

        let setOtp = await otpModel.create({
            otp: info.otp,
            email : body.email
        })

        if (!setOtp) {
            return res.status(400).json({
                message: "Something went wrong"
            })
        }

        res.status(200).json({
            message:"otp sent successfully",
            
        })


    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

async function verifyOtp(req, res) {
    try {

    
        let body = req.body;
        if (!body.otp) {
            return res.status(400).json({
                message: "OTP is required"
            });
        }

        const deletedOtp = await otpModel.findOneAndDelete({ otp: body.otp });

        if (!deletedOtp) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

         // Pass only the email string to regToken, not an object.
         let token = regToken(deletedOtp.email);

         if(!token){
            return res.status(400).json({
                message:"Something went wrong"
            })
         }


        res.status(200).json({
            message: "OTP verified successfully",
            token:token

        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}



async function regController(req, res) {
    try {
        let body = req.body;
        let head = req.headers.authorization;
        let token = head.split(" ")[1];

        let decoded = decodeToken(token, res);
        if (res.headersSent) return;

        // The email from the body is not needed here, as the verified email is in the token.

        if (!body.name  || !body.password || !body.phone) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        let userToProcess = await userModel.create({
            name: body.name,
            email: decoded.email, // Use the verified email from the token
            password: hashedPassword,
            phone: body.phone
        });

        if (!userToProcess) {
            return res.status(400).json({
                message: "Something went wrong during user creation"
            });
        }

        res.status(200).json({
            message: "User registered successfully, please verify your email",
            
        })


    } catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
}



module.exports = { regController, verifyOtp,verifyEmail };
