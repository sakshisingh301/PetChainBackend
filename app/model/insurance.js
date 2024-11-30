const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema({
  petId: { type: String, required: true }, // Link to the pet's unique ID
  providerName: { type: String, required: true },
  policyNumber: { type: String, required: true, unique: true },
  coverageAmount: { type: Number, required: true },
  validityPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Insurance', InsuranceSchema);
