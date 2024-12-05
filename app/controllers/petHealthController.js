const PetHealth = require('../model/petHealth');

const multer = require('multer');
const path = require('path');

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer with storage configuration
const upload = multer({ storage });


// Create or Update Pet Health Record
const savePetHealth = async (req, res) => {
  const { petId, name, vaccinationRecords, allergies, pastTreatments, minorIllnessRecords } = req.body;

  try {
    let petHealth = await PetHealth.findOne({ petId });

    if (petHealth) {
      // Update existing record
      petHealth.name = name || petHealth.name;
      petHealth.vaccinationRecords = vaccinationRecords || petHealth.vaccinationRecords;
      petHealth.allergies = allergies || petHealth.allergies;
      petHealth.pastTreatments = pastTreatments || petHealth.pastTreatments;
      petHealth.minorIllnessRecords = minorIllnessRecords || petHealth.minorIllnessRecords;
    } else {
      // Create new record
      petHealth = new PetHealth({
        petId,
        name,
        vaccinationRecords,
        allergies,
        pastTreatments,
        minorIllnessRecords,
      });
    }

    await petHealth.save();
    res.status(201).json({ message: 'Pet health data saved successfully', petHealth });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Fetch Pet Health Data
const getPetHealth = async (req, res) => {
  const { petId } = req.params;

  try {
    const petHealth = await PetHealth.findOne({ petId });
    if (!petHealth) {
      return res.status(404).json({ message: 'Pet health data not found' });
    }
    res.status(200).json(petHealth);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  savePetHealth,
  getPetHealth,
  upload,
};
