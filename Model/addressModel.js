const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    label: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },

    street: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    pincode: {
        type: Number,
        required: true
    },

    country: {
        type: String,
        default: "India"
    },

    isDefault: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Same user cannot have duplicate labels
addressSchema.index(
    { userId: 1, label: 1 },
    { unique: true }
);

const addressModel = mongoose.model("Address", addressSchema);

module.exports = addressModel;