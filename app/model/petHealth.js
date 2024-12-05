const mongoose = require('mongoose');

const petHealthSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  name: { type: String, required: true },
  vaccinationRecords: [
    {
      vaccinationDate: { type: Date, required: true },
      vaccineType: { type: String, required: true },
      nextDueDate: { type: Date },
      file: { type: String },
    },
  ],
  allergies: [{ type: String }],
  pastTreatments: [{ type: String }],
  minorIllnessRecords: [{ type: String }],
});

const PetHealth = mongoose.model('PetHealth', petHealthSchema);

module.exports = PetHealth;
