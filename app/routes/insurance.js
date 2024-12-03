const express = require('express');
const {addInsuranceToPetChain,submitAndProcessTheClaim}=require("../controllers/InsuranceController")



const router = express.Router();

// Route for pet registration (protected by the authenticate middleware)


router.post('/claim/add',addInsuranceToPetChain)
router.post('/claim/submit',submitAndProcessTheClaim)




module.exports = router;
