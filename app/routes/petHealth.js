const express = require('express');
const router = express.Router();
const { savePetHealth, getPetHealth, upload } = require('../controllers/petHealthController');

// Route for saving pet health data, including file upload
router.post('/save', upload.single('healthFile'), savePetHealth);
//app.post('/api/pet-health/save', petHealthController.savePetHealth);
// Route for getting pet health data
router.get('/:petId', getPetHealth);

module.exports = router;