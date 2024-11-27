const mongoose = require('mongoose');

const signInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['pet_owner', 'vet', 'insurance_provider'],
    },
    custom_id: { type: String, unique: true },
    additional_info: {
      address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zipcode: { type: String, required: false },
      },
      license_number: { type: String, required: false, default: null },
      clinic_name: { type: String, required: false, default: null },
      specialization: { type: String, required: false, default: null },
      registration_number: { type: String, required: false, default: null },
      services_offered: { type: [String], required: false, default: null },
    },
  },
  { timestamps: true }
);
signInSchema.pre('save', async function (next) {
  if (this.isNew) {
    const rolePrefix = this.role === 'vet' ? 'VET' : this.role === 'pet_owner' ? 'OWNER' : 'PROVIDER';
    this.custom_id = `${rolePrefix}_${new Date().getTime()}`;
  }
  next();
});

const UserSignIn = mongoose.model('UserSignIn', signInSchema);

module.exports = UserSignIn;
