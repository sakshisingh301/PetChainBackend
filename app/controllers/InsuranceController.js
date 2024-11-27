const mongoose = require('mongoose');
const Insurance = require('../model/insurance'); // Import the Insurance model
const PetModel=require('../model/pet')
const claim=require('../model/claim');
const { deployAndExecute } = require("../contracts/deployAndExecute");
const { BigNumber } = require("ethers");

// Add Existing Insurance
exports.addInsuranceToPetChain = async (req, res) => {
  const { petId, providerName, policyNumber, coverageAmount, validityPeriod, ownerId } = req.body;

  // Validate request body
  if (!petId || !ownerId || !providerName || !policyNumber || !coverageAmount || !validityPeriod) {
    return res.status(400).json({
      success: false,
      message: "All fields (petId, ownerId, providerName, policyNumber, coverageAmount, validityPeriod) are required.",
    });
  }

  try {
    // Check if pet belongs to the owner
    const pets = await PetModel.find({ owner_id: ownerId });
    if (pets[0]?.petId !== petId) {
      return res.status(404).json({
        success: false,
        message: "You are not eligible to add insurance for this petId.",
      });
    }

    // Save insurance record in the database
    const insurance = new Insurance({
      petId,
      providerName,
      policyNumber,
      coverageAmount,
      validityPeriod,
      claimId: `CLAIM_${new Date().getTime()}`,
    });

    await insurance.save();
    console.log("Insurance saved to database:", insurance);

    // Prepare arguments for the addPolicyToPetChain function
    const addPolicyToPetChainArgs = JSON.stringify([
      petId,
      ownerId,
      providerName,
      policyNumber,
      coverageAmount,
      Math.floor(new Date(validityPeriod.startDate).getTime() / 1000),
      Math.floor(new Date(validityPeriod.endDate).getTime() / 1000),
    ]);
    console.log("addPolicyToPetChain args:", addPolicyToPetChainArgs);

    // Call the addPolicyToPetChain function
    const addPolicyToPetChainResult = await deployAndExecute(
      "addPolicyToPetChain",
      addPolicyToPetChainArgs
    );
    console.log("addPolicyToPetChain result:", addPolicyToPetChainResult);

    // Prepare arguments for the addPolicy function
    const addPolicyArgs = JSON.stringify([
      policyNumber,
      coverageAmount,
      Math.floor(new Date(validityPeriod.startDate).getTime() / 1000),
      Math.floor(new Date(validityPeriod.endDate).getTime() / 1000),
      ["Dental", "Accidental", "Illness"], // Example coverageTypes
      ["1000", "5000", "2000"], // Example coverageLimits
      ["50", "100", "75"], // Example deductibles
      ["Annual", "Per Event", "Annual"], // Example limits
      ["Cosmetic Procedures", "Pre-existing Conditions"], // Example notCoveredInPolicy
    ]);
    console.log("addPolicy args:", addPolicyArgs);

    // Call the addPolicy function
    const addPolicyResult = await deployAndExecute("addPolicy", addPolicyArgs);
    console.log("addPolicy result:", addPolicyResult);

    return res.status(201).json({
      success: true,
      message: "Insurance added successfully to PetChain and policy mapped.",
      addPolicyToPetChainResult,
      addPolicyResult,
      data: insurance,
    });
  } catch (error) {
    console.error("Error adding insurance:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding insurance and mapping policy.",
    });
  }
};

// Fetch All Insurance Policies (Optional Example)
exports.submitAndProcessTheClaim = async (req, res) => {
  const { petId, claimId, claimedAmount, treatmentType, documents } = req.body;

  // Validate request body
  if (!petId || !claimId || !claimedAmount || !treatmentType || !documents) {
    return res.status(400).json({
      success: false,
      message: 'All fields (petId, claimId, claimedAmount, treatmentType, documents) are required.',
    });
  }

  try {
    // Retrieve the policy for the given pet ID
    const insuranceRecord = await Insurance.findOne({ petId });
    if (!insuranceRecord) {
      return res.status(404).json({
        success: false,
        message: "No insurance policy found for the provided pet ID.",
      });
    }

    // Prepare arguments for `preApproval` function (tuple format)
    const preApprovalArgs = JSON.stringify({
      petId,
      claimId,
      claimedAmount: parseInt(claimedAmount), // Ensure it's an integer
      treatmentType,
      documents,
    });

    console.log("Calling preApproval with args:", preApprovalArgs);

    // Call `preApproval` function on the smart contract
    const preApprovalResponse = await deployAndExecute("preApproval", preApprovalArgs);
    console.log("preApproval response:", preApprovalResponse);

    // Extract the preApprovalStatus from the event response
    if (preApprovalResponse.preApprovalStatus !== "success") {
      return res.status(400).json({
        success: false,
        message: "Claim pre-approval failed.",
      });
    }

    // Prepare arguments for `approval` function
    const approvalArgs = JSON.stringify([claimId, petId]);
    console.log("Calling approval with args:", approvalArgs);

    // Call `approval` function on the smart contract
    const approvalResponse = await deployAndExecute("approval", approvalArgs);
    console.log("approval response:", approvalResponse);

    // Extract approvalStatus and reimbursedAmount from the event response
    const { approvalStatus, reimbursedAmount } = approvalResponse;

    // Return the final status and reimbursed amount
    return res.status(200).json({
      success: true,
      status: approvalStatus === "success" ? "accept" : "decline",
      reimbursedAmount: approvalStatus === "success" ? reimbursedAmount : 0,
      claimId: claimId,
      petId: petId,
    });
  } catch (error) {
    console.error("Error processing claim:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the claim.",
    });
  }
};


