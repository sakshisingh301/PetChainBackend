const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Databse Connected Successfully!!");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});
app.get('/', (req, res) => {
    res.json({"message": "Hello Crud Node Express"});
});

const RegisterRoute = require('./app/routes/Register.js');
const PetRoute=require('./app/routes/pet.js');
const petHealthRoutes = require("./app/routes/petHealth.js");
const TransferRoute = require('./app/routes/transfer.js');
app.use('/api/auth', RegisterRoute);
app.use('/api/register/pets', PetRoute);
app.use('/api/pets',PetRoute);
app.use("/api/pet-health", petHealthRoutes);
app.use('/api/transfer', TransferRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});