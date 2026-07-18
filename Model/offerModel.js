

const mongoose = require('mongoose');



const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    product: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Product",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
  
    description: {
        type: String,
        required: true
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


const offerModel = mongoose.model("offer", offerSchema)
module.exports = offerModel  
