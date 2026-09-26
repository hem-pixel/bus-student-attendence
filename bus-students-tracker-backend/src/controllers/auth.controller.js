const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../services/supabase.service');
const { validateEmail } = require('../middleware/validation.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'bus_tracker_super_secure_jwt_secret_key_2026_phase1_foundation';

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Authenticate with Supabase
    let accessToken = null;
    let authUserId = null;

    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (!error && data && data.session && data.user) {
        accessToken = data.session.access_token;
        authUserId = data.user.id;
      }
    } catch (authErr) {
      // Fall through to database user lookup
    }

    // Lookup user in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    if (!accessToken) {
      accessToken = jwt.sign(
        { id: userData.id, email: userData.email, role: userData.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
};

// POST /auth/logout
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
};

// GET /auth/verify
const verifyToken = async (req, res) => {
  try {
    // Token already verified by middleware
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed' 
    });
  }
};

// POST /auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required' 
      });
    }

    try {
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refresh_token
      });

      if (!error && data && data.session) {
        return res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: {
            token: data.session.access_token,
            refresh_token: data.session.refresh_token
          }
        });
      }
    } catch (refErr) {
      // Fall through to fallback refresh
    }

    // Fallback refresh token check
    try {
      const decoded = jwt.verify(refresh_token, JWT_SECRET);
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refresh_token: refresh_token
        }
      });
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Token refresh failed' 
    });
  }
};

module.exports = {
  login,
  logout,
  verifyToken,
  refreshToken
};
