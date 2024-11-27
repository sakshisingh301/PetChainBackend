const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];


  // Check if the Authorization header is present
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];


  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');
    console.log("decoded payload : ", decoded)

    // Attach the decoded payload to req.user
    req.user = decoded; 
    
    // Example: { id: "OWNER_123", name: "Jane Doe", role: "pet_owner" }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
