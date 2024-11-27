require("dotenv").config(); // Load .env variables
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "localhost", // Default to localhost
  networks: {
    hardhat: {
      chainId: 31337, // Default chain ID for Hardhat's built-in network
    },
    localhost: {
      url: "http://127.0.0.1:8546",
      accounts: [`${process.env.PRIVATE_KEY}`], // Use private key for local account
    },
  },
};
