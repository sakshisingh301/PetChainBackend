const express = require('express');
const authenticate = require('../middleware/authenticate'); // Authentication middleware
const { registerPet } = require('../controllers/RegisterPet');
 // Controller for registering pets
const {searchPet}=require('../controllers/PetSearch')
const{petLostAndFound}=require('../controllers/PetLostAndFound')
const {notifyOwner,getNotifications,markNotificationAsRead}=require('../controllers/NotificationOwner')

const router = express.Router();

// Route for pet registration (protected by the authenticate middleware)
router.post('/', authenticate, registerPet);
router.get('/search/:petId',searchPet);
router.post('/status/:petId',petLostAndFound);
router.post('/notify-owner',notifyOwner)
router.get('/notifications',authenticate,getNotifications)
router.patch('/notifications/:id',authenticate, markNotificationAsRead);


module.exports = router;
