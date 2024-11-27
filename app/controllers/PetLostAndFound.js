const PetModel = require('../model/pet');
const crypto = require('crypto');
const {
  storingOwnershipInResdb,
  getOwnershipFromResdb,
  storingLostEventInResdb,
  storingFoundEventInResdb,
} = require('../utils/util');

// Helper function to generate event hash
const generateEventHash = (ownerId, petId, eventType) => {
  return crypto
    .createHash('sha256')
    .update(`${ownerId}${petId}${eventType}`)
    .digest('hex');
};

exports.petLostAndFound = async (req, res) => {
  const { petId } = req.params;
  const { is_lost, additional_info } = req.body;

  // Validate request body
  if (typeof is_lost !== 'boolean') {
    return res.status(400).json({ message: 'Invalid or missing "is_lost" field.' });
  }

  try {
    // Find the pet in MongoDB
    const pet = await PetModel.findOne({ petId });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }
    console.log('Pet details:', pet);

    // Update the pet's status in MongoDB
    pet.is_lost = is_lost;
    pet.additional_info = additional_info || null;
    pet.updatedAt = new Date();
    

    // Handle Lost or Found Event
    const ownerId = pet.owner_id;
    const eventType = is_lost ? 'lost' : 'found';
    const eventHash = generateEventHash(ownerId, pet.petId, eventType);
    //creating lost and found event logs into Resdb 
    if (is_lost) {
      await storingLostEventInResdb(ownerId, petId, eventHash);
    } else {
      await storingFoundEventInResdb(ownerId, petId, eventHash);
    }

    // Save the updated pet details in mongodb
    const updatedPet = await pet.save();

    // Send the response
    res.status(200).json({
      message: `Pet status updated successfully to "${eventType}"!`,
      pet: {
        petId: updatedPet.petId,
        is_lost: updatedPet.is_lost,
        additional_info: updatedPet.additional_info,
        updatedAt: updatedPet.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({ message: 'Error updating pet status.', error: error.message });
  }
};


