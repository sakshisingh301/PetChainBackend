const { ethers } = require("ethers");
require("dotenv").config();

const deployAndExecute = async (functionName, args) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL); // Local network
    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY, // Replace with funded private key
      provider
    );

    const contractAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract address
    const abi = [
      "event PreApprovalResult(string preApprovalStatus, string petId, string claimId, uint256 claimedAmount)",
      "event ApprovalResult(string approvalStatus, string claimId, string petId, string ownerId, uint256 reimbursedAmount)",
      "function addPolicyToPetChain(string petId, string ownerId, string providerName, string policyNumber, uint256 coverageAmount, uint256 startDate, uint256 endDate)",
      "function addPolicy(string policyNumber, uint256 totalCoverage, uint256 startDate, uint256 endDate, string[] coverageTypes, string[] coverageLimits, string[] deductibles, string[] limits, string[] notCoveredInPolicy)",
      "function preApproval((string petId, string claimId, uint256 claimedAmount, string treatmentType, string[] documents))",
      "function approval(string claimId, string petId)",
    ];

    const contract = new ethers.Contract(contractAddress, abi, wallet);
    console.log(`Calling function ${functionName} with args:`, JSON.parse(args));

    if (functionName === "preApproval") {
      const tupleArgs = JSON.parse(args);

      // Send the transaction
      const tx = await contract.preApproval(tupleArgs);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Extract the event data
      const event = receipt.events?.find((e) => e.event === "PreApprovalResult");
      if (event) {
        const { preApprovalStatus, petId, claimId, claimedAmount } = event.args;
        return {
          preApprovalStatus,
          petId,
          claimId,
          claimedAmount: claimedAmount.toString(),
        };
      }

      throw new Error("PreApprovalResult event not found in transaction receipt.");
    }

    if (functionName === "approval") {
      const [claimId, petId] = JSON.parse(args);

      // Send the transaction
      const tx = await contract.approval(claimId, petId);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Extract the event data
      const event = receipt.events?.find((e) => e.event === "ApprovalResult");
      if (event) {
        const { approvalStatus, claimId, petId, ownerId, reimbursedAmount } = event.args;
        return {
          approvalStatus,
          claimId,
          petId,
          ownerId,
          reimbursedAmount: reimbursedAmount.toString(),
        };
      }

      throw new Error("ApprovalResult event not found in transaction receipt.");
    }

    // For other functions
    const tx = await contract[functionName](...JSON.parse(args));
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return {
      contractAddress,
      transactionHash: tx.hash,
    };
  } catch (error) {
    console.error("Error interacting with the smart contract:", error);
    throw error;
  }
};

module.exports = {
  deployAndExecute,
};
