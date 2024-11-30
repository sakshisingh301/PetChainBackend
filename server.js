const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const cors = require('cors');

// Allow all origins or specify the frontend origin
const corsOptions = {
  origin: 'http://localhost:3001', // React frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log("Database Connected Successfully!!");
    })
    .catch(err => {
        console.error('Could not connect to the database', err);
        process.exit(1);
    });
app.get('/', (req, res) => {
    res.json({"message": "Hello Crud Node Express"});
});

const RegisterRoute = require('./app/routes/Register.js');
const PetRoute=require('./app/routes/pet.js');
const petHealthRoutes = require("./app/routes/petHealth.js");
const TransferRoute = require('./app/routes/transfer.js');
const insuranceRoute=require('./app/routes/insurance.js')
app.use('/api/auth', RegisterRoute);
app.use('/api/register/pets', PetRoute);
app.use('/api/pets',PetRoute);
app.use("/api/pet-health", petHealthRoutes);
app.use('/api/transfer', TransferRoute);
app.use('/api/insurance',insuranceRoute)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});