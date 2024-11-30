const mongoose = require('mongoose');
const Insurance = require('../model/insurance'); // Import the Insurance model

// Add Existing Insurance
exports.addInsuranceToPetChain = async (req, res) => {
  const { petId, providerName, policyNumber, coverageAmount, validityPeriod } = req.body;

  // Validate input
  if (!petId || !providerName || !policyNumber || !coverageAmount || !validityPeriod) {
    return res.status(400).json({
      success: false,
      message: 'All fields (petId, providerName, policyNumber, coverageAmount, validityPeriod) are required.',
    });
  }

  try {
    // Create a new insurance record
    const insurance = new Insurance({
      petId,
      providerName,
      policyNumber,
      coverageAmount,
      validityPeriod,
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


