const axios=require('axios')

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


  module.exports = { storingOwnershipInResdb,getOwnershipFromResdb,storingLostEventInResdb,storingFoundEventInResdb,getLostHashFromResdb };