const mongoose = require("mongoose");

const petHealthSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  vaccinationDate: { type: Date, required: true },
  vaccineType: { type: String, required: true },
  nextDueDate: { type: Date, required: true },
  allergies: [String],
  pastTreatments: [String],
  minorIllnessRecords: [String],
  file: { type: String },
  vetId: { type: String },
});

const PetHealth = mongoose.model("PetHealth", petHealthSchema);

module.exports = PetHealth;
