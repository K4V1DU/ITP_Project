const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SharedCouponSchema = new Schema(
  {
    couponId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Coupons", 
      required: true 
    },

    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Users", 
      required: true 
    },

    sharedDate: { 
      type: Date, 
      default: Date.now 
    }
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("SharedCoupons", SharedCouponSchema);
