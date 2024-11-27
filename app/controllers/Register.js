const RegisterModel = require('../model/register');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Registering Vets,Petowner,insurance provider

exports.create = async (req, res) => {
  const { name, email, phone, password, role, additional_info } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate role
  if (!['pet_owner', 'vet', 'insurance_provider'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if email is already registered
    const existingUser = await RegisterModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Validate role-specific fields in additional_info
    if (role === 'vet' && !additional_info.license_number) {
      return res.status(400).json({ message: 'License number is required for vets.' });
    }
    if (role === 'insurance_provider' && !additional_info.registration_number) {
      return res.status(400).json({ message: 'Registration number is required for insurance providers.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object with the hashed password
    const registerUser = new RegisterModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      additional_info,
    });

    // Save the user to the database
    const data = await registerUser.save();

    res.status(201).send({
      message: `${role === 'vet' ? 'Vet' : role === 'pet_owner' ? 'Pet Owner' : 'Insurance Provider'} Registered successfully!`,
      registerUser: data,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: error.message || "Error creating user." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user exists
    const user = await RegisterModel.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload
      'yourSecretKey', // Secret key (should be stored in environment variables)
      { expiresIn: '1h' } // Token expiration
    );

    // Send success response
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.custom_id || user._id, // Use custom_id if available
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // JWT token for client to use
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login. Please try again later.' });
  }
};
