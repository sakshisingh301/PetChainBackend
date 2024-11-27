const PetHealth = require("../model/petHealth");

// Add a vaccination record
exports.addVaccinationRecord = async (req, res) => {
  try {
    const { petId, vaccinationDate, vaccineType, nextDueDate, allergies, pastTreatments, minorIllnessRecords, vetId } = req.body;

    const newRecord = new PetHealth({
      petId,
      vaccinationDate,
      vaccineType,
      nextDueDate,
      allergies: allergies ? allergies.split(",") : [],
      pastTreatments: pastTreatments ? pastTreatments.split(",") : [],
      minorIllnessRecords: minorIllnessRecords ? minorIllnessRecords.split(",") : [],
      file: req.file ? req.file.filename : null,
      vetId,
    });

    await newRecord.save();
    res.status(200).json({ message: "Vaccination record added successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add vaccination record" });
  }
};

// Get all vaccination records
exports.getVaccinationRecords = async (req, res) => {
  try {
    const records = await PetHealth.find();
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve vaccination records" });
  }
};
