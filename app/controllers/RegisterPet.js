
const PetModel = require('../model/pet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserSignIn = require('../model/register');



exports.registerPet = async (req, res) => {
  const { name, breed, age, gender, color } = req.body;

  // Validate required fields
  if (!name || !breed || !age || !gender || !color) {
    return res.status(400).json({ message: 'Missing required fields for pet registration.' });
  }

  try {
    // Access owner's details from the decoded token
    
    const ownerId = req.user.id;
  

    const role=req.user.role
    if(role!="pet_owner")
    {
        res.status(403).json({message:"You are not authorised to use this feature"})
    }

    
    const owner = await UserSignIn.findById(ownerId);
    if(!owner)
    {
        res.status(404).json({message:"owner not found"})
    }
    const ownerName=owner.name
    console.log("owner bro", ownerName)  
    

    // Create a new pet record
    const newPet = new PetModel({
      owner_id: owner.custom_id,
      owner_name: ownerName, // Include owner_name
      name,
      breed,
      age,
      gender,
      color,
    });

    // console.log("New Pet:", newPet);

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
