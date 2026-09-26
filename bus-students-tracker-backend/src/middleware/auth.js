const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'No token provided. Please include Authorization header: Bearer <token>' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Attempt verification using JWT_SECRET or SUPABASE_KEY / SUPABASE_JWT_SECRET
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_KEY || 'default_secret_key_change_in_production';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user claims (e.g. id, email, role)
    req.user = decoded;
    next();
  } catch (error) {
    // If token verification fails
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token.', 
      details: error.message 
    });
  }
};

module.exports = { verifyToken };
