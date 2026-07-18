

const mongoose = require('mongoose');



const dealsSchema = new mongoose.Schema({
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "coupon",
        default: null
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "offer",
        default: null
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    ]
},
    {
        timestamps: true
    }
)


const dealsModel = mongoose.model("deals", dealsSchema)
module.exports = dealsModel  
