

const mongoose = require('mongoose');



const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "coupon",
    },
    discount: {
        type: String,
        default: ""
    },
    status:{
        type:String,
        default:"inActive",
        enum:["Active","inActive"]
    },

    image: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => arr.length <= 5,
            message: 'A banner cannot have more than 5 images.'
        }
    }

},
    {
        timestamps: true
    }
)


const bannerModel = mongoose.model("banner", bannerSchema)
module.exports = bannerModel  
