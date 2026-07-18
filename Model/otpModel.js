const mongoose = require('mongoose');



const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: "5m" 
    }
})

const otpModel = mongoose.model("otp", otpSchema)
module.exports = otpModel