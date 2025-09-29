const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeliveryAssignmentSchema = new Schema(
  {
    OrderID: { type: String, required: true, unique: true },
    DeliveryAgentID: { type: String, required: true },
    AssignedAt: { type: Date, default: Date.now },
    Status: {
      type: String,
      enum: ["Assigned", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Assigned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryAssignment", DeliveryAssignmentSchema);
