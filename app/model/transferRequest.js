const mongoose = require("mongoose");

const transferRequestSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  currentOwnerEmail: { type: String, required: true },
  newOwnerEmail: { type: String, required: true },
  approvalToken: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending approval from New Owner", "Approved & Executed", "Rejected"],
    default: "Pending approval from New Owner",
  },
  createdAt: { type: Date, default: Date.now },
});

const TransferRequest = mongoose.model(
   "TransferRequest",
  transferRequestSchema
);

module.exports = TransferRequest;
