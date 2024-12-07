const express = require('express');
const router = express.Router();
const TransferController = require('../controllers/Transfer.js'); 

router.get('/approve-transfer', TransferController.approveTransfer);
router.post('/initiate-transfer', TransferController.initiateTransfer);
router.get('/:ownerEmail', TransferController.getTransfers);

module.exports = router;
