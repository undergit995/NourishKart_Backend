const mailer = require('nodemailer');

const transporter = mailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    
    }
})
module.exports = transporter;