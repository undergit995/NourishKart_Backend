const transporter = require("../config/emailConfig");
const otpGenerator = require('otp-generator');


async function emailSender(userData){

      try{
        let otp = otpGenerator.generate(4, { digits:true,upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false })
        console.log(otp)
    
        let targetEmail = userData.email || userData;
        let targetName = userData.name || "User";
    
            const info = await transporter.sendMail({
                from: process.env.EMAIL,
                to: targetEmail,
                subject: "Welcome to Powerbites",
                text: `Welcome to Powerbites, ${targetName}! your verification code is ${otp}`,

            })

            // Return an object so the controller can access info.otp
            return { otp: otp };
      }
      catch(err){
        console.log(err)
      }
}

module.exports = emailSender;