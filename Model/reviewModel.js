const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
        required: true
    },

    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    userId:{
            type:mongoose.Schema.Types.ObjectId,    
            ref:"users",
            required:true
        },
},
{
    timestamps: true
});

const ReviewModel = mongoose.model("reviews", reviewSchema);
module.exports = ReviewModel;