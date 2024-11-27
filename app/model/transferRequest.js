const mongoose = require("mongoose");

const transferRequestSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  currentOwnerEmail: { type: String, required: true },
  newOwnerEmail: { type: String, required: true },
  approvalToken: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const TransferRequest = mongoose.model(
   "TransferRequest",
  transferRequestSchema
);

module.exports = TransferRequest;
