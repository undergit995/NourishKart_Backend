const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    refundId: { // Razorpay's refund ID
        type: String,
        required: true,
        unique: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
    },
    cancellationFee: {
        type: Number,
        default: 0
    },
    notes: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Refund', refundSchema);