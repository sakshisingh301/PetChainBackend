const express = require('express');
const authenticate = require('../middleware/authenticate'); // Authentication middleware
const { registerPet } = require('../controllers/RegisterPet');
 // Controller for registering pets
const {searchPet}=require('../controllers/PetSearch')

const router = express.Router();

// Route for pet registration (protected by the authenticate middleware)
router.post('/', authenticate, registerPet);
router.get('/search/:petId',searchPet)

module.exports = router;
