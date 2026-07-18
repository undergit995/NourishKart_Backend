let mongoose = require("mongoose");

async function ConnectDB(){
    try{
       await mongoose.connect(process.env.ATLAS)
       console.log("connected to DB")
    }
    catch(err){
        console.error("problem connecting to DB:", err.message)
    }
}
module.exports= ConnectDB                   