const PetHealth = require('../model/petHealth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

//const upload = multer({ storage,  });
// const upload = multer({ storage }).single('vaccinationRecords[0][file]'); // Change field name here
const upload = multer({ storage }).fields([
  { name: 'vaccinationRecords[0][file]', maxCount: 1 }, // Specify the field name and maxCount for the file
]);
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // limit file size (optional)
//   fileFilter: (req, file, cb) => {
    
//     cb(null, true);
//   },
// }).fields([
//   { name: 'vaccinationRecords[0][file]', maxCount: 1 },
// ]);

// Create or Update Pet Health Record
const savePetHealth = async (req, res) => {
  const { petId, name, vaccinationRecords, allergies, pastTreatments, minorIllnessRecords } = req.body;

  console.log("=== Incoming Request ===");
  console.log("Request Body:", req.body);
  console.log("Uploaded Files:", req.files);

  // Check for uploaded vaccination file
  const uploadedFile = req.files ? req.files['vaccinationRecords[0][file]']?.[0] : null;
  const uploadedFilePath = uploadedFile ? uploadedFile.path : null;

  try {
    console.log("Looking for existing Pet Health record...");
    let petHealth = await PetHealth.findOne({ petId });

    if (petHealth) {
      console.log("Updating existing Pet Health record...");
      petHealth.name = name || petHealth.name;
      petHealth.allergies = allergies || petHealth.allergies;
      petHealth.pastTreatments = pastTreatments || petHealth.pastTreatments;
      petHealth.minorIllnessRecords = minorIllnessRecords || petHealth.minorIllnessRecords;

      // Handle vaccinationRecords (optional)
      if (vaccinationRecords) {
        petHealth.vaccinationRecords = vaccinationRecords;
      }
      if (uploadedFilePath) {
        if (petHealth.vaccinationRecords.length > 0) {
          petHealth.vaccinationRecords[0].file = uploadedFilePath;
        } else {
          petHealth.vaccinationRecords.push({ file: uploadedFilePath });
        }
      }
    } else {
      console.log("Creating new Pet Health record...");
      petHealth = new PetHealth({
        petId,
        name,
        vaccinationRecords: vaccinationRecords
          ? vaccinationRecords.map(record => {
              if (uploadedFilePath && !record.file) {
                record.file = uploadedFilePath; // Add file path if missing
              }
              return record;
            })
          : uploadedFilePath
          ? [{ file: uploadedFilePath }]
          : [], // Optional vaccinationRecords
        allergies,
        pastTreatments,
        minorIllnessRecords,
      });
    }

    console.log("Saving Pet Health record...");
    await petHealth.save();
    console.log("Pet Health record saved successfully:", petHealth);

    res.status(201).json({ message: 'Pet health data saved successfully', petHealth });
  } catch (err) {
    console.error("Error saving Pet Health data:", err);
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
