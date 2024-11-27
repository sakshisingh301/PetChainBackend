const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  petId: { type: String, unique: true, required: false }, // Unique pet identifier
  owner_id: {
    type: String,
    ref: 'UserSignIn', // Reference the User model
    required: true,
  },
  owner_name: { type: String, required: false }, // Store owner's name
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  color: { type: String, required: true },
  distinctive_marks: { type: String, default: null },
  vaccination_records: { type: String, default: null },
  medical_history: { type: String, default: null },
  pet_photo:{type:String, default: null},
  is_lost:{type: Boolean,default:false,required:false},
  additional_info:{type:String,default:null,required:false}
}, { timestamps: true });

// // Middleware to generate unique petId
// petSchema.pre('save', function (next) {
//   if (this.isNew) {
//     this.petId = `PET_${new Date().getTime()}`; // Generate unique petId
//   }
//   next();
// });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
