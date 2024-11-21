const express = require('express');
const RegisterController = require('../controllers/Register');
const router = express.Router();

router.post('/register', RegisterController.create);
router.post('/login', RegisterController.login);


module.exports = router;
