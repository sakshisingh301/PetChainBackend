const PetModel = require('../model/pet');
const RegisterModel=require('../model/register')
const crypto = require('crypto');
const { getOwnershipFromResdb } =require('../utils/util')
const {
  storingLostEventInResdb,getLostHashFromResdb
} = require('../utils/util');

exports.searchPet = async (req, res) => {

    const { petId } = req.params;
    const generateEventHash = (ownerId, petId, eventType) => {
      return crypto
        .createHash('sha256')
        .update(`${ownerId}${petId}${eventType}`)
        .digest('hex');
    };

    try {
        // Find the pet by petId and populate owner details

        const pet = await PetModel.findOne({petId});
        const ownerId= pet.owner_id;
        const ownerName=pet.owner_name;
        const eventType="lost"
        const currentEventHash = generateEventHash(ownerId, petId, eventType);
        const resDbLostEventHash=await getLostHashFromResdb(ownerId); 
        const lostCal=resDbLostEventHash.value.lostHash;
        if(currentEventHash!=lostCal)
        {
          return res.status(404).json({ message: 'The pet that you are searching is not lost' });
        }
       
        if (!pet) {
          return res.status(404).json({ message: 'Pet not found.' });
        }
    
        // Respond with pet details
        res.status(200).json({
          message: 'Pet found!',
          pet: {
            petId: pet.petId,
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            gender: pet.gender,
            color: pet.color,
            distinctive_marks: pet.distinctive_marks,
             owner_name: ownerName
          },
        });
      } catch (error) {
        console.error('Error fetching pet details:', error);
        res.status(500).json({ message: 'An error occurred while searching for the pet.' });
      }
};

