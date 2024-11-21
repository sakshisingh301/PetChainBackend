const PetModel = require('../model/pet');
const RegisterModel=require('../model/register')
exports.searchPet = async (req, res) => {

    const { petId } = req.params;

    try {
        // Find the pet by petId and populate owner details
        console.log("------------------------------------")
        const pet = await PetModel.findOne({petId});
        const ownerId= pet.owner_id;
        const ownerName=pet.owner_name;
        console.log("Owner name is ", ownerName)
        // const ownerInfo=await RegisterModel.findById(ownerId);
        // const owner_name=ownerInfo.owner_name;
        

        console.log("pet is",pet)
  
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
            distinctive_marks: pet.distinctive_marks
            // owner_name: owner_name
          },
        });
      } catch (error) {
        console.error('Error fetching pet details:', error);
        res.status(500).json({ message: 'An error occurred while searching for the pet.' });
      }
};