const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true },
  petId: { type: String, required: true },
  policyNumber: { type: String, required: true },
  claimedAmount: { type: Number, required: true },
  treatmentType: { type: String, required: true },
  documents: [String], // Array of document links
  preApprovalStatus: { type: String, default: 'Pending' }, // Pending, Pre-Approved, Rejected
  approvalStatus: { type: String, default: 'Pending' }, // Pending, Approved, Denied
  preApprovedAmount: { type: Number, default: 0 },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claim', ClaimSchema);
