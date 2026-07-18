const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
        },

        image: {
            type: [String],
            required: true,
        },

        rating: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
      
       
        isAvailable: {
            type: Boolean,
            default: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductCategory"
        }
    },
    {
        timestamps: true,
    }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;