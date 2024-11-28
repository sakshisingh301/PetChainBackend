
const PetModel = require('../model/pet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserSignIn = require('../model/register');
const { storingOwnershipInResdb,getOwnershipFromResdb } =require('../utils/util')
const axios=require('axios')
const crypto = require('crypto');



exports.registerPet = async (req, res) => {
  const { name, breed, age, gender, color } = req.body;

  // Validate required fields
  if (!name || !breed || !age || !gender || !color) {
    return res.status(400).json({ message: 'Missing required fields for pet registration.' });
  }

  try {
    // Access owner's details from the decoded token
    const ownerIdMongo = req.user.id;
    const role=req.user.role
    if (role !== "pet_owner") {
      return res.status(403).json({ message: "You are not authorised to use this feature." });
    }
    const ownerDetails = await UserSignIn.findById(ownerIdMongo);
    if (!ownerDetails) {
      return res.status(404).json({ message: "Owner is not registered." });
    }
    const ownerName=ownerDetails.name
    const ownerCustomId=ownerDetails.custom_id
    const petId = `PET_${new Date().getTime()}`;


    // Create a new pet record
    const newPet = new PetModel({
      owner_id: ownerCustomId,
      owner_name: ownerName,
      petId:petId,
      name,
      breed,
      age,
      gender,
      color,
    });
    // const existingHash= await getOwnershipFromResdb(ownerCustomId)
    
    // if (existingHash.value.pet_id==petId) {
    //   throw new Error('Pet is already registered under another owner.');
    // }

    const ownershipHash = crypto.createHash('sha256').update(`${ownerCustomId}${petId}`).digest('hex');
    const timestamp = new Date().toISOString();
    console.log("OwnershipHash : ",ownershipHash)
    
    await storingOwnershipInResdb(ownerCustomId, petId, ownershipHash, timestamp);
  
    // Save the pet to the database
    const savedPet = await newPet.save();

    res.status(201).json({
      message: 'Pet registered successfully!',
      pet: savedPet,
    });
  } catch (error) {
    console.error('Error registering pet:', error);
    res.status(500).json({ message: 'An error occurred while registering the pet.' });
  }
};

exports.getPetDetails = async (req, res) => {
  const { ownerId } = req.params;

  // Validate input
  if (!ownerId) {
    return res.status(400).json({ message: 'Owner custom ID is required.' });
  }

  try {
    // Find owner details by custom ID
    const ownerDetails = await UserSignIn.findOne({ custom_id: ownerId });
    console.log("owner-details :",ownerDetails)

    if (!ownerDetails) {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    const ownerName = ownerDetails.name;

    // Find all pets registered to this owner
    const pets = await PetModel.find({ owner_id: ownerId });
    console.log("pets :",pets)

    if (!pets || pets.length === 0) {
      return res.status(404).json({ message: 'No pets found for this owner.' });
    }

    res.status(200).json({
      owner: {
        ownerId: ownerDetails.custom_id,
        owner_name: ownerName,
      },
      pets,
    });
  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({ message: 'An error occurred while fetching pet details.' });
  }
};








