const mongoose = require("mongoose");
const developerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    image: String
});

const DevelpoerModel = mongoose.model("developers", developerSchema);
module.exports=DevelpoerModel;