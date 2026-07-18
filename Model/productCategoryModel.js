const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        description: {
            type: String,
            required: true,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const ProductCategoryModel = mongoose.model( "ProductCategory", productCategorySchema);

module.exports = ProductCategoryModel;