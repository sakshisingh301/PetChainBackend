const express = require('express');
const router = express.Router();
const TransferController = require('../controllers/Transfer.js'); 

router.post('/initiate-transfer', TransferController.initiateTransfer);

module.exports = router;
