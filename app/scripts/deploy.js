const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("API_URL:", process.env.API_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);

  // Get the contract factory
  const ContractFactory = await hre.ethers.getContractFactory("insurance"); // Replace "Insurance" with your contract name

  // Deploy the contract
  const contract = await ContractFactory.deploy();

  // Wait for the contract to be deployed
  await contract.deployed();

  // Print the deployed contract address
  console.log("Contract deployed to address:", contract.address);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });