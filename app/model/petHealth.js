const mongoose = require('mongoose');

const petHealthSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  name: { type: String},
  vaccinationRecords: [
    {
      vaccinationDate: { type: Date, required: true },
      vaccineType: { type: String, required: true },
      nextDueDate: { type: Date },
      file: { type: String }, // File path or URL to the uploaded file
    },
  ],
  allergies: [{ type: String }],
  pastTreatments: [{ type: String }],
  minorIllnessRecords: [{ type: String }],
});

// Index to speed up queries by petId
// petHealthSchema.index({ petId: 1 });

const PetHealth = mongoose.model('PetHealth', petHealthSchema);

module.exports = PetHealth;
