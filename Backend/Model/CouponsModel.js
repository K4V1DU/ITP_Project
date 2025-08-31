const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CouponSchema = new Schema({

    Code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    DiscountValue: {
        type: Number,
        required: true
    },

    MinAmount: {
        type: Number,
        required: true
    },

    UsageLimit: {
        type: Number,
        default: 1
    },

    UsageCount: {
        type: Number,
        default: 0
    },

    ExpiryDate: {
            type: Date,
            required: true
    },

    Active: {
        type: Boolean,
        required: true
    },

}, {timestamps: true});

module.exports = mongoose.model("Coupons",CouponSchema)