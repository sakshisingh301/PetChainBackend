const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { addVaccinationRecord, getVaccinationRecords } = require("../controllers/petHealthController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to add vaccination record (POST)
router.post("/vaccination", upload.single("file"), addVaccinationRecord);

// Route to get vaccination records (GET)
router.get("/vaccinations", getVaccinationRecords);

module.exports = router;
