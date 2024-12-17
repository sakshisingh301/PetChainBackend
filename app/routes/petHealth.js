const express = require('express');
const router = express.Router();
const { savePetHealth, getPetHealth, upload } = require('../controllers/petHealthController');

// Route for saving pet health data, including file upload
//router.post('/save', upload.single('healthFile'), savePetHealth);
router.post('/save', upload, savePetHealth);

router.get('/:petId', getPetHealth);

module.exports = router;