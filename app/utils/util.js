const axios=require('axios')
const UserSignIn = require("../model/register.js");

const storingOwnershipInResdb = async (owner_id,petId,ownershipHash,timestamp) => {
    const url = 'http://127.0.0.1:18000/v1/transactions/commit';
    const data = {
      id: owner_id,
      value: {
        "pet_id":petId,
        "ownershipHash":ownershipHash,
        "timeStamp":timestamp,
        "status":"active",
        "event": "register pet"
      },
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error committing transaction to Resdb:', error.response ? error.response.data : error.message);
    }
  };

  const getOwnershipFromResdb = async (ownerId) => {
    const url = `http://127.0.0.1:18000/v1/transactions/${ownerId}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
      return response.data; // Return the data for further use if needed
    } catch (error) {
      console.error(
        'Error fetching transaction from Resdb:',
        error.response ? error.response.data : error.message
      );
      throw error; // Rethrow the error to handle it in the caller function
    }
  };

  const storingLostEventInResdb = async (owner_id,petId,lostHash) => {
    const url = 'http://127.0.0.1:18000/v1/transactions/commit';
    const data = {
      id: owner_id,
      value: {
        "pet_id":petId,
        "lostHash":lostHash,
        "timeStamp": new Date().toISOString(),
        "status":"active",
        "event": "lost pet"
      },
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error committing transaction to Resdb:', error.response ? error.response.data : error.message);
    }
  };

  const storingFoundEventInResdb = async (owner_id,petId,foundHash) => {
    const url = 'http://127.0.0.1:18000/v1/transactions/commit';
    const data = {
      id: owner_id,
      value: {
        "pet_id":petId,
        "foundHash":foundHash,
        "timeStamp": new Date().toISOString(),
        "status":"active",
        "event": "found pet"
      },
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error committing transaction to Resdb:', error.response ? error.response.data : error.message);
    }
  };

  const getLostHashFromResdb = async (ownerId) => {
    const url = `http://127.0.0.1:18000/v1/transactions/${ownerId}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
      return response.data; // Return the data for further use if needed
    } catch (error) {
      console.error(
        'Error fetching transaction from Resdb:',
        error.response ? error.response.data : error.message
      );
      throw error; // Rethrow the error to handle it in the caller function
    }
  };

  const fetchCustomIdFromMongoDB = async (userEmail) => {
    try {
      const user = await UserSignIn.findOne({ email: userEmail });
      if (!user) {
        throw new Error("User not found in MongoDB.");
      }
      console.log("Fetched Custom ID:", user.custom_id);
      return user.custom_id;
    } catch (error) {
      console.error("Error fetching custom ID from MongoDB:", error.message);
      throw error;
    }
  };

  const fetchPetIdFromResDB = async (ownerId) => {
    try {
      const url = `http://127.0.0.1:18000/v1/transactions/${ownerId}`;
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.data && response.data.value) {
        const { pet_id } = response.data.value;
        console.log("Fetched Pet ID:", pet_id);
        return response.data.value; 
      } else {
        throw new Error("No pet details found for the owner in ResDB.");
      }
    } catch (error) {
      console.error("Error fetching pet ID from ResDB:", error.message);
      throw error;
    }
  };

  const storingOwnershipTransferEventInResdb = async (
    ownerId,
    petId,
    oldOwnerId,
    newOwnerId,
    transferHash
  ) => {
    const url = "http://localhost:18000/v1/transactions/commit";
    const data = {
      id: ownerId,
      value: {
        "pet_id": petId,
        "ownershipTransfer": {
          "oldOwnerId": oldOwnerId,
          "newOwnerId": newOwnerId,
        },
        "transferHash": transferHash,
        "timeStamp": new Date().toISOString(),
        "status": "completed",
        "event": "ownership transfer",
      },
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Ownership transfer event logged:", response.data);
    } catch (error) {
      console.error(
        "Error logging ownership transfer event:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to log ownership transfer event.");
    }
  };
  
  


  module.exports = { storingOwnershipInResdb,getOwnershipFromResdb,storingLostEventInResdb,storingFoundEventInResdb,getLostHashFromResdb, fetchCustomIdFromMongoDB, fetchPetIdFromResDB, storingOwnershipTransferEventInResdb };