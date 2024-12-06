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

  // Ensure the uploaded file path is correctly retrieved
  //const uploadedFilePath = req.files ? req.files['vaccinationRecords[0][file]']?.[0]?.path : null;
  //const uploadedFilePath=1;
  const uploadedFile = req.files ? req.files['vaccinationRecords[0][file]']?.[0] : null;

  // If a file was uploaded, save the file path
  const uploadedFilePath = uploadedFile ? uploadedFile.path : null;
  try {
    let petHealth = await PetHealth.findOne({ petId });

    if (petHealth) {
      // Update existing record-check here
      petHealth.name = name || petHealth.name;
      petHealth.vaccinationRecords = vaccinationRecords || petHealth.vaccinationRecords;
      if (uploadedFilePath) {
        petHealth.vaccinationRecords[0].file = uploadedFilePath; 
      }

      petHealth.allergies = allergies || petHealth.allergies;
      petHealth.pastTreatments = pastTreatments || petHealth.pastTreatments;
      petHealth.minorIllnessRecords = minorIllnessRecords || petHealth.minorIllnessRecords;
    } else {
      // Create new record
      petHealth = new PetHealth({
        petId,
        name,
        vaccinationRecords: vaccinationRecords ? vaccinationRecords.map(record => {
          if (uploadedFilePath && !record.file) {
            record.file = uploadedFilePath; // Add file path if missing
          }
          return record;
        }) : [{ file: uploadedFilePath }], // Add new record with file path if needed
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
