const mongoose = require('mongoose');
const Insurance = require('../model/insurance'); // Import the Insurance model
const PetModel=require('../model/pet')
const claim=require('../model/claim');

// Add Existing Insurance
exports.addInsuranceToPetChain = async (req, res) => {
  const { petId, providerName, policyNumber, coverageAmount, validityPeriod,ownerId } = req.body;

  // Validate input
  if (!petId ||!ownerId|| !providerName || !policyNumber || !coverageAmount || !validityPeriod) {
    return res.status(400).json({
      success: false,
      message: 'All fields (petId,ownerId, providerName, policyNumber, coverageAmount, validityPeriod) are required.',
    });
  }
  const pets = await PetModel.find({ owner_id: ownerId });
  console.log("petId from database for this owner :", pets.petId)
  console.log("petid provided by user:",petId)
  console.log("pets:", pets)

  if(pets[0]?.petId!=petId)
  {
    return res.status(404).json({
        success: false,
        message: 'you are not eligible to add claim for this petId.',

    })
  }

  claimId=`CLAIM_${new Date().getTime()}`;
  

  try {
    // Create a new insurance record
    const insurance = new Insurance({
      petId,
      providerName,
      policyNumber,
      coverageAmount,
      validityPeriod,
      claimId
    });

    // Save to database
    await insurance.save();
    console.log("insurance details:", insurance)

    return res.status(201).json({
      success: true,
      message: 'Insurance added successfully',
      data: insurance,
    });
  } catch (error) {
    console.error('Error adding insurance:', error);

    // Handle duplicate policy number error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Policy number must be unique. This policy already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while adding insurance.',
    });
  }
};

// Fetch All Insurance Policies (Optional Example)
exports.getAllInsurance = async (req, res) => {
  try {
    const insuranceRecords = await Insurance.find();
    return res.status(200).json({
      success: true,
      data: insuranceRecords,
    });
  } catch (error) {
    console.error('Error fetching insurance records:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching insurance records.',
    });
  }
};

exports.submitAndProcessTheClaim = async (req, res) => {
    const { petId, claimId, claimedAmount, treatmentType, documents } = req.body;
    if (!petId || !claimId || !claimedAmount || !treatmentType || !documents) {
        return res.status(400).json({
          success: false,
          message: 'All fields (petId, claimId, claimedAmount, treatmentType, documents) are required.',
        });
      }

      const claimsForThePet=await Insurance.findOne({ claimId }); 
      console.log("claims for Pets:",claimsForThePet)
      const petIdFromDb=claimsForThePet.petId
      if(petIdFromDb!=petId)
      {
        return res.status(404).json({
            sucess: false,
            message: 'There is no claim added to the petchain for this petId'
        })
      }
     
      if(!claimsForThePet)
      {
        return res.status(404).json({
            sucess:false,
            message:"First add the existing insurance to the PetChain"
        })
      }
      //logic for preapproval
      //logic for approval 
      





    
}

